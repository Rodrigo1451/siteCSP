/* ============================================================
   COMERCIAL SÃO PEDRO — servidor de desenvolvimento
   Serve os arquivos estáticos do site em http://localhost:3000
   sem depender de nenhum pacote npm.

   Obs.: os endpoints em /api são PHP e NÃO rodam aqui. Sem eles
   as páginas caem no fallback do seed local (js/seed-data.js),
   o que basta para ver o front-end. Para testar a API de verdade
   use `npm run dev:php` (requer PHP instalado).
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');

// O site fica em public_html/ na raiz, espelhando a Hostinger.
// Este script vive em output_claude/scripts/, por isso sobe dois niveis.
const ROOT = path.resolve(__dirname, '..', '..', 'public_html');
const PORT = process.env.PORT || 3000;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.pdf': 'application/pdf'
};

function send(res, code, body, headers) {
    res.writeHead(code, Object.assign({ 'Cache-Control': 'no-store' }, headers || {}));
    res.end(body);
}

const server = http.createServer(function (req, res) {
    let pathname = new URL(req.url, 'http://localhost').pathname;
    pathname = decodeURIComponent(pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.join(ROOT, pathname);
    // impede sair da pasta do projeto
    if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

    if (pathname.startsWith('/api/')) {
        return send(res, 501, JSON.stringify({
            ok: false,
            error: 'API PHP indisponivel no servidor de dev. Use: npm run dev:php'
        }), { 'Content-Type': 'application/json; charset=utf-8' });
    }

    fs.readFile(filePath, function (err, data) {
        if (err) {
            // tenta acrescentar .html (ex.: /produtos -> /produtos.html)
            return fs.readFile(filePath + '.html', function (err2, data2) {
                if (err2) return send(res, 404, 'Nao encontrado: ' + pathname);
                send(res, 200, data2, { 'Content-Type': MIME['.html'] });
            });
        }
        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        send(res, 200, data, { 'Content-Type': type });
    });
});

server.listen(PORT, function () {
    console.log('Site rodando em http://localhost:' + PORT);
    console.log('Admin: http://localhost:' + PORT + '/admin.html');
    console.log('(API PHP desativada — use "npm run dev:php" para testar o backend)');
});
