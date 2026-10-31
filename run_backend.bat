@echo off
title NyaySahayak - Backend API (FastAPI)
echo ========================================================
echo   NyaySahayak - Department of Justice Virtual Assistant
echo   Starting FastAPI Server on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
