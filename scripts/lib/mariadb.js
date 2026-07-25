/* ============================================================
   MariaDB portátil para desenvolvimento local — sem instalar
   nada no Windows, sem servico, sem admin. Baixa (uma vez), põe
   os dados em .devdb/ (fora do Git) e liga/desliga junto do
   "npm run dev:php".
   ============================================================ */
const fs = require('fs');
const path = require('path');
const net = require('net');
const https = require('https');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEVDB = path.join(ROOT, '.devdb');
const MARIADB_DIR = path.join(DEVDB, 'mariadb');
const DATA_DIR = path.join(DEVDB, 'data');
const LOG_FILE = path.join(DEVDB, 'mysqld.log');

const VERSION = '12.3.2';
const ZIP_URL = `https://downloads.mariadb.org/rest-api/mariadb/${VERSION}/mariadb-${VERSION}-winx64.zip`;
const ZIP_SHA256 = '67347c129eb9c5923d002ea34fbfa27c60eb95d36dd73b85af2651cdeceecac5';

const PORT = 3306;
const DB_NAME = 'csp_dev';
const DB_USER = 'csp_dev';
const DB_PASS = 'csp_dev_local';
const CONFIG_PATH = path.join(ROOT, 'public_html', 'api', 'config.php');

function log(msg) { console.log('[devdb] ' + msg); }

function mysqldPath() { return path.join(MARIADB_DIR, 'bin', 'mysqld.exe'); }
function mysqlClientPath() { return path.join(MARIADB_DIR, 'bin', 'mysql.exe'); }
function installDbPath() { return path.join(MARIADB_DIR, 'bin', 'mariadb-install-db.exe'); }

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                fs.unlink(dest, () => download(res.headers.location, dest).then(resolve, reject));
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error('Download do MariaDB falhou: HTTP ' + res.statusCode));
                return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', reject);
    });
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

async function ensureBinaries() {
    if (fs.existsSync(mysqldPath())) return;
    fs.mkdirSync(DEVDB, { recursive: true });
    const zipPath = path.join(DEVDB, 'mariadb.zip');
    log('Baixando MariaDB ' + VERSION + ' (~100MB, só na primeira vez)...');
    await download(ZIP_URL, zipPath);
    const hash = sha256(zipPath);
    if (hash !== ZIP_SHA256) {
        fs.unlinkSync(zipPath);
        throw new Error('Checksum do MariaDB não confere — download corrompido. Rode de novo.');
    }
    log('Extraindo...');
    const r = spawnSync('powershell', [
        '-NoProfile', '-Command',
        `Expand-Archive -Path "${zipPath}" -DestinationPath "${DEVDB}" -Force`
    ], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('Falha ao extrair o MariaDB.');
    const extracted = fs.readdirSync(DEVDB).find((n) => /^mariadb-.*-winx64$/i.test(n));
    if (!extracted) throw new Error('Pasta extraída do MariaDB não encontrada.');
    fs.renameSync(path.join(DEVDB, extracted), MARIADB_DIR);
    fs.unlinkSync(zipPath);
}

function ensureDataDir() {
    if (fs.existsSync(DATA_DIR)) return false;
    log('Inicializando o banco de dados local...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const r = spawnSync(installDbPath(), ['--datadir=' + DATA_DIR], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('Falha ao inicializar o datadir do MariaDB.');
    return true;
}

function isPortOpen(port, host) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ port, host }, () => {
            socket.end();
            resolve(true);
        });
        socket.on('error', () => resolve(false));
        socket.setTimeout(500, () => { socket.destroy(); resolve(false); });
    });
}

async function waitForPort(port, host, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (await isPortOpen(port, host)) return true;
        await new Promise((r) => setTimeout(r, 300));
    }
    return false;
}

async function startIfNeeded() {
    if (await isPortOpen(PORT, '127.0.0.1')) {
        log('MariaDB já está rodando em 127.0.0.1:' + PORT + '.');
        return null;
    }
    log('Iniciando MariaDB em 127.0.0.1:' + PORT + '...');
    const out = fs.openSync(LOG_FILE, 'a');
    const child = spawn(mysqldPath(), [
        '--datadir=' + DATA_DIR,
        '--port=' + PORT,
        '--bind-address=127.0.0.1',
    ], { stdio: ['ignore', out, out], detached: false });
    const ok = await waitForPort(PORT, '127.0.0.1', 20000);
    if (!ok) throw new Error('MariaDB não subiu a tempo — veja .devdb/mysqld.log');
    return child;
}

function runSql(sql) {
    const r = spawnSync(mysqlClientPath(), ['-u', 'root', '-h', '127.0.0.1', '-P', String(PORT)], {
        input: sql,
        encoding: 'utf8'
    });
    if (r.status !== 0) throw new Error('Falha ao rodar SQL de setup: ' + r.stderr);
}

function ensureAppDbAndUser() {
    runSql(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\n` +
        `CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';\n` +
        `GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';\n` +
        `FLUSH PRIVILEGES;\n`
    );
}

function ensureConfigPhp() {
    if (fs.existsSync(CONFIG_PATH)) return;
    const content = `<?php
/* ============================================================
   Credenciais de banco para DESENVOLVIMENTO LOCAL.
   Gerado automaticamente pelo MariaDB portátil em .devdb/.
   NÃO vai para o Git (está no .gitignore) e NÃO é usado em
   produção — na Hostinger quem manda é csp-config.php.
   ============================================================ */
define('DB_HOST', '127.0.0.1');
define('DB_NAME', '${DB_NAME}');
define('DB_USER', '${DB_USER}');
define('DB_PASS', '${DB_PASS}');

date_default_timezone_set('America/Sao_Paulo');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
`;
    fs.writeFileSync(CONFIG_PATH, content);
    log('Criado public_html/api/config.php (dev local).');
}

/* Garante binarios, datadir, servidor no ar, banco/usuario e config.php.
   Retorna o processo do mysqld se ele foi quem o iniciou (para poder
   encerrar junto), ou null se ja estava rodando por fora. */
async function ensureReady() {
    await ensureBinaries();
    const firstRun = ensureDataDir();
    const startedHere = await startIfNeeded();
    if (firstRun) ensureAppDbAndUser();
    ensureConfigPhp();
    return startedHere;
}

module.exports = {
    ROOT, DEVDB, MARIADB_DIR, DATA_DIR, PORT, DB_NAME, DB_USER, DB_PASS, CONFIG_PATH,
    ensureReady, mysqldPath,
};
