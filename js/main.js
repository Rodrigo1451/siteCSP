/* ============================================
   COMERCIAL SAO PEDRO - main.js
   ============================================ */

(function () {
    'use strict';

    // ===== MENU MOBILE =====
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav-principal');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        });

        // Fecha o menu ao clicar em um link
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

    // ===== ACTIVE NAV LINK (scrollspy simples) =====
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
            if (section.offsetTop <= scrollY) {
                activeId = '#' + section.id;
            }
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
        '.section-head, .empresa-text, .empresa-visual, .produto-card, .noticia-card, .banner-content, .banner-visual, .contato-info, .contato-form'
    );

    revealTargets.forEach(function (el) {
        el.classList.add('reveal');
    });

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

        revealTargets.forEach(function (el) {
            io.observe(el);
        });
    } else {
        // Fallback: torna tudo visível imediatamente
        revealTargets.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ===== FORM VALIDATION =====
    const form = document.getElementById('contatoForm');

    if (form) {
        const successMsg = document.getElementById('formSuccess');

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const fields = [
                {
                    el: document.getElementById('nome'),
                    err: document.getElementById('erro-nome'),
                    validate: function (v) {
                        if (!v.trim()) return 'Informe seu nome completo.';
                        if (v.trim().length < 3) return 'Nome deve ter ao menos 3 caracteres.';
                        return '';
                    }
                },
                {
                    el: document.getElementById('email'),
                    err: document.getElementById('erro-email'),
                    validate: function (v) {
                        if (!v.trim()) return 'Informe seu e-mail.';
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail invalido.';
                        return '';
                    }
                },
                {
                    el: document.getElementById('telefone'),
                    err: document.getElementById('erro-telefone'),
                    validate: function (v) {
                        if (!v.trim()) return '';
                        const digits = v.replace(/\D/g, '');
                        if (digits.length < 10 || digits.length > 11) return 'Telefone deve ter 10 ou 11 digitos.';
                        return '';
                    }
                },
                {
                    el: document.getElementById('mensagem'),
                    err: document.getElementById('erro-mensagem'),
                    validate: function (v) {
                        if (!v.trim()) return 'Escreva sua mensagem.';
                        if (v.trim().length < 10) return 'Mensagem deve ter ao menos 10 caracteres.';
                        return '';
                    }
                }
            ];

            let firstInvalid = null;
            let hasError = false;

            fields.forEach(function (f) {
                const msg = f.validate(f.el.value);
                if (msg) {
                    hasError = true;
                    f.el.classList.add('error');
                    f.err.textContent = msg;
                    if (!firstInvalid) firstInvalid = f.el;
                } else {
                    f.el.classList.remove('error');
                    f.err.textContent = '';
                }
            });

            if (hasError) {
                if (firstInvalid) firstInvalid.focus();
                successMsg.hidden = true;
                return;
            }

            // Sucesso simulado
            successMsg.hidden = false;
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            form.reset();

            setTimeout(function () {
                successMsg.hidden = true;
            }, 6000);
        });

        // Validação inline (on blur)
        form.querySelectorAll('input, textarea').forEach(function (input) {
            input.addEventListener('blur', function () {
                if (input.classList.contains('error')) {
                    const errEl = document.getElementById('erro-' + input.id);
                    if (input.value.trim()) {
                        input.classList.remove('error');
                        if (errEl) errEl.textContent = '';
                    }
                }
            });
        });

        // Máscara simples de telefone
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

    // ===== SMOOTH SCROLL POLISH (compensa header sticky) =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length <= 1) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight + 12;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        });
    });

    // ===== UTILITÁRIO: THROTTLE =====
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
})();
