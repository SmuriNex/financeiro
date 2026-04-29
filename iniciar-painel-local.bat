@echo off
setlocal
cd /d "%~dp0"
set "PORT=8010"
set "URL=http://localhost:%PORT%/app-pc.html?v=%RANDOM%%RANDOM%"

echo.
echo Iniciando painel local em:
echo %URL%
echo.
echo Se o navegador nao abrir sozinho, copie o endereco acima.
echo Feche iniciadores antigos para evitar conflito de porta.
echo Para parar o servidor, feche esta janela.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%URL%'"
python serve_local.py
