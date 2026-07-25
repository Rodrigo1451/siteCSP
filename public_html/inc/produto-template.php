<?php
/* ============================================================
   COMERCIAL SÃO PEDRO — inc/produto-template.php
   Renderiza a ficha de produto (produtos/produto-*.html) a
   partir de uma linha do banco. Único lugar que sabe montar
   esse HTML — produtos/produto.php só busca a linha e chama
   csp_render_produto_page().
   ============================================================ */

function csp_esc($s) {
    return htmlspecialchars((string) ($s === null ? '' : $s), ENT_QUOTES, 'UTF-8');
}

/* Corta em bytes (sem depender da extensao mbstring, que pode nao estar
   habilitada no host) e depois recua ate nao ficar no meio de um caractere
   UTF-8 multibyte (byte de continuacao = 10xxxxxx). */
function csp_truncate_utf8($s, $maxBytes) {
    if (strlen($s) <= $maxBytes) return $s;
    $cut = substr($s, 0, $maxBytes);
    while ($cut !== '' && (ord($cut[strlen($cut) - 1]) & 0xC0) === 0x80) {
        $cut = substr($cut, 0, -1);
    }
    return $cut;
}

function csp_meta_description($p) {
    $tipo = trim((string) ($p['tipo'] ?? ''));
    $descricao = (string) ($p['descricao'] ?? '');
    $combined = trim(($tipo !== '' ? $tipo . '. ' : '') . str_replace("\n", ' ', $descricao));
    if ($combined === '') {
        return $p['nome'] . ' - Comercial São Pedro, Jundiaí-SP.';
    }
    if (strlen($combined) <= 155) {
        return $combined;
    }
    $cut = csp_truncate_utf8($combined, 150);
    $lastSpace = strrpos($cut, ' ');
    if ($lastSpace !== false && $lastSpace > 100) {
        $cut = substr($cut, 0, $lastSpace);
    }
    return $cut . '...';
}

function csp_lines_to_paragraphs($text, $indent) {
    $out = array();
    foreach (preg_split('/\n/', (string) $text) as $l) {
        if (trim($l) === '') continue;
        $out[] = $indent . '<p>' . csp_esc($l) . '</p>';
    }
    return implode("\n", $out);
}

function csp_lines_to_list_items($text, $indent) {
    $out = array();
    foreach (preg_split('/\n/', (string) $text) as $l) {
        if (trim($l) === '') continue;
        $out[] = $indent . '<li>' . csp_esc($l) . '</li>';
    }
    return implode("\n", $out);
}

function csp_head_block($nome, $description) {
    return "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n"
        . "    <meta charset=\"UTF-8\">\n"
        . "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
        . '    <meta name="description" content="' . csp_esc($description) . "\">\n"
        . "    <meta name=\"theme-color\" content=\"#FCD230\">\n"
        . '    <title>' . csp_esc($nome) . " | Comercial São Pedro</title>\n"
        . "    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n"
        . "    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
        . "    <link href=\"https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n"
        . "    <link rel=\"stylesheet\" href=\"../css/style.css\">\n"
        . "    <link rel=\"stylesheet\" href=\"../css/cardnav.css\">\n"
        . "    <link rel=\"stylesheet\" href=\"../css/mobile.css\">\n"
        . "    <link rel=\"stylesheet\" href=\"../css/carrinho.css\">\n"
        . "    <link rel=\"icon\" type=\"image/svg+xml\" href=\"../assets/favicon.svg\">\n"
        . "</head>\n<body>\n\n";
}

