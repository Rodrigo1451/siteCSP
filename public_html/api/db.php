<?php
/* Procura a configuracao (credenciais do banco) em dois lugares, nesta ordem:
   1) csp-config.php uma pasta ACIMA da raiz do site — na Hostinger fica fora
      do public_html, entao nao e acessivel pela web. Local preferido.
   2) api/config.php — fallback para desenvolvimento local.
   Os dois estao no .gitignore e nunca vao para o repositorio. */
$cspConfigPaths = array(
    dirname(dirname(__DIR__)) . '/csp-config.php',
    __DIR__ . '/config.php'
);
$cspConfigLoaded = false;
foreach ($cspConfigPaths as $cspConfigPath) {
    if (is_readable($cspConfigPath)) {
        require_once $cspConfigPath;
        $cspConfigLoaded = true;
        break;
    }
}
if (!$cspConfigLoaded) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'error' => 'config ausente: copie api/config.example.php para csp-config.php (fora do public_html) e preencha as credenciais'));
    exit;
}

function db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ));
        init_schema($pdo);
    }
    return $pdo;
}

function json_out($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body_json() {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    return is_array($d) ? $d : array();
}

function is_admin() { return !empty($_SESSION['csp_admin']); }
function require_admin() {
    if (!is_admin()) { http_response_code(401); json_out(array('ok' => false, 'error' => 'unauthorized')); }
}

/* Versao da carga inicial. Ao publicar um seed.json com produtos novos,
   incremente esta constante: seed_sync() insere o que falta no banco que ja
   existe, sem sobrescrever nada que o admin tenha editado. */
define('CSP_SEED_VERSION', '2026-07-24-117');

/* Adiciona colunas que ainda nao existem. MySQL antigo nao aceita
   ADD COLUMN IF NOT EXISTS, entao consultamos o information_schema. */
function add_missing_columns($pdo, $tabela, $colunas) {
    $st = $pdo->prepare("SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $st->execute(array($tabela));
    $existentes = array();
    foreach ($st->fetchAll() as $r) { $existentes[strtolower($r['COLUMN_NAME'])] = true; }
    foreach ($colunas as $nome => $definicao) {
        if (isset($existentes[strtolower($nome)])) continue;
        $pdo->exec("ALTER TABLE `$tabela` ADD COLUMN `$nome` $definicao");
    }
}

function init_schema($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS produtos (
        id VARCHAR(64) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(64),
        categoriaLabel VARCHAR(128),
        marca VARCHAR(64),
        marcaLabel VARCHAR(128),
        tag VARCHAR(160),
        img VARCHAR(255),
        alt VARCHAR(255),
        url VARCHAR(255),
        tipo VARCHAR(255),
        embalagem TEXT,
        detalhes TEXT,
        aplicacao TEXT,
        descricao TEXT,
        tags TEXT,
        ordem INT DEFAULT 0,
        createdAt BIGINT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS noticias (
        id VARCHAR(64) PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        categoria VARCHAR(128),
        data VARCHAR(20),
        dataLabel VARCHAR(64),
        resumo TEXT,
        conteudo TEXT,
        status VARCHAR(20) DEFAULT 'publicada',
        ordem INT DEFAULT 0,
        createdAt BIGINT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        k VARCHAR(64) PRIMARY KEY,
        v TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    add_missing_columns($pdo, 'produtos', array(
        'tipo'      => "VARCHAR(255) NULL",
        'embalagem' => "TEXT NULL",
        'detalhes'  => "TEXT NULL",
    ));
    seed_if_empty($pdo);
    seed_sync($pdo);
}

function ler_seed() {
    $json = @file_get_contents(__DIR__ . '/seed.json');
    if ($json === false) return null;
    $seed = json_decode($json, true);
    return is_array($seed) ? $seed : null;
}

function seed_if_empty($pdo) {
    $n = (int) $pdo->query("SELECT COUNT(*) FROM produtos")->fetchColumn();
    if ($n > 0) return;
    $seed = ler_seed();
    if ($seed === null) return;
    $ordem = 0;
    if (isset($seed['produtos'])) {
        foreach ($seed['produtos'] as $p) { save_produto($pdo, $p, $ordem); $ordem++; }
    }
    $ordem = 0;
    if (isset($seed['noticias'])) {
        foreach ($seed['noticias'] as $it) { save_noticia($pdo, $it, $ordem); $ordem++; }
    }
    set_setting($pdo, 'seed_version', CSP_SEED_VERSION);
}

/* Banco que ja foi populado por uma versao anterior do seed: insere apenas os
   produtos cujo id ainda nao existe. Nao toca em quem ja esta la, para nao
   desfazer edicoes feitas no painel admin. Roda uma vez por versao de seed. */
function seed_sync($pdo) {
    if (get_setting($pdo, 'seed_version') === CSP_SEED_VERSION) return;
    $seed = ler_seed();
    if ($seed === null || empty($seed['produtos'])) return;

    $existentes = array();
    foreach ($pdo->query("SELECT id FROM produtos")->fetchAll() as $r) {
        $existentes[$r['id']] = true;
    }
    $ordem = (int) $pdo->query("SELECT COALESCE(MAX(ordem),0) FROM produtos")->fetchColumn();
    foreach ($seed['produtos'] as $p) {
        $id = isset($p['id']) ? $p['id'] : '';
        if ($id === '' || isset($existentes[$id])) continue;
        $ordem++;
        save_produto($pdo, $p, $ordem);
    }
    set_setting($pdo, 'seed_version', CSP_SEED_VERSION);
}

function val($arr, $key, $def = '') { return isset($arr[$key]) ? $arr[$key] : $def; }

function save_produto($pdo, $p, $ordem = null) {
    $id = (isset($p['id']) && $p['id'] !== '') ? $p['id'] : uniqid('p_');
    $tags = isset($p['tags']) ? json_encode($p['tags'], JSON_UNESCAPED_UNICODE) : '[]';
    $sql = "INSERT INTO produtos (id,nome,categoria,categoriaLabel,marca,marcaLabel,tag,img,alt,url,tipo,embalagem,detalhes,aplicacao,descricao,tags,ordem,createdAt)
        VALUES (:id,:nome,:categoria,:categoriaLabel,:marca,:marcaLabel,:tag,:img,:alt,:url,:tipo,:embalagem,:detalhes,:aplicacao,:descricao,:tags,:ordem,:createdAt)
        ON DUPLICATE KEY UPDATE nome=VALUES(nome),categoria=VALUES(categoria),categoriaLabel=VALUES(categoriaLabel),
            marca=VALUES(marca),marcaLabel=VALUES(marcaLabel),tag=VALUES(tag),img=VALUES(img),alt=VALUES(alt),url=VALUES(url),
            tipo=VALUES(tipo),embalagem=VALUES(embalagem),detalhes=VALUES(detalhes),
            aplicacao=VALUES(aplicacao),descricao=VALUES(descricao),tags=VALUES(tags)";
    $st = $pdo->prepare($sql);
    $st->execute(array(
        ':id' => $id,
        ':nome' => (string) val($p, 'nome'),
        ':categoria' => (string) val($p, 'categoria'),
        ':categoriaLabel' => (string) val($p, 'categoriaLabel'),
        ':marca' => (string) val($p, 'marca'),
        ':marcaLabel' => (string) val($p, 'marcaLabel'),
        ':tag' => (string) val($p, 'tag'),
        ':img' => (string) val($p, 'img'),
        ':alt' => (string) val($p, 'alt'),
        ':url' => (string) val($p, 'url'),
        ':tipo' => (string) val($p, 'tipo'),
        ':embalagem' => (string) val($p, 'embalagem'),
        ':detalhes' => (string) val($p, 'detalhes'),
        ':aplicacao' => (string) val($p, 'aplicacao'),
        ':descricao' => (string) val($p, 'descricao'),
        ':tags' => $tags,
        ':ordem' => ($ordem !== null) ? (int) $ordem : 0,
        ':createdAt' => isset($p['createdAt']) ? (int) $p['createdAt'] : (int) round(microtime(true) * 1000),
    ));
    return $id;
}

function save_noticia($pdo, $p, $ordem = null) {
    $id = (isset($p['id']) && $p['id'] !== '') ? $p['id'] : uniqid('n_');
    $status = (val($p, 'status', 'publicada') === 'rascunho') ? 'rascunho' : 'publicada';
    $sql = "INSERT INTO noticias (id,titulo,categoria,data,dataLabel,resumo,conteudo,status,ordem,createdAt)
        VALUES (:id,:titulo,:categoria,:data,:dataLabel,:resumo,:conteudo,:status,:ordem,:createdAt)
        ON DUPLICATE KEY UPDATE titulo=VALUES(titulo),categoria=VALUES(categoria),data=VALUES(data),
            dataLabel=VALUES(dataLabel),resumo=VALUES(resumo),conteudo=VALUES(conteudo),status=VALUES(status)";
    $st = $pdo->prepare($sql);
    $st->execute(array(
        ':id' => $id,
        ':titulo' => (string) val($p, 'titulo'),
        ':categoria' => (string) val($p, 'categoria'),
        ':data' => (string) val($p, 'data'),
        ':dataLabel' => (string) val($p, 'dataLabel'),
        ':resumo' => (string) val($p, 'resumo'),
        ':conteudo' => (string) val($p, 'conteudo'),
        ':status' => $status,
        ':ordem' => ($ordem !== null) ? (int) $ordem : 0,
        ':createdAt' => isset($p['createdAt']) ? (int) $p['createdAt'] : (int) round(microtime(true) * 1000),
    ));
    return $id;
}

function get_setting($pdo, $k) {
    $st = $pdo->prepare("SELECT v FROM settings WHERE k = ?");
    $st->execute(array($k));
    $r = $st->fetch();
    return $r ? $r['v'] : null;
}
function set_setting($pdo, $k, $v) {
    $st = $pdo->prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)");
    $st->execute(array($k, $v));
}
