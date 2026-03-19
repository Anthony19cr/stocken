@echo off
echo Deteniendo Stocken...
pm2 delete stocken-backend >nul 2>&1
pm2 delete stocken-frontend >nul 2>&1
echo Sistema detenido.
pause