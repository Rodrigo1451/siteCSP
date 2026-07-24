<?php
require_once __DIR__ . '/db.php';
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $pdo->query("SELECT * FROM produtos ORDER BY ordem ASC, createdAt ASC")->fetchAll();
    foreach ($rows as $i => $r) {
        $t = json_decode(($r['tags'] !== null && $r['tags'] !== '') ? $r['tags'] : '[]', true);
        $rows[$i]['tags'] = is_array($t) ? $t : array();
    }
    json_out(array('ok' => true, 'data' => $rows));
}

if ($method === 'POST') {
    require_admin();
    $in = body_json();
    $action = isset($in['action']) ? $in['action'] : '';
    $item = (isset($in['item']) && is_array($in['item'])) ? $in['item'] : array();

    if ($action === 'delete') {
        $st = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
        $st->execute(array(isset($item['id']) ? $item['id'] : ''));
        json_out(array('ok' => true));
    }
    if ($action === 'create' || $action === 'update') {
        if (!isset($item['nome']) || trim($item['nome']) === '') json_out(array('ok' => false, 'error' => 'Nome obrigatorio.'));
        $ordem = null;
        if ($action === 'create') {
            $ordem = ((int) $pdo->query("SELECT COALESCE(MAX(ordem),0) FROM produtos")->fetchColumn()) + 1;
        }
        $id = save_produto($pdo, $item, $ordem);
        json_out(array('ok' => true, 'id' => $id));
    }
    json_out(array('ok' => false, 'error' => 'Acao invalida.'));
}
