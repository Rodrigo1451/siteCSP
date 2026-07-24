/* ============================================================
   COMERCIAL SÃO PEDRO — csp-api.js
   Cliente da API PHP (produtos / notícias / autenticação).
   Usado pelas páginas públicas (leitura) e pelo painel admin
   (leitura + escrita). O fallback ao seed local é feito por
   quem chama, caso a API não esteja disponível.
   ============================================================ */
(function () {
    'use strict';
    var BASE = 'api/';

    function req(endpoint, opts) {
        opts = opts || {};
        opts.credentials = 'same-origin';
        return fetch(BASE + endpoint, opts).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (j) {
                return { status: r.status, ok: r.ok, json: j };
            });
        });
    }

    function post(endpoint, body) {
        return req(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        }).then(function (r) { return r.json || {}; });
    }

    window.CSP_API = {
        getProdutos: function () {
            return req('produtos.php').then(function (r) { return (r.json && r.json.data) || []; });
        },
        getNoticias: function () {
            return req('noticias.php').then(function (r) { return (r.json && r.json.data) || []; });
        },
        saveProduto: function (item, action) { return post('produtos.php', { action: action || 'update', item: item }); },
        deleteProduto: function (id) { return post('produtos.php', { action: 'delete', item: { id: id } }); },
        saveNoticia: function (item, action) { return post('noticias.php', { action: action || 'update', item: item }); },
        deleteNoticia: function (id) { return post('noticias.php', { action: 'delete', item: { id: id } }); },
        authStatus: function () { return req('auth.php').then(function (r) { return r.json || {}; }); },
        login: function (senha) { return post('auth.php', { action: 'login', senha: senha }); },
        setup: function (senha) { return post('auth.php', { action: 'setup', senha: senha }); },
        logout: function () { return post('auth.php', { action: 'logout' }); },
        changePwd: function (atual, nova) { return post('auth.php', { action: 'change', atual: atual, nova: nova }); }
    };
})();
