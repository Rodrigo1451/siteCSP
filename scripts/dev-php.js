/* ============================================================
   npm run dev:php
   Sobe o MariaDB local (baixando/iniciando o que for preciso) e
   depois o servidor embutido do PHP servindo public_html/, com
   a API de verdade (banco local) funcionando.
   ============================================================ */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const mariadb = require('./lib/mariadb');

const PORT = process.env.PORT || 8000;

function findPhp() {
    const probe = spawnSync('php', ['-v'], { stdio: 'ignore', shell: process.platform === 'win32' });
    if (!probe.error && probe.status === 0) return 'php';

    // PATH ainda nao foi atualizado nesta sessao (comum logo apos instalar
    // via winget) — procura direto na pasta de pacotes do WinGet.
    const base = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(base)) {
        const dir = fs.readdirSync(base).find((n) => /^PHP\.PHP[._]/i.test(n));
        if (dir) {
            const exe = path.join(base, dir, 'php.exe');
            if (fs.existsSync(exe)) return exe;
        }
    }
    return null;
}

async function main() {
    const mysqldChild = await mariadb.ensureReady();

    const php = findPhp();
    if (!php) {
        console.error('[dev-php] PHP nao encontrado. Instale com: winget install PHP.PHP.8.3');
        process.exit(1);
    }

    console.log('[dev-php] Site + API em http://localhost:' + PORT + '  (admin: /admin.html)');
    const phpChild = spawn(php, ['-S', 'localhost:' + PORT, '-t', 'public_html'], {
        cwd: mariadb.ROOT,
        stdio: 'inherit',
        env: Object.assign({}, process.env, { CSP_DEV_CONFIG: mariadb.CONFIG_PATH }),
    });

    function shutdown() {
        phpChild.kill();
        if (mysqldChild) mysqldChild.kill();
        process.exit(0);
    }
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    phpChild.on('exit', (code) => {
        if (mysqldChild) mysqldChild.kill();
        process.exit(code || 0);
    });
}

main().catch((err) => {
    console.error('[dev-php] ' + err.message);
    process.exit(1);
});
