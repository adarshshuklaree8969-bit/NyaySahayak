@echo off
title NyaySahayak - Official Launcher
echo ========================================================
echo   Launching NyaySahayak (न्याय सहायक)
echo   Department of Justice, Ministry of Law ^& Justice
echo ========================================================
echo.

:: Ensure Node runtime is accessible
set "PATH=C:\Users\Adarsh Kumar Shukla\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "NyaySahayak Backend API" cmd /k "%~dp0run_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/3] Starting React + Vite Frontend on http://localhost:5173 ...
start "NyaySahayak Citizen Frontend" cmd /k "%~dp0run_frontend.bat"

timeout /t 3 /nobreak >nul

echo [3/3] Opening your browser to NyaySahayak Citizen Portal...
start http://localhost:5173

echo.
echo ========================================================
echo   Application is now running!
echo   - Citizen Portal: http://localhost:5173
echo   - API Documentation: http://127.0.0.1:8000/docs
echo   - Admin Login: admin@doj.gov.in / NyayAdmin@2026
echo ========================================================
echo.
pause
