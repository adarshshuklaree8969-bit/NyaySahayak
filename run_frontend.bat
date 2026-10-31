@echo off
title NyaySahayak - Frontend (Vite + React)
echo ========================================================
echo   NyaySahayak - Department of Justice Virtual Assistant
echo   Starting Frontend Server on http://localhost:5173
echo ========================================================

:: Ensure Node runtime is in PATH
set "PATH=C:\Users\Adarsh Kumar Shukla\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"

cd /d "%~dp0frontend"
node ./node_modules/vite/bin/vite.js --host --port 5173
pause
