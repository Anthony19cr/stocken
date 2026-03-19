@echo off
echo.
echo ========================================
echo   STOCKEN - Iniciando Sistema
echo ========================================
echo.

:: Verificar PM2
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando PM2...
    npm install -g pm2
)

:: Detener instancias anteriores si existen
pm2 delete stocken-backend >nul 2>&1

:: Iniciar backend con PM2
echo [INFO] Iniciando backend...
cd backend
pm2 start dist/main.js --name stocken-backend
cd ..

echo [OK] Backend iniciado

:: Guardar configuracion de PM2 para arranque automatico
pm2 save

:: Iniciar frontend (sirve el build estático)
echo [INFO] Iniciando frontend...
cd frontend

:: Verificar si serve esta instalado
npx serve --version >nul 2>&1
if %errorlevel% neq 0 (
    npm install -g serve
)

pm2 delete stocken-frontend >nul 2>&1
pm2 start "npx serve -s dist -l 5173" --name stocken-frontend
cd ..

pm2 save

echo.
echo ========================================
echo   Sistema iniciado correctamente
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Para ver el estado: pm2 status
echo Para ver logs:      pm2 logs
echo Para detener todo:  stop.bat
echo.
pause