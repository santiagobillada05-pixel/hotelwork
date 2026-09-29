@echo off
title HotelWork Dev Runner
echo ===================================================
echo           Iniciando HotelWork Platform
echo ===================================================

echo [1/2] Iniciando Backend FastAPI (Puerto 8000)...
start "HotelWork Backend" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"

echo [2/2] Iniciando Frontend React Vite (Puerto 5173)...
start "HotelWork Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo  Servidores iniciados en ventanas separadas:
echo   - Backend y Docs: http://127.0.0.1:8000/docs
echo   - Frontend App:   http://localhost:5173
echo ===================================================
pause
