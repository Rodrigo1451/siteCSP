/* ============================================
   COMERCIAL SAO PEDRO - main.js
   ============================================ */

(function () {
    'use strict';

    // ===== ANO DINÂMICO =====
    const anoEl = document.getElementById('ano');
    if (anoEl) anoEl.textContent = new Date().getFullYear();

    // ===== MENU MOBILE =====
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav-principal');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Abrir menu');
                }
            });
        });
    }

    // ===== SCROLLSPY =====
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    const sections = Array.from(navLinks)
        .map(function (link) {
            const id = link.getAttribute('href');
            return id && id.length > 1 ? document.querySelector(id) : null;
        })
        .filter(Boolean);

    function updateActiveNav() {
        const scrollY = window.scrollY + 120;
        let activeId = null;
        sections.forEach(function (section) {
            if (section.offsetTop <= scrollY) activeId = '#' + section.id;
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === activeId);
        });
    }

    if (sections.length) {
        window.addEventListener('scroll', throttle(updateActiveNav, 100), { passive: true });
        updateActiveNav();
    }

    // ===== SCROLL REVEAL =====
    const revealTargets = document.querySelectorAll(
        '.section-head, .empresa-text, .values-grid, .value-card, .produto-card, .noticia-card, .solucoes-content, .solucoes-visual, .contato-info, .contato-form, .marca-item, .footer-cta-content, .mascot-wrap, .newsletter-content, .newsletter-form, .hero-mascot'
    );

    revealTargets.forEach(function (el) { el.classList.add('reveal'); });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealTargets.forEach(function (el) { io.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('visible'); });
    }

    // ===== PRODUTOS: BUSCA + FILTROS =====
    const busca = document.getElementById('busca');
    const chips = document.querySelectorAll('.chip');
    const cards = document.querySelectorAll('#produtosGrid .produto-card');
    const empty = document.getElementById('produtosEmpty');
    let filtroAtivo = 'todos';

    function aplicarFiltros() {
        const termo = (busca ? busca.value.trim().toLowerCase() : '');
        let visiveis = 0;

        cards.forEach(function (card) {
            const cat = card.getAttribute('data-cat') || '';
            const nome = (card.getAttribute('data-nome') || '').toLowerCase();
            const matchCat = filtroAtivo === 'todos' || cat === filtroAtivo;
            const matchTermo = !termo || nome.indexOf(termo) !== -1;

            if (matchCat && matchTermo) {
                card.style.display = '';
                visiveis++;
            } else {
                card.style.display = 'none';
            }
        });

        if (empty) empty.hidden = visiveis > 0;
    }

    if (chips.length) {
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
                chip.setAttribute('aria-pressed', 'true');
                filtroAtivo = chip.getAttribute('data-filter');
                aplicarFiltros();
            });
        });
    }

    if (busca) {
        busca.addEventListener('input', debounce(aplicarFiltros, 200));
    }

    // ===== FORM CONTATO =====
    const form = document.getElementById('contatoForm');

    if (form) {
        const successMsg = document.getElementById('formSuccess');

        const fields = [
            {
                id: 'nome',
                validate: function (v) {
                    if (!v.trim()) return 'Informe seu nome completo.';
                    if (v.trim().length < 3) return 'Nome deve ter ao menos 3 caracteres.';
                    return '';
                }
            },
            {
                id: 'email',
                validate: function (v) {
                    if (!v.trim()) return 'Informe seu e-mail.';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido. Verifique e tente novamente.';
                    return '';
                }
            },
            {
                id: 'telefone',
                validate: function (v) {
                    if (!v.trim()) return 'Informe seu telefone ou WhatsApp.';
                    const digits = v.replace(/\D/g, '');
                    if (digits.length < 10 || digits.length > 11) return 'Telefone deve ter 10 ou 11 dígitos com DDD.';
                    return '';
                }
            },
            {
                id: 'cidade',
                validate: function (v) {
                    if (!v.trim()) return 'Informe sua cidade.';
                    if (v.trim().length < 2) return 'Cidade muito curta.';
                    return '';
                }
            },
            {
                id: 'mensagem',
                validate: function (v) {
                    if (!v.trim()) return 'Escreva sua mensagem.';
                    if (v.trim().length < 10) return 'Mensagem deve ter ao menos 10 caracteres.';
                    return '';
                }
            }
        ];

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            let firstInvalid = null;
            let hasError = false;

            fields.forEach(function (f) {
                const el = document.getElementById(f.id);
                const err = document.getElementById('erro-' + f.id);
                if (!el) return;
                const msg = f.validate(el.value);
                if (msg) {
                    hasError = true;
                    el.classList.add('error');
                    el.setAttribute('aria-invalid', 'true');
                    if (err) err.textContent = msg;
                    if (!firstInvalid) firstInvalid = el;
                } else {
                    el.classList.remove('error');
                    el.removeAttribute('aria-invalid');
                    if (err) err.textContent = '';
                }
            });

            if (hasError) {
                if (firstInvalid) firstInvalid.focus();
                if (successMsg) successMsg.style.display = 'none';
                return;
            }

            // ===== ENVIO PARA O WHATSAPP DA LOJA =====
            var WHATSAPP_NUM = '5511973947185';
            function campo(id) {
                var el = document.getElementById(id);
                return el ? el.value.trim() : '';
            }
            var assuntoEl = document.getElementById('assunto');
            var assuntoTxt = (assuntoEl && assuntoEl.value)
                ? assuntoEl.options[assuntoEl.selectedIndex].text
                : 'Não informado';

            var texto = [
                '*Novo contato pelo site — Comercial São Pedro*',
                '',
                '*Nome:* ' + campo('nome'),
                '*E-mail:* ' + campo('email'),
                '*Telefone:* ' + campo('telefone'),
                '*Cidade:* ' + campo('cidade'),
                '*Assunto:* ' + assuntoTxt,
                '',
                '*Mensagem:*',
                campo('mensagem')
            ].join('\n');

            var whatsUrl = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(texto);
            window.open(whatsUrl, '_blank', 'noopener');

            if (successMsg) {
                successMsg.style.display = 'flex';
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            form.reset();

            setTimeout(function () {
                if (successMsg) successMsg.style.display = 'none';
            }, 8000);
        });

        fields.forEach(function (f) {
            const el = document.getElementById(f.id);
            if (!el) return;
            el.addEventListener('blur', function () {
                if (!el.classList.contains('error')) return;
                const err = document.getElementById('erro-' + f.id);
                const msg = f.validate(el.value);
                if (!msg) {
                    el.classList.remove('error');
                    el.removeAttribute('aria-invalid');
                    if (err) err.textContent = '';
                }
            });
        });

        const tel = document.getElementById('telefone');
        if (tel) {
            tel.addEventListener('input', function () {
                let v = tel.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 6) {
                    tel.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
                } else if (v.length > 2) {
                    tel.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
                } else {
                    tel.value = v;
                }
            });
        }
    }

    // ===== NEWSLETTER =====
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = document.getElementById('newsEmail');
            const val = input.value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                input.style.borderColor = '#C5221F';
                input.focus();
                return;
            }
            input.style.borderColor = '';
            const btn = newsForm.querySelector('button[type="submit"]');
            const orig = btn.textContent;
            btn.textContent = 'Inscrito ✓';
            btn.disabled = true;
            newsForm.reset();
            setTimeout(function () {
                btn.textContent = orig;
                btn.disabled = false;
            }, 3500);
        });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length <= 1) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const header = document.querySelector('.header');
            const headerHeight = (header ? header.offsetHeight : 0) + 12;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        });
    });

    // ===== UTILITÁRIOS =====
    function throttle(fn, wait) {
        let inThrottle = false;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(function () { inThrottle = false; }, wait);
            }
        };
    }

    function debounce(fn, wait) {
        let timeout;
        return function () {
            const args = arguments;
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(function () { fn.apply(context, args); }, wait);
        };
    }
})();
