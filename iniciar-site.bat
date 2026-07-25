@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Comercial Sao Pedro - site local
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao foi encontrado neste computador.
    echo Instale em https://nodejs.org/ ^(versao LTS^) e rode este arquivo de novo.
    echo.
    pause
    exit /b 1
)

echo Verificando dependencias do projeto...
call npm install --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo [ERRO] "npm install" falhou. Veja a mensagem acima.
    pause
    exit /b 1
)

echo.
echo Iniciando o servidor local em http://localhost:3000 ...
start "CSP - servidor local (nao feche)" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Pronto! O site abriu no navegador.
echo Para PARAR o servidor, feche a janela "CSP - servidor local".
echo.
pause
