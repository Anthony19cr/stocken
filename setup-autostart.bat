@echo off
echo Configurando inicio automatico con Windows...
pm2 startup
pm2 save
echo.
echo Stocken se iniciara automaticamente cuando encienda la computadora.
pause