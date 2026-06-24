/* ============================================
   COMERCIAL SÃO PEDRO — main.js v2
   Premium · Animated · Responsive
   ============================================ */

(function () {
    'use strict';

    // ===== ANO DINÂMICO =====
    const anoEl = document.getElementById('ano');
    if (anoEl) anoEl.textContent = new Date().getFullYear();

    // ===== SCROLL PROGRESS BAR =====
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.prepend(progressBar);

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });

    // ===== HEADER: GLASSMORPHISM ON SCROLL =====
    const header = document.querySelector('.header');

    function updateHeader() {
        if (!header) return;
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

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

        // Close nav on outside click
        document.addEventListener('click', function (e) {
            if (nav.classList.contains('open') &&
                !nav.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                nav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu');
            }
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
        const scrollY = window.scrollY + 100;
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

    // ===== COUNTER ANIMATION =====
    function animateCounter(el, target, suffix, duration) {
        suffix = suffix || '';
        duration = duration || 1400;
        const start = performance.now();
        const startVal = 0;

        function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(startVal + (target - startVal) * eased);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function initCounters() {
        const stats = document.querySelectorAll('.stat strong, .catalogo-num strong');
        stats.forEach(function (el) {
            const text = el.textContent.trim();
            const num = parseInt(text.replace(/\D/g, ''), 10);
            const suffix = text.replace(/[\d]/g, '');
            if (isNaN(num)) return;
            el.dataset.target = num;
            el.dataset.suffix = suffix;
            el.dataset.animated = 'false';
        });
    }

    function triggerCounters(entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.animated === 'true') return;
            el.dataset.animated = 'true';
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            animateCounter(el, target, suffix, 1600);
            counterObserver.unobserve(el);
        });
    }

    initCounters();

    const counterObserver = new IntersectionObserver(triggerCounters, {
        threshold: 0.4
    });

    document.querySelectorAll('.stat strong, .catalogo-num strong').forEach(function (el) {
        if (el.dataset.target) counterObserver.observe(el);
    });

    // ===== SCROLL REVEAL =====
    const revealSelectors = [
        '.section-head', '.empresa-text', '.values-grid', '.value-card',
        '.produto-card', '.noticia-card', '.contato-info', '.contato-form',
        '.marca-item', '.footer-cta-content', '.mascot-wrap', '.hero-mascot',
        '.catalogo-cta-content', '.catalogo-cta-visual', '.cat-tile',
        '.cta-block', '.contato-list li', '.features li'
    ];

    const revealTargets = document.querySelectorAll(revealSelectors.join(', '));
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        // Small stagger for sibling elements
                        const parent = entry.target.parentElement;
                        const siblings = parent
                            ? Array.from(parent.querySelectorAll('.reveal:not(.visible)'))
                            : [];
                        const idx = siblings.indexOf(entry.target);
                        const delay = Math.min(idx * 60, 300);

                        setTimeout(function () {
                            entry.target.classList.add('visible');
                        }, delay);

                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
                card.style.animation = 'fadeInUp 300ms ease-out both';
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
        busca.addEventListener('input', debounce(aplicarFiltros, 220));
    }

    // URL param filter on load
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam && chips.length) {
        const matchChip = Array.from(chips).find(function (c) {
            return c.getAttribute('data-filter') === catParam;
        });
        if (matchChip) {
            chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
            matchChip.setAttribute('aria-pressed', 'true');
            filtroAtivo = catParam;
            aplicarFiltros();
        }
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
                if (successMsg) successMsg.hidden = true;
                return;
            }

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
                successMsg.hidden = false;
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            form.reset();

            setTimeout(function () {
                if (successMsg) successMsg.hidden = true;
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
            if (!input) return;
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
            const headerEl = document.querySelector('.header');
            const offset = (headerEl ? headerEl.offsetHeight : 0) + 16;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        });
    });

    // ===== UTILITIES =====
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

    // Combined scroll handler (single listener for performance)
    function onScroll() {
        updateHeader();
        updateProgress();
    }

    window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });

})();
