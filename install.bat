@echo off
echo.
echo ========================================
echo   STOCKEN - Instalacion del Sistema
echo ========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js encontrado

:: Verificar pnpm
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando pnpm...
    npm install -g pnpm
)
echo [OK] pnpm encontrado

:: Verificar PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL no esta instalado o no esta en el PATH.
    echo Por favor instala PostgreSQL desde https://www.postgresql.org
    pause
    exit /b 1
)
echo [OK] PostgreSQL encontrado

echo.
echo --- Configurando Backend ---

cd backend

:: Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
pnpm install

:: Configurar .env si no existe
if not exist .env (
    echo [INFO] Creando archivo de configuracion...
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Edita el archivo backend\.env con tus datos:
    echo   - DATABASE_URL: cadena de conexion a PostgreSQL
    echo   - JWT_SECRET: clave secreta para tokens
    echo.
    notepad .env
    echo Presiona cualquier tecla cuando hayas guardado el .env...
    pause >nul
)

:: Crear base de datos
echo [INFO] Creando base de datos...
for /f "tokens=*" %%i in ('findstr "DATABASE_URL" .env') do set DB_LINE=%%i
echo Ejecuta esto en psql si la BD no existe:
echo   CREATE DATABASE stocken_dev;
echo.

:: Ejecutar migraciones
echo [INFO] Ejecutando migraciones de base de datos...
npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la migracion. Verifica que PostgreSQL este corriendo y el .env sea correcto.
    pause
    exit /b 1
)
echo [OK] Migraciones aplicadas

:: Ejecutar seed
echo [INFO] Cargando datos iniciales...
node -e "
const bcrypt = require('./node_modules/bcrypt');
const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
bcrypt.hash('admin123', 12).then(hash => {
  return prisma.user.upsert({
    where: { email: 'admin@stocken.com' },
    update: {},
    create: { fullName: 'Administrador', email: 'admin@stocken.com', passwordHash: hash, role: 'TENANT_ADMIN', isActive: true }
  });
}).then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
"
echo [OK] Usuario administrador creado

:: Build del backend
echo [INFO] Compilando backend...
pnpm run build
echo [OK] Backend compilado

cd ..

echo.
echo --- Configurando Frontend ---

cd frontend

:: Instalar dependencias del frontend
echo [INFO] Instalando dependencias del frontend...
pnpm install

:: Configurar .env del frontend
if not exist .env (
    copy .env.example .env
)

:: Build del frontend
echo [INFO] Compilando frontend...
pnpm run build
echo [OK] Frontend compilado

cd ..

echo.
echo ========================================
echo   Instalacion completada exitosamente
echo ========================================
echo.
echo Para iniciar el sistema ejecuta: start.bat
echo Usuario admin: admin@stocken.com
echo Contrasena:    admin123
echo.
echo [IMPORTANTE] Cambia la contrasena del admin despues del primer inicio.
echo.
pause