function csp_hero_block($nome, $tipo) {
    $s = "<!-- PAGE HERO -->\n<div class=\"page-hero\">\n    <div class=\"container\">\n"
        . "        <nav class=\"breadcrumb-nav\" aria-label=\"Breadcrumb\">\n"
        . "            <a href=\"../index.html\">Home</a>\n"
        . "            <span aria-hidden=\"true\">\xe2\x80\xba</span>\n"
        . "            <a href=\"../produtos.html\">Produtos</a>\n"
        . "            <span aria-hidden=\"true\">\xe2\x80\xba</span>\n"
        . '            <span aria-current="page">' . csp_esc($nome) . "</span>\n"
        . "        </nav>\n"
        . '        <h1>' . csp_esc($nome) . "</h1>\n";
    if ($tipo !== '') {
        $s .= '        <p>' . csp_esc($tipo) . "</p>\n";
    }
    $s .= "    </div>\n</div>\n\n";
    return $s;
}

function csp_media_block($p) {
    if (!empty($p['img'])) {
        return "        <div class=\"produto-detalhe-media\">\n"
            . '            <img src="../' . csp_esc($p['img']) . '" alt="' . csp_esc($p['nome']) . "\" width=\"500\" height=\"460\" loading=\"eager\">\n"
            . "        </div>\n";
    }
    return "        <div class=\"produto-detalhe-media\">\n"
        . "            <div class=\"produto-img\" style=\"background:#572925;display:flex;align-items:center;justify-content:center;min-height:280px;border-radius:12px;\"><svg width=\"64\" height=\"64\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(252,210,48,0.35)\" stroke-width=\"1\" aria-hidden=\"true\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2\"/></svg></div>\n"
        . "        </div>\n";
}

function csp_info_block($p) {
    $categoriaLabel = (string) ($p['categoriaLabel'] ?? '');
    $marcaLabel = (string) ($p['marcaLabel'] ?? '');

    $s = "        <div class=\"produto-detalhe-info\">\n";

    if ($categoriaLabel !== '' || $marcaLabel !== '') {
        $s .= "            <div class=\"produto-detalhe-badges\">\n";
        if ($categoriaLabel !== '') $s .= '                    <span class="produto-tag">' . csp_esc($categoriaLabel) . "</span>\n";
        if ($marcaLabel !== '') $s .= '                    <span class="produto-detalhe-marca">' . csp_esc($marcaLabel) . "</span>\n";
        $s .= "            </div>\n";
    }

    $h2 = ((string) ($p['tipo'] ?? '')) !== '' ? $p['tipo'] : $p['nome'];
    $s .= '            <h2>' . csp_esc($h2) . "</h2>\n";

    $s .= "            <div class=\"produto-detalhe-desc\">\n" . csp_lines_to_paragraphs($p['descricao'], '                    ') . "\n            </div>\n";

    if (!empty($p['detalhes'])) {
        $s .= "                <div class=\"produto-detalhe-bloco\">\n";
        $s .= "                    <h3>Detalhes do produto</h3>\n";
        $s .= "                    <div class=\"produto-detalhe-desc\">\n" . csp_lines_to_paragraphs($p['detalhes'], '                        ') . "\n                    </div>\n";
        $s .= "                </div>\n";
    }

    if (!empty($p['embalagem'])) {
        $s .= "                <div class=\"produto-detalhe-bloco\">\n";
        $s .= "                    <h3>Embalagens disponíveis</h3>\n";
        $s .= "                    <ul class=\"produto-embalagens\">\n" . csp_lines_to_list_items($p['embalagem'], '                        ') . "\n                    </ul>\n";
        $s .= "                </div>\n";
    }

    $s .= "            <div class=\"produto-detalhe-cta\">\n";
    $s .= '                <a href="https://wa.me/5511973947185?text=Quero%20or%C3%A7amento%20de%20' . rawurlencode($p['nome']) . '" class="btn btn-primary" target="_blank" rel="noopener">Solicitar orçamento no WhatsApp</a>' . "\n";
    $s .= "                <a href=\"../produtos.html\" class=\"btn btn-outline\">Voltar ao catálogo</a>\n";
    $s .= "            </div>\n";

    $metaParts = array();
    if (!empty($p['categoria'])) $metaParts[] = 'Categoria: <a href="../produtos.html?cat=' . csp_esc($p['categoria']) . '">' . csp_esc($categoriaLabel) . '</a>';
    if (!empty($p['marca'])) $metaParts[] = 'Marca: <a href="../produtos.html?marca=' . csp_esc($p['marca']) . '">' . csp_esc($marcaLabel) . '</a>';
    if ($metaParts) {
        $s .= "            <p class=\"produto-detalhe-meta\">\n                " . implode(' &middot; ', $metaParts) . "\n            </p>\n";
    }

    $s .= "        </div>\n";
    return $s;
}

