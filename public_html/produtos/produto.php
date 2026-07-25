<?php
/* ============================================================
   COMERCIAL SÃO PEDRO — produtos/produto.php
   Página de detalhe de produto, servida para todo mundo via
   rewrite (produto-<slug>.html -> produto.php?slug=<slug>).
   Busca no banco em tempo real: editar no admin muda aqui na
   hora, sem gerar nenhum arquivo.
   ============================================================ */
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../inc/produto-template.php';

$slug = isset($_GET['slug']) ? $_GET['slug'] : '';
$slug = preg_replace('/[^a-z0-9-]/', '', strtolower($slug));

header('Content-Type: text/html; charset=utf-8');

if ($slug === '') {
    http_response_code(404);
    echo csp_render_not_found();
    exit;
}

$pdo = db();
$st = $pdo->prepare('SELECT * FROM produtos WHERE id = ?');
$st->execute(array($slug));
$p = $st->fetch();

if (!$p) {
    http_response_code(404);
    echo csp_render_not_found();
    exit;
}

$t = json_decode(($p['tags'] !== null && $p['tags'] !== '') ? $p['tags'] : '[]', true);
$p['tags'] = is_array($t) ? $t : array();

$all = $pdo->query('SELECT id, nome, categoria, categoriaLabel, img FROM produtos ORDER BY ordem ASC, createdAt ASC')->fetchAll();

echo csp_render_produto_page($p, $all);
