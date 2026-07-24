/* ============================================
   COMERCIAL SÃO PEDRO — carrinho.js
   Carrinho de orçamento: adicionar produtos,
   ajustar quantidades e solicitar orçamento no
   WhatsApp com a lista completa de itens.
   ============================================ */

(function () {
    'use strict';

    var WHATSAPP_NUM = '5511973947185';
    var STORAGE_KEY = 'csp_carrinho_v1';
    var MAX_QTD = 999;

    /* ===== ÍCONES (inline SVG) ===== */
    var ICON_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    var ICON_WPP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.4-.2-.6.2s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.6-1.5-.8-2-.2-.5-.5-.4-.7-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4 0 1.4 1 2.7 1.1 2.9.1.2 2 3 4.7 4.2 1.4.6 2.5.9 3.4 1.1.7.1 1.4.1 1.9 0 .6-.1 1.7-.7 2-1.4.3-.6.3-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 22A10 10 0 0 1 2 12 10 10 0 0 1 12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10"/></svg>';
    var ICON_EMPTY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

    /* ===== ESTADO / PERSISTÊNCIA ===== */
    function load() {
        try {
            var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!Array.isArray(raw)) return [];
            return raw.filter(function (i) {
                return i && typeof i.id === 'string' && typeof i.nome === 'string';
            }).map(function (i) {
                return {
                    id: i.id,
                    nome: i.nome,
                    url: typeof i.url === 'string' ? i.url : '',
                    qtd: clampQtd(parseInt(i.qtd, 10) || 1)
                };
            });
        } catch (e) {
            return [];
        }
    }

    function persist() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    var cart = load();

    function clampQtd(n) {
        if (isNaN(n) || n < 1) return 1;
        if (n > MAX_QTD) return MAX_QTD;
        return n;
    }

    function slugify(str) {
        return String(str)
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function findItem(id) {
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) return cart[i];
        }
        return null;
    }

    function totalCount() {
        return cart.reduce(function (s, i) { return s + i.qtd; }, 0);
    }

    /* ===== OPERAÇÕES ===== */
    function addItem(prod, qtd) {
        qtd = clampQtd(qtd || 1);
        var it = findItem(prod.id);
        if (it) {
            it.qtd = clampQtd(it.qtd + qtd);
        } else {
            cart.push({ id: prod.id, nome: prod.nome, url: prod.url || '', qtd: qtd });
        }
        persist();
        renderBadge();
        renderDrawer();
        pulseFab();
    }

    function setQtd(id, qtd) {
        var it = findItem(id);
        if (!it) return;
        it.qtd = clampQtd(qtd);
        persist();
        renderBadge();
        renderDrawer();
    }

    function removeItem(id) {
        cart = cart.filter(function (i) { return i.id !== id; });
        persist();
        renderBadge();
        renderDrawer();
    }

    function clearCart() {
        cart = [];
        persist();
        renderBadge();
        renderDrawer();
    }

    /* ===== MENSAGEM DO WHATSAPP ===== */
    function buildMessage() {
        var linhas = [
            '*Solicitação de Orçamento — Comercial São Pedro*',
            '',
            'Olá! Gostaria de um orçamento dos seguintes produtos:',
            ''
        ];
        cart.forEach(function (item, idx) {
            linhas.push((idx + 1) + '. ' + item.nome + ' — Qtd: ' + item.qtd);
        });
        linhas.push('');
        linhas.push('*Total de itens:* ' + totalCount());
        return linhas.join('\n');
    }

    function enviarOrcamento() {
        if (!cart.length) return;
        var url = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(buildMessage());
        window.open(url, '_blank', 'noopener');
    }

    /* ===== UI: FAB + DRAWER ===== */
    var fab, badge, overlay, drawer, itemsEl, footerEl;

    function buildUI() {
        // FAB
        fab = document.createElement('button');
        fab.type = 'button';
        fab.className = 'cart-fab';
        fab.setAttribute('aria-label', 'Abrir carrinho de orçamento');
        fab.innerHTML = ICON_CART + '<span class="cart-fab-badge" aria-hidden="true">0</span>';
        badge = fab.querySelector('.cart-fab-badge');
        fab.addEventListener('click', openDrawer);
        document.body.appendChild(fab);

        // Overlay
        overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.addEventListener('click', closeDrawer);
        document.body.appendChild(overlay);

        // Drawer
        drawer = document.createElement('aside');
        drawer.className = 'cart-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', 'Carrinho de orçamento');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML =
            '<div class="cart-drawer-header">' +
                '<h2>Meu orçamento <span class="cart-count-pill" data-count>0</span></h2>' +
                '<button type="button" class="cart-close" aria-label="Fechar carrinho">' + ICON_CLOSE + '</button>' +
            '</div>' +
            '<ul class="cart-items" data-items></ul>' +
            '<div class="cart-footer" data-footer></div>';
        document.body.appendChild(drawer);

        itemsEl = drawer.querySelector('[data-items]');
        footerEl = drawer.querySelector('[data-footer]');

        drawer.querySelector('.cart-close').addEventListener('click', closeDrawer);

        // Delegação de eventos dentro da lista
        itemsEl.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            var id = btn.getAttribute('data-id');
            if (!id) return;
            if (btn.hasAttribute('data-inc')) {
                var itI = findItem(id); if (itI) setQtd(id, itI.qtd + 1);
            } else if (btn.hasAttribute('data-dec')) {
                var itD = findItem(id); if (itD) setQtd(id, itD.qtd - 1);
            } else if (btn.hasAttribute('data-remove')) {
                removeItem(id);
            }
        });

        itemsEl.addEventListener('change', function (e) {
            var input = e.target;
            if (!input.matches('input[data-qty-input]')) return;
            setQtd(input.getAttribute('data-id'), parseInt(input.value, 10));
        });

        // Fechar com ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
        });

        renderBadge();
        renderDrawer();
    }

    function openDrawer() {
        renderDrawer();
        overlay.classList.add('open');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function pulseFab() {
        if (!fab) return;
        fab.classList.remove('pulse');
        // força reflow para reiniciar a animação
        void fab.offsetWidth;
        fab.classList.add('pulse');
    }

    function renderBadge() {
        if (!badge) return;
        var count = totalCount();
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.classList.toggle('show', count > 0);
        var pill = drawer && drawer.querySelector('[data-count]');
        if (pill) pill.textContent = String(count);
    }

    function renderDrawer() {
        if (!itemsEl || !footerEl) return;

        if (!cart.length) {
            itemsEl.innerHTML =
                '<li class="cart-empty">' +
                    ICON_EMPTY +
                    '<strong>Seu carrinho está vazio</strong>' +
                    '<p>Adicione produtos do catálogo para montar seu orçamento.</p>' +
                '</li>';
            footerEl.innerHTML = '';
            renderBadge();
            return;
        }

        var html = '';
        cart.forEach(function (item) {
            var nomeHtml = item.url
                ? '<a class="cart-item-nome" href="' + escapeAttr(item.url) + '">' + escapeHtml(item.nome) + '</a>'
                : '<span class="cart-item-nome">' + escapeHtml(item.nome) + '</span>';
            html +=
                '<li class="cart-item">' +
                    nomeHtml +
                    '<button type="button" class="cart-item-remove" data-remove data-id="' + escapeAttr(item.id) + '" aria-label="Remover ' + escapeAttr(item.nome) + '">' + ICON_TRASH + '</button>' +
                    '<div class="cart-qty">' +
                        '<button type="button" data-dec data-id="' + escapeAttr(item.id) + '" aria-label="Diminuir quantidade"' + (item.qtd <= 1 ? ' disabled' : '') + '>&minus;</button>' +
                        '<input type="number" min="1" max="' + MAX_QTD + '" value="' + item.qtd + '" data-qty-input data-id="' + escapeAttr(item.id) + '" aria-label="Quantidade de ' + escapeAttr(item.nome) + '">' +
                        '<button type="button" data-inc data-id="' + escapeAttr(item.id) + '" aria-label="Aumentar quantidade">+</button>' +
                    '</div>' +
                '</li>';
        });
        itemsEl.innerHTML = html;

        footerEl.innerHTML =
            '<div class="cart-footer-resumo">' +
                '<span>Total de itens</span>' +
                '<strong>' + totalCount() + '</strong>' +
            '</div>' +
            '<button type="button" class="cart-btn-orcamento" data-enviar>' + ICON_WPP + 'Solicitar orçamento no WhatsApp</button>' +
            '<button type="button" class="cart-btn-limpar" data-limpar>Limpar carrinho</button>';

        footerEl.querySelector('[data-enviar]').addEventListener('click', enviarOrcamento);
        footerEl.querySelector('[data-limpar]').addEventListener('click', function () {
            if (window.confirm('Deseja remover todos os produtos do carrinho?')) clearCart();
        });

        renderBadge();
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function escapeAttr(s) { return escapeHtml(s); }

    /* ===== INTEGRAÇÃO COM O CATÁLOGO / PÁGINAS DE PRODUTO ===== */

    // Cria o botão "adicionar ao carrinho"
    function makeAddButton(prod, opts) {
        opts = opts || {};
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-add-cart' + (opts.extraClass ? ' ' + opts.extraClass : '');
        btn.innerHTML = ICON_PLUS + '<span>' + (opts.label || 'Adicionar') + '</span>';
        btn.setAttribute('aria-label', 'Adicionar ' + prod.nome + ' ao orçamento');
        btn.addEventListener('click', function () {
            addItem(prod, opts.qtdGetter ? opts.qtdGetter() : 1);
            var span = btn.querySelector('span');
            var original = opts.label || 'Adicionar';
            btn.classList.add('added');
            if (span) span.textContent = 'Adicionado ✓';
            setTimeout(function () {
                btn.classList.remove('added');
                if (span) span.textContent = original;
            }, 1500);
        });
        return btn;
    }

    // Catálogo (produtos.html): injeta botão em cada card
    function enhanceCatalogCards() {
        var cards = document.querySelectorAll('.produto-card');
        cards.forEach(function (card) {
            var actions = card.querySelector('.produto-actions');
            if (!actions || actions.querySelector('.btn-add-cart')) return;

            var h3 = card.querySelector('h3');
            var nome = h3 ? h3.textContent.trim() : '';
            if (!nome) return;

            var link = card.querySelector('.produto-img-link, h3 a');
            var url = link ? link.getAttribute('href') : '';

            var prod = { id: slugify(nome), nome: nome, url: url || '' };
            var btn = makeAddButton(prod, { extraClass: 'btn', label: 'Carrinho' });
            actions.appendChild(btn);
        });
    }

    // Página de produto individual: injeta botão ao lado do CTA de orçamento
    function enhanceProductDetail() {
        var cta = document.querySelector('.produto-detalhe-cta');
        if (!cta || cta.querySelector('.btn-add-cart')) return;

        var h1 = document.querySelector('.page-hero h1');
        var nome = h1 ? h1.textContent.trim() : (document.title.split('—')[0].trim());
        if (!nome) return;

        var prod = { id: slugify(nome), nome: nome, url: '' };
        var btn = makeAddButton(prod, { extraClass: 'btn', label: 'Adicionar ao carrinho' });
        // insere como primeiro botão do bloco CTA
        cta.insertBefore(btn, cta.firstChild);
    }

    /* ===== BOOT ===== */
    // Exposto para as páginas que renderizam o catálogo de forma assíncrona
    // (produtos.html carrega os produtos da API e chama enhanceCatalog depois).
    window.CSP_Cart = {
        enhanceCatalog: enhanceCatalogCards,
        enhanceDetail: enhanceProductDetail,
        addItem: addItem
    };

    function init() {
        buildUI();
        enhanceCatalogCards();
        enhanceProductDetail();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Sincroniza entre abas
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
            cart = load();
            renderBadge();
            renderDrawer();
        }
    });

})();
