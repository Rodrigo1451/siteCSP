<?php
require_once __DIR__ . '/db.php';
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $order = "ORDER BY (data = '') ASC, data DESC, createdAt DESC";
    if (is_admin()) {
        $rows = $pdo->query("SELECT * FROM noticias " . $order)->fetchAll();
    } else {
        $st = $pdo->prepare("SELECT * FROM noticias WHERE status = 'publicada' " . $order);
        $st->execute();
        $rows = $st->fetchAll();
    }
    json_out(array('ok' => true, 'data' => $rows));
}

if ($method === 'POST') {
    require_admin();
    $in = body_json();
    $action = isset($in['action']) ? $in['action'] : '';
    $item = (isset($in['item']) && is_array($in['item'])) ? $in['item'] : array();

    if ($action === 'delete') {
        $st = $pdo->prepare("DELETE FROM noticias WHERE id = ?");
        $st->execute(array(isset($item['id']) ? $item['id'] : ''));
        json_out(array('ok' => true));
    }
    if ($action === 'create' || $action === 'update') {
        if (!isset($item['titulo']) || trim($item['titulo']) === '') json_out(array('ok' => false, 'error' => 'Titulo obrigatorio.'));
        $ordem = null;
        if ($action === 'create') {
            $ordem = ((int) $pdo->query("SELECT COALESCE(MAX(ordem),0) FROM noticias")->fetchColumn()) + 1;
        }
        $id = save_noticia($pdo, $item, $ordem);
        json_out(array('ok' => true, 'id' => $id));
    }
    json_out(array('ok' => false, 'error' => 'Acao invalida.'));
}
