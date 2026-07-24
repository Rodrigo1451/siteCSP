/* ============================================
   COMERCIAL SÃO PEDRO — mobile.js v1
   Comportamentos exclusivos mobile (≤ 767px)
   ============================================ */

(function () {
    'use strict';

    var MQ = window.matchMedia('(max-width: 767px)');

    /* ===== BOTTOM ACTION BAR ===== */
    function buildBottomBar() {
        if (document.getElementById('mobileBar')) return;

        var currentPath = window.location.pathname.replace(/\/$/, '');
        var isHome      = currentPath === '' || /\/(index\.html)?$/.test(currentPath);
        var isProdutos  = /\/produtos(\.html)?$/.test(currentPath);
        var isContato   = /\/contato(\.html)?$/.test(currentPath);
        var isSubpage   = /\/(produtos|marcas)\//.test(currentPath);

        var prefix = isSubpage ? '../' : '';

        var wppMsg = encodeURIComponent('Olá! Vim pelo site e quero um orçamento.');
        var wppUrl = 'https://wa.me/5511973947185?text=' + wppMsg;

        var bar = document.createElement('nav');
        bar.id = 'mobileBar';
        bar.className = 'mobile-bar';
        bar.setAttribute('aria-label', 'Menu rápido mobile');

        bar.innerHTML =
            '<a href="' + prefix + 'index.html" class="mobile-bar-btn' + (isHome ? ' active' : '') + '" aria-label="Início">' +
                '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
                '<span>Início</span>' +
            '</a>' +
            '<a href="' + prefix + 'produtos.html" class="mobile-bar-btn' + (isProdutos ? ' active' : '') + '" aria-label="Produtos">' +
                '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' +
                '<span>Produtos</span>' +
            '</a>' +
            '<a href="' + wppUrl + '" class="mobile-bar-btn mobile-bar-btn--wpp" target="_blank" rel="noopener" aria-label="Abrir WhatsApp para orçamento">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.4-.2-.6.2s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.6-1.5-.8-2-.2-.5-.5-.4-.7-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4 0 1.4 1 2.7 1.1 2.9.1.2 2 3 4.7 4.2 1.4.6 2.5.9 3.4 1.1.7.1 1.4.1 1.9 0 .6-.1 1.7-.7 2-1.4.3-.6.3-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 22A10 10 0 0 1 2 12 10 10 0 0 1 12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10"/></svg>' +
                '<span>WhatsApp</span>' +
            '</a>' +
            '<a href="' + prefix + 'contato.html" class="mobile-bar-btn' + (isContato ? ' active' : '') + '" aria-label="Contato">' +
                '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
                '<span>Contato</span>' +
            '</a>';

        document.body.appendChild(bar);
    }

    /* ===== FOOTER ACCORDION ===== */
    function initFooterAccordion() {
        var footerCols = document.querySelectorAll('.footer-col');
        footerCols.forEach(function (col, idx) {
            if (idx === 0) return; // Primeiro col (logo) não é acordeão
            var h4 = col.querySelector('h4');
            if (!h4) return;

            h4.addEventListener('click', function () {
                var isOpen = col.classList.contains('footer-col--open');
                // Fechar todos
                footerCols.forEach(function (c) { c.classList.remove('footer-col--open'); });
                // Abrir o clicado (toggle)
                if (!isOpen) col.classList.add('footer-col--open');
            });

            h4.setAttribute('role', 'button');
            h4.setAttribute('tabindex', '0');
            h4.setAttribute('aria-expanded', 'false');

            h4.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    h4.click();
                    h4.setAttribute('aria-expanded', col.classList.contains('footer-col--open') ? 'true' : 'false');
                }
            });
        });
    }

    /* ===== SOLUÇÕES LEGENDA: tornar tiles clicáveis ===== */
    function initSolucoesLinks() {
        var legItems = document.querySelectorAll('.solucoes-legenda li');
        legItems.forEach(function (li) {
            if (li.querySelector('a')) return; // já foi processado
            var numEl = li.querySelector('.leg-num');
            if (!numEl) return;

            var num = numEl.textContent.trim();

            // Mapear número para categoria
            var catMap = {
                '1': 'adesivos_argamassas', '2': 'adesivos_epoxi', '3': 'aditivos_concretos',
                '4': 'aditivos_tamponamento', '5': 'argamassas', '6': 'asfaltos',
                '7': 'cura_quimica', '8': 'desmoldantes', '9': 'drenagem',
                '10': 'endurecedor', '11': 'grautes', '12': 'impermeabilizantes',
                '13': 'juntas', '14': 'mantas_asfalticas', '15': 'primers',
                '16': 'complementares', '17': 'inibidores', '18': 'revestimento',
                '19': 'selantes', '20': 'telhados'
            };

            var cat = catMap[num];
            if (!cat) return;

            var isSubpage = /\/(produtos|marcas)\//.test(window.location.pathname);
            var prefix = isSubpage ? '../' : '';
            var href = prefix + 'produtos.html?cat=' + cat;

            // Envolver conteúdo em link
            li.innerHTML = '<a href="' + href + '">' + li.innerHTML + '</a>';
        });
    }

    /* ===== CARD NAV CTA: esconder texto no mobile ===== */
    function fixCardNavCta() {
        var cta = document.querySelector('.card-nav-cta');
        if (!cta) return;
        // Adicionar span ao redor do texto para esconder via CSS
        var textNodes = [];
        cta.childNodes.forEach(function (node) {
            if (node.nodeType === 3 && node.textContent.trim()) {
                textNodes.push(node);
            }
        });
        textNodes.forEach(function (tn) {
            var span = document.createElement('span');
            span.className = 'card-nav-cta-text';
            span.textContent = tn.textContent;
            cta.replaceChild(span, tn);
        });
    }

    /* ===== INICIALIZAR ===== */
    function initMobile() {
        buildBottomBar();
        initFooterAccordion();
        initSolucoesLinks();
        fixCardNavCta();
    }

    function onMQChange(e) {
        var bar = document.getElementById('mobileBar');
        if (e.matches) {
            if (!bar) buildBottomBar();
        } else {
            if (bar) bar.remove();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            if (MQ.matches) initMobile();
            MQ.addEventListener('change', onMQChange);
        });
    } else {
        if (MQ.matches) initMobile();
        MQ.addEventListener('change', onMQChange);
    }

})();
