<?php
require_once __DIR__ . '/db.php';
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$hash = get_setting($pdo, 'admin_hash');

if ($method === 'GET') {
    json_out(array('ok' => true, 'authenticated' => is_admin(), 'setup' => ($hash === null)));
}

if ($method === 'POST') {
    $in = body_json();
    $action = isset($in['action']) ? $in['action'] : '';

    if ($action === 'setup') {
        if ($hash !== null) json_out(array('ok' => false, 'error' => 'Senha ja configurada.'));
        $senha = (string) (isset($in['senha']) ? $in['senha'] : '');
        if (strlen($senha) < 6) json_out(array('ok' => false, 'error' => 'A senha deve ter no minimo 6 caracteres.'));
        set_setting($pdo, 'admin_hash', password_hash($senha, PASSWORD_DEFAULT));
        $_SESSION['csp_admin'] = true;
        json_out(array('ok' => true));
    }

    if ($action === 'login') {
        $senha = (string) (isset($in['senha']) ? $in['senha'] : '');
        if ($hash !== null && password_verify($senha, $hash)) {
            $_SESSION['csp_admin'] = true;
            json_out(array('ok' => true));
        }
        http_response_code(401);
        json_out(array('ok' => false, 'error' => 'Senha incorreta.'));
    }

    if ($action === 'logout') {
        unset($_SESSION['csp_admin']);
        json_out(array('ok' => true));
    }

    if ($action === 'change') {
        require_admin();
        $atual = (string) (isset($in['atual']) ? $in['atual'] : '');
        $nova = (string) (isset($in['nova']) ? $in['nova'] : '');
        if ($hash === null || !password_verify($atual, $hash)) json_out(array('ok' => false, 'error' => 'Senha atual incorreta.'));
        if (strlen($nova) < 6) json_out(array('ok' => false, 'error' => 'A nova senha deve ter no minimo 6 caracteres.'));
        set_setting($pdo, 'admin_hash', password_hash($nova, PASSWORD_DEFAULT));
        json_out(array('ok' => true));
    }

    json_out(array('ok' => false, 'error' => 'Acao invalida.'));
}