function csp_relacionados_block($p, $all) {
    if (empty($p['categoria'])) return '';
    $candidates = array();
    foreach ($all as $x) {
        if ($x['id'] === $p['id']) continue;
        if ((string) ($x['categoria'] ?? '') !== (string) $p['categoria']) continue;
        $candidates[] = $x;
        if (count($candidates) >= 2) break;
    }
    if (!$candidates) return '';

    $s = "    <div class=\"produto-relacionados\">\n        <h2>Produtos relacionados</h2>\n        <div class=\"produtos-grid-full\">\n\n";
    foreach ($candidates as $c) {
        $s .= "        <article class=\"produto-card\">\n";
        $s .= '            <a class="produto-img-link" href="produto-' . csp_esc($c['id']) . '.html" aria-label="Ver ' . csp_esc($c['nome']) . "\">\n";
        $s .= '                <div class="produto-img"><img src="../' . csp_esc($c['img']) . '" alt="' . csp_esc($c['nome']) . "\" loading=\"lazy\"></div>\n";
        $s .= "            </a>\n";
        $s .= "            <div class=\"produto-info\">\n";
        $s .= '                <span class="produto-tag">' . csp_esc($c['categoriaLabel']) . "</span>\n";
        $s .= '                <h3><a href="produto-' . csp_esc($c['id']) . '.html">' . csp_esc($c['nome']) . "</a></h3>\n";
        $s .= '                <div class="produto-actions"><a href="produto-' . csp_esc($c['id']) . '.html" class="btn btn-outline">Ver detalhes</a></div>' . "\n";
        $s .= "            </div>\n";
        $s .= "        </article>\n\n";
    }
    $s .= "        </div>\n    </div>\n\n";
    return $s;
}

function csp_render_produto_page($p, $all) {
    $incDir = __DIR__;
    $out = csp_head_block($p['nome'], csp_meta_description($p));
    $out .= file_get_contents($incDir . '/nav.html');
    $out .= csp_hero_block($p['nome'], (string) ($p['tipo'] ?? ''));
    $out .= "<main id=\"main\">\n<section class=\"section-pad\" style=\"background: var(--color-bg);\">\n<div class=\"container\">\n\n";
    $out .= "    <div class=\"produto-detalhe\">\n";
    $out .= csp_media_block($p);
    $out .= csp_info_block($p);
    $out .= "    </div>\n\n";
    $out .= csp_relacionados_block($p, $all);
    $out .= "</div>\n</section>\n</main>\n\n";
    $out .= file_get_contents($incDir . '/footer.html');
    return $out;
}

function csp_render_not_found() {
    $incDir = __DIR__;
    $out = csp_head_block('Produto não encontrado', 'Este produto não existe mais ou foi removido do catálogo.');
    $out .= file_get_contents($incDir . '/nav.html');
    $out .= csp_hero_block('Produto não encontrado', '');
    $out .= "<main id=\"main\">\n<section class=\"section-pad\" style=\"background: var(--color-bg);\">\n<div class=\"container\">\n\n";
    $out .= "    <div class=\"produto-detalhe-info\">\n";
    $out .= "        <p>Este produto não existe mais ou foi removido do catálogo.</p>\n";
    $out .= "        <div class=\"produto-detalhe-cta\">\n";
    $out .= "            <a href=\"../produtos.html\" class=\"btn btn-primary\">Voltar ao catálogo</a>\n";
    $out .= "        </div>\n";
    $out .= "    </div>\n\n";
    $out .= "</div>\n</section>\n</main>\n\n";
    $out .= file_get_contents($incDir . '/footer.html');
    return $out;
}
