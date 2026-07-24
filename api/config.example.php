<?php
/* ============================================================
   MODELO de configuracao — este arquivo VAI para o Git.
   O arquivo real com as senhas NAO vai (esta no .gitignore).

   Como usar:
   - Na Hostinger: copie este arquivo para csp-config.php na pasta
     ACIMA de public_html (ex.: /home/uXXXXXXX/csp-config.php).
     Assim ninguem consegue acessar pela web.
   - No seu PC: copie para api/config.php.

   Os valores ficam em: hPanel > Bancos de dados >
   Gerenciamento de bancos de dados MySQL
   ============================================================ */
define('DB_HOST', 'localhost');
define('DB_NAME', 'SEU_BANCO_AQUI');
define('DB_USER', 'SEU_USUARIO_AQUI');
define('DB_PASS', 'SUA_SENHA_AQUI');

date_default_timezone_set('America/Sao_Paulo');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
