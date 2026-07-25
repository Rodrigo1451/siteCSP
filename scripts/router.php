<?php
/* Router do servidor embutido do PHP (`php -S`) para o dev local.
   O servidor embutido nao le .htaccess, entao replicamos aqui a unica
   regra que o site precisa: produto-<slug>.html -> produto.php?slug=. */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$docRoot = $_SERVER['DOCUMENT_ROOT'];

if ($uri !== '/' && file_exists($docRoot . $uri) && !is_dir($docRoot . $uri)) {
    return false; // arquivo real existe, deixa o servidor embutido servir
}

if (preg_match('#^/produtos/produto-([a-z0-9-]+)\.html$#', $uri, $m)) {
    $_GET['slug'] = $m[1];
    require $docRoot . '/produtos/produto.php';
    return true;
}

return false;
