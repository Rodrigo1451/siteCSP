/* ============================================================
   COMERCIAL SÃO PEDRO — contadores.js
   Preenche os numeros de catalogo (quantos produtos, quantas
   categorias) com os valores reais vindos do banco, para o site
   nunca mais ficar com numero desatualizado escrito na mao.

   Como usar no HTML:
     <span data-csp-count="produtos">70</span> produtos
     <span data-csp-count="categorias">17</span> linhas

   O numero escrito dentro da tag e o valor de reserva: aparece
   enquanto a API responde e continua valendo se ela falhar.
   Por isso deixe sempre o numero correto do momento ali.

   data-csp-offset="7" subtrai 7 do total — util para textos do
   tipo "+ 10 categorias" quando 7 ja estao listadas na tela.
   ============================================================ */
(function () {
    'use strict';

    function contar(produtos) {
        var cats = {};
        var marcas = {};
        var n = 0;
        produtos.forEach(function (p) {
            if (!p || !p.nome) return;
            n++;
            if (p.categoria) cats[p.categoria] = true;
            if (p.marca) marcas[p.marca] = true;
        });
        return { produtos: n, categorias: Object.keys(cats).length, marcas: Object.keys(marcas).length };
    }

    // Escreve os totais nos elementos marcados com data-csp-count
    function apply(produtos) {
        if (!produtos || !produtos.length) return;
        var total = contar(produtos);
        var els = document.querySelectorAll('[data-csp-count]');
        Array.prototype.forEach.call(els, function (el) {
            var valor = total[el.getAttribute('data-csp-count')];
            if (typeof valor !== 'number') return;
            var offset = parseInt(el.getAttribute('data-csp-offset') || '0', 10) || 0;
            var final = valor - offset;
            if (final > 0) el.textContent = String(final);
        });
    }

    function load() {
        if (!document.querySelector('[data-csp-count]')) return;

        // Usa o cliente da API quando a pagina ja o carrega; senao busca direto.
        var p = (window.CSP_API && window.CSP_API.getProdutos)
            ? window.CSP_API.getProdutos()
            : fetch('api/produtos.php', { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (j) { return (j && j.data) || []; });

        p.then(apply)['catch'](function () {
            // Sem API (dev sem PHP, rede fora): tenta o seed, se a pagina o carregou.
            if (window.CSP_SEED && window.CSP_SEED.produtos) apply(window.CSP_SEED.produtos);
            // Caso contrario os numeros de reserva do HTML permanecem.
        });
    }

    window.CSP_Counts = { apply: apply, load: load, contar: contar };

    // Paginas que ja buscam os produtos por conta propria (produtos.html)
    // definem CSP_COUNT_AUTO = false e chamam CSP_Counts.apply(items),
    // evitando uma segunda requisicao ao mesmo endpoint.
    if (window.CSP_COUNT_AUTO !== false) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', load);
        } else {
            load();
        }
    }
})();
