# Stocken — Sistema de Gestión de Inventario

Sistema profesional de gestión de inventario para restaurantes.

---

## Requisitos previos

Antes de instalar, asegúrate de tener instalado:

- **Node.js** v20 o superior — https://nodejs.org
- **PostgreSQL** v14 o superior — https://www.postgresql.org

---

## Instalación

### Paso 1 — Configurar la base de datos

Abre pgAdmin o la terminal de PostgreSQL y crea la base de datos:
```sql
CREATE DATABASE stocken_dev;
```

### Paso 2 — Configurar variables de entorno

Edita el archivo `backend/.env` con tus datos de conexión:
```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/stocken_dev"
JWT_SECRET="una-clave-secreta-larga-y-segura"
```

### Paso 3 — Ejecutar la instalación

Haz doble clic en `install.bat` y sigue las instrucciones en pantalla.

---

## Iniciar el sistema

Haz doble clic en `start.bat`.

El sistema estará disponible en: **http://localhost:5173**

---

## Credenciales iniciales

| Campo | Valor |
|---|---|
| Email | admin@stocken.com |
| Contraseña | admin123 |

**Importante:** Cambia la contraseña del administrador después del primer inicio desde la página de Usuarios.

---

## Inicio automático con Windows

Para que el sistema arranque automáticamente cuando se encienda la computadora:

1. Ejecuta `start.bat` una vez
2. Luego ejecuta `setup-autostart.bat`

---

## Comandos útiles
```bash
# Ver estado del sistema
pm2 status

# Ver logs en tiempo real
pm2 logs

# Detener el sistema
pm2 delete all

# Reiniciar después de cambios
pm2 restart all
```

---

## Estructura del proyecto
```
stocken/
  backend/     # API REST (NestJS)
  frontend/    # Interfaz web (React)
  install.bat  # Script de instalación
  start.bat    # Script de arranque
  stop.bat     # Script de parada
  README.md    # Este archivo
```

---

## Soporte

Para soporte técnico contacta al desarrollador.
Correo: anthonydavidsalassalas@gmail.com