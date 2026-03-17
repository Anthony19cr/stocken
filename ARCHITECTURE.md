# ARCHITECTURE.md — Restaurant Inventory Management Platform
## Referencia Arquitectónica del Sistema

> Este documento es la **referencia técnica de arquitectura** del proyecto.
> Debe leerse junto con `CLAUDE.md`, que define los estándares de código y las reglas de comportamiento del agente.
> Ante cualquier contradicción entre documentos, `CLAUDE.md` tiene precedencia en reglas de código; este documento tiene precedencia en decisiones de diseño del sistema.

---

## 1. Propósito

Este documento define la arquitectura objetivo de **RestockIQ**, una plataforma SaaS de gestión de inventario para restaurantes diseñada como **producto base reutilizable**.

El sistema debe ser:
- Listo para producción desde la primera iteración
- Modular y configurable
- White-label friendly
- Extensible para múltiples clientes restaurante
- Mantenible a estándares de ingeniería senior

**Esto no es un proyecto descartable. Es la base arquitectónica de un producto vendible.**

---

## 2. Alcance del Producto

### v1 — En Scope

| Capacidad | Descripción |
|---|---|
| Autenticación y autorización | Login, JWT, RBAC, permisos por rol |
| Catálogo de productos | Productos, categorías, unidades de medida |
| Gestión de proveedores | CRUD de proveedores, relación con productos |
| Control de inventario | Stock actual, snapshot por producto |
| Entradas de inventario | Registro de ingresos, costo, fecha de vencimiento |
| Salidas de inventario | Consumo, merma, ajustes de salida |
| Trazabilidad de movimientos | Ledger inmutable de todos los cambios de stock |
| Alertas | Bajo stock, sin stock, productos por vencer |
| Dashboard | Métricas operativas clave |
| Reportes | Consumo, rotación, vencimientos, movimientos |
| Configuración | Parámetros del negocio, umbrales, zona horaria |
| Branding configurable | Nombre, logo, colores — sin hardcoding |
| Feature flags | Activación/desactivación de módulos por tenant |
| Audit trail | Registro de acciones sensibles con actor y contexto |

### v1 — Fuera de Scope

Los siguientes módulos están **explícitamente excluidos** de v1. La arquitectura debe anticiparlos sin implementarlos:

- POS / facturación
- Costeo de recetas por ítem de menú
- App móvil nativa
- Ciclo completo de órdenes de compra
- Balanceo real de stock entre múltiples sucursales
- Arquitectura offline-first

> Estos módulos pueden agregarse en futuras versiones sin romper la arquitectura actual si se respetan los principios de este documento.

---

## 3. Estilo Arquitectónico

### Decisión: Monolito Modular

RestockIQ v1 se construye como un **monolito modular**. Esta es una decisión deliberada, no una limitación.

**Por qué no microservicios en v1:**

| Factor | Monolito Modular | Microservicios |
|---|---|---|
| Velocidad de entrega | ✅ Alta | ❌ Lenta (overhead operacional) |
| Complejidad operacional | ✅ Baja | ❌ Alta (red, descubrimiento, etc.) |
| Fronteras internas | ✅ Fuertes si se diseñan bien | ✅ Fuertes por naturaleza |
| Desarrollo local | ✅ Simple | ❌ Complejo (orquestación local) |
| Path a extracción futura | ✅ Limpio con módulos bien aislados | — |

Los módulos están diseñados con **fronteras internas limpias** que permitirían extraerlos como servicios independientes en el futuro si la escala lo justifica — sin reescribir la lógica de negocio.

### Estilo de API

- RESTful JSON API
- API-first: el backend se diseña y documenta antes de consumirse desde el frontend
- Versionado de rutas desde el inicio: `/api/v1/`
- Documentación Swagger automática en `/api/docs`

---

## 4. Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                        │
│                   React + TypeScript + Vite                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST JSON
┌─────────────────────────▼───────────────────────────────────────┐
│                    API Gateway (NestJS)                         │
│           JWT Auth · CORS · Helmet · Rate Limiting              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │   Auth   │ │ Products │ │Inventory │ │     Reports        │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │  Users   │ │Suppliers │ │ Alerts   │ │  Settings/Branding │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────────────┐ │
│  │  Roles   │ │  Audit   │ │         Feature Flags            │ │
│  └──────────┘ └──────────┘ └──────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────────┐
│                       PostgreSQL 16                             │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Redis (Cache + Queue)                        │
│            BullMQ jobs · Cached tenant config                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Módulos del Sistema

Cada módulo es una unidad cohesiva con responsabilidad única. Los módulos se comunican exclusivamente a través de sus **services públicos**, nunca accediendo directamente a los repositories de otro módulo.

### 5.1 Auth
- Login / logout
- Emisión y validación de JWT (access + refresh tokens)
- Hash y verificación de contraseñas
- Invalidación de tokens al cambiar contraseña

### 5.2 Users
- CRUD de usuarios
- Estado activo/inactivo
- Asignación de rol

### 5.3 Roles y Permissions
- Definición de roles (`TENANT_ADMIN`, `MANAGER`, `WAREHOUSE`, `VIEWER`)
- Mapeo de permisos por rol
- Autorización por acción en controllers

### 5.4 Products
- Catálogo de productos (nombre, SKU, categoría, unidad, stock mínimo)
- Estado activo/inactivo con soft delete
- Flag `tracksExpiration` por producto
- Relación opcional con proveedor

### 5.5 Categories
- Categorías de productos (ej: lácteos, carnes, bebidas)
- Usadas para filtros y reportes

### 5.6 Units
- Unidades de medida (`kg`, `g`, `l`, `ml`, `unit`, `box`, etc.)
- Referencian la unidad base del producto (no se mezclan unidades)

### 5.7 Suppliers
- CRUD de proveedores (nombre, teléfono, email, notas)
- Estado activo/inactivo
- Relación opcional con productos

### 5.8 Inventory
- Vista de stock actual por producto
- El stock actual es siempre un **snapshot derivado** de los movimientos
- Gestión de almacenes/ubicaciones cuando `MULTI_WAREHOUSE` esté activo

### 5.9 StockMovements
- Ledger inmutable de todos los cambios de stock
- Cada movimiento registra: tipo, cantidad, dirección, stock antes/después, actor, timestamp
- Nunca se editan ni eliminan registros de este módulo

### 5.10 Entries (Entradas)
- Registro de ingresos de mercadería
- Vinculación con proveedor y costo unitario
- Captura de fecha de vencimiento (si `tracksExpiration`)
- Genera `StockMovement` de tipo `PURCHASE`

### 5.11 Outputs (Salidas)
- Registro de consumo, merma y ajustes de salida
- Captura de razón obligatoria
- Genera `StockMovement` de tipo `SALE`, `WASTE`, o `ADJUSTMENT_OUT`

### 5.12 Alerts
- Detección de bajo stock (`currentStock <= minimumStock`)
- Detección de sin stock (`currentStock <= 0`)
- Alertas de vencimiento próximo (`expirationDate <= today + expirationAlertDays`)
- Procesamiento asíncrono vía cola de trabajos (BullMQ)

### 5.13 Reports
- Historial de movimientos por rango de fechas
- Productos más consumidos
- Productos con bajo stock
- Productos por vencer
- Salidas por razón
- Entradas por proveedor
- Exportación CSV (PDF en v2 si el tiempo lo permite)

### 5.14 Dashboard
- Resumen operativo: total de productos, alertas activas, movimientos recientes
- Métricas rápidas para el rol ejecutivo

### 5.15 Settings
- Parámetros de negocio por tenant: timezone, moneda, formato de fecha
- Umbrales de alertas: `expirationAlertDays`, `allowNegativeStock`
- Registro único por tenant

### 5.16 Branding
- Nombre del sistema y del restaurante
- Logo, favicon, colores, fuente
- Ningún valor de marca existe en el código fuente

### 5.17 FeatureFlags
- Activación/desactivación de módulos por tenant
- Evaluados en navegación (frontend) y en guards de endpoints (backend)

### 5.18 Audit
- Registro de acciones sensibles: quién, qué, cuándo, estado antes/después
- Acciones auditadas: ajustes manuales, cambios de configuración, gestión de usuarios, cambios de permisos

---

## 6. Arquitectura del Frontend

### Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | ^18.x | UI library |
| TypeScript | ^5.x | Type safety |
| Vite | ^5.x | Build tool |
| React Router | ^6.x | Routing |
| TanStack Query | ^5.x | Server state |
| React Hook Form | ^7.x | Formularios |
| Zod | ^3.x | Validación de esquemas |
| Tailwind CSS | ^3.x | Estilos |
| shadcn/ui + @radix-ui | latest | Componentes accesibles |

### Estructura de Directorios

```
frontend/src/
  app/
    router/             # Definición de rutas y grupos
    providers/          # Providers globales (QueryClient, TenantTheme, Auth)
    layouts/            # Shell principal, layout público
  features/             # Un directorio por módulo de negocio
    auth/
      components/
      hooks/
      services/
      schemas/
      types/
      pages/
      index.ts          # Barrel export — solo API pública
    dashboard/
    inventory/
    entries/
    outputs/
    expiring-products/
    suppliers/
    reports/
    users/
    roles/
    settings/
    branding/
    feature-flags/
  components/
    ui/                 # Componentes base genéricos (Button, Input, Modal, Table)
    layout/             # Sidebar, Header, Navigation
    shared/             # Componentes de dominio compartidos entre features
  hooks/                # Custom hooks globales (useDebounce, usePermission, etc.)
  lib/                  # Instancias configuradas (axiosInstance, queryClient)
  providers/            # TenantThemeProvider, AuthProvider
  store/                # Estado UI global (zustand — NUNCA server state)
  types/                # Tipos globales compartidos
  utils/                # Funciones puras con propósito específico
  config/               # Constantes de configuración del cliente
```

### Estrategia de Routing

```
/login                          → público
/dashboard                      → autenticado
/inventory                      → autenticado + permiso inventory.read
/inventory/entries              → autenticado + permiso entries.create
/inventory/outputs              → autenticado + permiso outputs.create
/inventory/expiring             → autenticado + feature expirationTrackingEnabled
/suppliers                      → autenticado + feature suppliersEnabled
/reports                        → autenticado + feature reportsEnabled
/settings                       → autenticado + permiso settings.manage
/users                          → autenticado + permiso users.manage
/roles                          → autenticado + permiso roles.manage
```

La visibilidad de la navegación depende de **permisos del usuario** y **feature flags activos**. Un elemento no visible tampoco es accesible via URL directa.

### Flujo de Datos

```
Página / Componente de Feature
    │
    ├─ useQuery / useMutation  (TanStack Query)
    │       │
    │       └─ featureService.getAll(filters)  (axios service)
    │               │
    │               └─ GET /api/v1/feature  (HTTP)
    │
    └─ useForm + zodResolver  (React Hook Form + Zod)
            │
            └─ Validación local → submit → mutación
```

**Regla de estado:**
- **Server state** → TanStack Query (siempre)
- **Estado UI local** → useState / useReducer
- **Estado UI global** → zustand (solo estado de interfaz: sidebar abierto, tema, etc.)
- **Estado de servidor en zustand** → ❌ nunca

### Estándares de UI

El sistema debe verse como un **dashboard SaaS profesional**:
- Espaciado consistente
- Patrones de tabla y formulario uniformes
- Estados de carga, vacío y error explícitos
- Mensajes de error comprensibles para el usuario final
- Responsive para desktop y tablet
- Accesible (ARIA, navegación por teclado en componentes críticos)

---

## 7. Arquitectura del Backend

### Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | ^20.x LTS | Runtime |
| NestJS | ^10.x | Framework |
| TypeScript | ^5.x | Type safety |
| Prisma ORM | ^5.x | Acceso a datos |
| PostgreSQL | ^16.x | Base de datos |
| JWT | ^9.x | Autenticación |
| Swagger/OpenAPI | ^7.x | Documentación |
| BullMQ | latest | Cola de trabajos async |
| Redis | ^7.x | Cache + cola |
| Winston | latest | Logging estructurado |

### Estructura de Directorios

```
backend/src/
  modules/
    auth/
    users/
    roles/
    permissions/
    products/
    categories/
    units/
    suppliers/
    inventory/
    stock-movements/
    entries/
    outputs/
    alerts/
    reports/
    dashboard/
    settings/
    branding/
    feature-flags/
    audit/
  shared/
    guards/           # JwtAuthGuard, TenantGuard, RolesGuard, FeatureFlagGuard
    decorators/       # @CurrentUser(), @TenantId(), @Roles(), @RequireFeature()
    filters/          # GlobalExceptionFilter
    interceptors/     # LoggingInterceptor, TransformResponseInterceptor
    pipes/            # GlobalValidationPipe
    exceptions/       # AppException, BusinessRuleException, ResourceNotFoundException
    utils/            # Funciones utilitarias con propósito específico
    constants/        # Constantes globales del sistema
  config/             # ConfigModule: validación de variables de entorno
  prisma/             # PrismaService, schema, migrations, seeds
  jobs/               # Procesadores de BullMQ (alertas, reportes async)
  main.ts
```

### Capas por Módulo

```
Controller  →  recibe HTTP, valida con DTO, delega al Service, devuelve respuesta
Service     →  lógica de negocio, validaciones de dominio, orquesta operaciones
Repository  →  (solo si la complejidad de queries lo justifica) abstrae Prisma
Prisma      →  acceso directo a BD — solo desde Service o Repository
```

**Regla de capas:** Ninguna capa salta a otra no adyacente. Un Controller nunca accede a Prisma directamente.

### Estructura Interna de un Módulo

```
modules/stock-movements/
  dto/
    create-stock-movement.dto.ts
    stock-movement-response.dto.ts
    stock-movement-filters.dto.ts
  stock-movements.controller.ts
  stock-movements.service.ts
  stock-movements.module.ts
  stock-movements.service.spec.ts
  stock-movements.controller.spec.ts
```

---

## 8. Modelo de Datos

### 8.1 Entidades Principales y Relaciones

```
TenantSettings  1:1  TenantBranding
TenantSettings  1:N  FeatureFlag

Role            1:N  User
Role            N:M  Permission  (via RolePermission)

Category        1:N  Product
Unit            1:N  Product
Supplier        1:N  Product     (opcional)

Product         1:1  StockLevel
Product         1:N  StockMovement
Product         1:N  InventoryEntry
Product         1:N  InventoryOutput
Product         1:N  Alert       (opcional)

User            1:N  StockMovement   (performedBy)
User            1:N  InventoryEntry  (performedBy)
User            1:N  InventoryOutput (performedBy)
User            1:N  AuditLog        (actor)

Supplier        1:N  InventoryEntry  (opcional)
```

### 8.2 Entidades del Sistema (v1 Single-Tenant)

#### TenantSettings
Registro único de configuración de la instancia.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `restaurantName` | string | Nombre del negocio |
| `systemName` | string | Nombre del producto en esta instancia |
| `timezone` | string | Ej: `America/Costa_Rica` |
| `currency` | string | Ej: `CRC`, `USD` |
| `dateFormat` | string | Ej: `DD/MM/YYYY` |
| `expirationAlertDays` | int | Días de anticipación para alertas |
| `allowNegativeStock` | bool | Default: `false` |

#### TenantBranding
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `restaurantName` | string | |
| `logoUrl` | string? | |
| `faviconUrl` | string? | |
| `primaryColor` | string | Default: `#2563EB` |
| `secondaryColor` | string | Default: `#64748B` |
| `accentColor` | string | Default: `#F59E0B` |
| `fontFamily` | string | Default: `Inter` |
| `emailFrom` | string? | Para notificaciones |
| `timezone` | string | Default: `UTC` |
| `locale` | string | Default: `es-CR` |
| `currency` | string | Default: `CRC` |

#### User
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `fullName` | string | |
| `email` | string | Único |
| `passwordHash` | string | bcrypt, nunca expuesto en respuestas |
| `roleId` | uuid | FK → Role |
| `isActive` | bool | Default: `true` |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

#### Role / Permission / RolePermission
Modelo RBAC estándar. Los permisos son códigos de string (`products.create`, `settings.manage`, etc.).

#### Product
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `sku` | string? | Único, regex `^[A-Z0-9-]+$` |
| `name` | string | |
| `categoryId` | uuid | FK → Category |
| `unitId` | uuid | FK → Unit |
| `supplierId` | uuid? | FK → Supplier |
| `minimumStock` | Decimal(10,3) | Umbral de alerta |
| `maximumStock` | Decimal(10,3)? | Umbral de overflow |
| `tracksExpiration` | bool | Default: `false` |
| `isActive` | bool | Default: `true` |
| `notes` | string? | |
| `deletedAt` | datetime? | Soft delete |

#### StockLevel (Snapshot actual)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `productId` | uuid | FK → Product, único |
| `currentStock` | Decimal(10,3) | Proyección actual |
| `lastMovementId` | uuid? | Ref al último movimiento aplicado |
| `updatedAt` | datetime | Siempre actualizado en transacción |

#### StockMovement (Ledger inmutable)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `productId` | uuid | FK → Product |
| `type` | enum | Ver tipos abajo |
| `quantity` | Decimal(10,3) | Siempre positivo |
| `direction` | enum | `IN` / `OUT` |
| `stockBefore` | Decimal(10,3) | Snapshot antes |
| `stockAfter` | Decimal(10,3) | Snapshot después |
| `unitCost` | Decimal(10,2)? | Solo en entradas |
| `referenceType` | enum? | `ENTRY`, `OUTPUT`, `ADJUSTMENT`, etc. |
| `referenceId` | uuid? | ID del documento origen |
| `reason` | string? | Obligatorio en ajustes y merma |
| `notes` | string? | |
| `performedByUserId` | uuid | FK → User |
| `occurredAt` | datetime | Generado en servidor (UTC) |
| `createdAt` | datetime | |
| ~~`updatedAt`~~ | — | No existe: los movimientos son inmutables |
| ~~`deletedAt`~~ | — | No existe: los movimientos son inmutables |

**Tipos de movimiento:**

| Tipo | Dirección | Descripción |
|---|---|---|
| `PURCHASE` | IN | Entrada por compra |
| `SALE` | OUT | Salida por consumo/venta |
| `ADJUSTMENT_IN` | IN | Ajuste positivo (inventario físico) |
| `ADJUSTMENT_OUT` | OUT | Ajuste negativo (inventario físico) |
| `WASTE` | OUT | Merma o vencimiento |
| `TRANSFER_IN` | IN | Transferencia desde otro almacén |
| `TRANSFER_OUT` | OUT | Transferencia hacia otro almacén |
| `INITIAL` | IN | Carga inicial al crear el producto |
| `RETURN` | IN | Devolución de proveedor o cliente |

#### InventoryEntry
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `productId` | uuid | FK → Product |
| `supplierId` | uuid? | FK → Supplier |
| `quantity` | Decimal(10,3) | |
| `unitCost` | Decimal(10,2)? | |
| `entryDate` | date | |
| `expirationDate` | date? | Solo si `product.tracksExpiration` |
| `notes` | string? | |
| `performedByUserId` | uuid | FK → User |
| `movementId` | uuid | FK → StockMovement generado |
| `createdAt` | datetime | |

#### InventoryOutput
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `productId` | uuid | FK → Product |
| `quantity` | Decimal(10,3) | |
| `outputDate` | date | |
| `outputReason` | enum | `KITCHEN_USE`, `WASTE`, `EXPIRED`, `ADJUSTMENT`, `OTHER` |
| `notes` | string? | |
| `performedByUserId` | uuid | FK → User |
| `movementId` | uuid | FK → StockMovement generado |
| `createdAt` | datetime | |

#### Alert
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `productId` | uuid | FK → Product |
| `alertType` | enum | `STOCK_LOW`, `STOCK_OUT`, `EXPIRATION_SOON`, `STOCK_OVERFLOW`, `HIGH_WASTE` |
| `status` | enum | `ACTIVE`, `RESOLVED`, `DISMISSED` |
| `detectedAt` | datetime | |
| `resolvedAt` | datetime? | |

#### AuditLog
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `entityType` | string | Ej: `Product`, `Settings`, `User` |
| `entityId` | uuid | |
| `action` | string | Ej: `DEACTIVATED`, `UPDATED`, `PERMISSION_CHANGED` |
| `beforeJson` | json? | Estado anterior (en cambios de configuración) |
| `afterJson` | json? | Estado posterior |
| `actorUserId` | uuid | FK → User |
| `createdAt` | datetime | |

#### FeatureFlag
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `feature` | enum | Ver lista en CLAUDE.md §12 |
| `isEnabled` | bool | Default: `false` |
| `config` | json? | Configuración específica del feature |
| `updatedBy` | uuid? | FK → User |

### 8.3 Índices de Base de Datos Recomendados

```sql
-- Consultas frecuentes de inventario
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, occurred_at);
CREATE INDEX idx_stock_movements_type_date ON stock_movements(type, occurred_at);
CREATE INDEX idx_inventory_entries_date ON inventory_entries(entry_date);
CREATE INDEX idx_inventory_entries_expiration ON inventory_entries(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_inventory_outputs_date ON inventory_outputs(output_date);

-- Consultas de productos
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id, is_active);
CREATE INDEX idx_products_active ON products(is_active);

-- Alertas
CREATE INDEX idx_alerts_type_status ON alerts(alert_type, status);
CREATE INDEX idx_alerts_product ON alerts(product_id, status);

-- Auditoría
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at);

-- Suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name) WHERE is_active = true;
```

---

## 9. Modelo de Integridad de Stock

Esta es la parte más crítica del sistema. Su correcta implementación garantiza la trazabilidad y el valor del producto.

### 9.1 Principio Fundamental

**El stock actual (`StockLevel.currentStock`) es un snapshot de conveniencia, no la fuente de verdad.**

La fuente de verdad es el historial de movimientos (`StockMovement`). El snapshot existe solo para consultas rápidas. Siempre debe ser reconstruible desde los movimientos.

### 9.2 Flujo Obligatorio para Toda Mutación de Stock

```
1. Validar reglas de negocio (stock suficiente, producto activo, etc.)
2. Crear el registro de negocio (InventoryEntry u InventoryOutput)
3. Crear el StockMovement (con stockBefore y stockAfter capturados)
4. Actualizar StockLevel.currentStock
5. Todo lo anterior en una única transacción de BD
6. Evaluar alertas de forma asíncrona (BullMQ job)
```

```typescript
// Implementación de referencia — ver CLAUDE.md §10 RN-02 para código completo
return this.prisma.$transaction(async (tx) => {
  // 1. Leer stock actual
  const stockLevel = await tx.stockLevel.findUniqueOrThrow({ ... });
  // 2. Calcular nuevo stock
  const newStock = /* ... */;
  // 3. Validar reglas
  if (newStock.isNegative() && !settings.allowNegativeStock) throw ...;
  // 4. Crear movimiento (inmutable)
  const movement = await tx.stockMovement.create({ ... });
  // 5. Actualizar snapshot
  await tx.stockLevel.update({ data: { currentStock: newStock, lastMovementId: movement.id } });
  return movement;
});
```

### 9.3 Inmutabilidad de Movimientos

Los registros de `StockMovement`:
- **No tienen `updatedAt`** — no se actualizan jamás
- **No tienen `deletedAt`** — no se eliminan jamás
- Son solo de lectura después de su creación
- Constituyen el audit trail permanente del inventario

### 9.4 Tracking de Vencimientos — Opciones de Implementación

**Opción A — Simple (recomendada para v1)**
Almacenar `expirationDate` en `InventoryEntry`. Los reportes de vencimiento se derivan de entradas con stock pendiente. Rápido de construir, suficiente para la mayoría de casos.

**Opción B — Por Lotes (para v2 o si es requisito desde el día 1)**
Introducir `InventoryLot` con `remainingQuantity` y `expirationDate`. Más preciso para workflows de FIFO/FEFO, pero significativamente más complejo.

> **Decisión de v1:** Implementar Opción A. Registrar en `architecture-decisions.md` si el cliente requiere Opción B desde el inicio.

---

## 10. Diseño de la API

### 10.1 Convenciones Generales

- Base path: `/api/v1/`
- Autenticación: `Authorization: Bearer <token>` en todos los endpoints protegidos
- Formato de fechas: ISO 8601 UTC en requests y responses
- Cantidades numéricas: string en requests (para preservar precisión decimal), number en responses
- IDs: UUID v4

### 10.2 Estructura de Respuesta Estándar

**Respuesta exitosa — recurso único:**
```json
{
  "data": { "id": "...", "name": "Tomate cherry", "..." : "..." },
  "meta": null,
  "error": null
}
```

**Respuesta exitosa — lista paginada:**
```json
{
  "data": [ { "..." : "..." } ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 58,
    "totalPages": 3
  },
  "error": null
}
```

**Respuesta de error:**
```json
{
  "data": null,
  "meta": null,
  "error": {
    "statusCode": 422,
    "code": "INSUFFICIENT_STOCK",
    "message": "No hay stock suficiente para registrar la salida.",
    "details": { "available": "5.000", "requested": "10.000" },
    "timestamp": "2025-03-16T14:30:00.000Z",
    "path": "/api/v1/outputs"
  }
}
```

### 10.3 Endpoints por Módulo

#### Auth
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

#### Users
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id        (soft deactivate)
```

#### Roles & Permissions
```
GET    /api/v1/roles
POST   /api/v1/roles
PATCH  /api/v1/roles/:id
GET    /api/v1/permissions
PATCH  /api/v1/roles/:id/permissions
```

#### Products
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id     (soft deactivate)
GET    /api/v1/products/:id/movements
GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/units
```

#### Suppliers
```
GET    /api/v1/suppliers
POST   /api/v1/suppliers
GET    /api/v1/suppliers/:id
PATCH  /api/v1/suppliers/:id
DELETE /api/v1/suppliers/:id    (soft deactivate)
```

#### Inventory
```
GET    /api/v1/inventory                    (stock actual de todos los productos)
GET    /api/v1/inventory/:productId         (stock de un producto)
POST   /api/v1/inventory/adjust             (ajuste manual — requiere reason)
```

#### Entries
```
GET    /api/v1/entries
POST   /api/v1/entries
GET    /api/v1/entries/:id
```

#### Outputs
```
GET    /api/v1/outputs
POST   /api/v1/outputs
GET    /api/v1/outputs/:id
```

#### Stock Movements
```
GET    /api/v1/stock-movements
GET    /api/v1/stock-movements/:id
```

#### Alerts
```
GET    /api/v1/alerts
PATCH  /api/v1/alerts/:id/resolve
PATCH  /api/v1/alerts/:id/dismiss
```

#### Dashboard
```
GET    /api/v1/dashboard/summary
```

#### Reports
```
GET    /api/v1/reports/movements
GET    /api/v1/reports/consumption
GET    /api/v1/reports/rotation
GET    /api/v1/reports/expiring
GET    /api/v1/reports/low-stock
GET    /api/v1/reports/consumption/export    (CSV)
```

#### Settings & Branding
```
GET    /api/v1/settings
PATCH  /api/v1/settings
GET    /api/v1/branding
PATCH  /api/v1/branding
```

#### Feature Flags
```
GET    /api/v1/feature-flags
PATCH  /api/v1/feature-flags/:feature
```

#### Audit
```
GET    /api/v1/audit-logs
```

### 10.4 Parámetros de Filtro Estándar para Listas

```
?page=1
?pageSize=20
?search=tomate
?categoryId=uuid
?productId=uuid
?supplierId=uuid
?dateFrom=2025-01-01
?dateTo=2025-03-31
?type=PURCHASE
?isActive=true
?sortBy=name
?sortOrder=asc
```

---

## 11. Modelo de Autorización

### 11.1 Roles del Sistema

| Rol | Descripción |
|---|---|
| `TENANT_ADMIN` | Acceso completo incluyendo configuración, usuarios y roles |
| `MANAGER` | Operaciones de inventario, reportes, aprobación de ajustes |
| `WAREHOUSE` | Registro de entradas, salidas y movimientos |
| `VIEWER` | Consulta de inventario y reportes — sin acceso a configuración |

### 11.2 Permisos por Módulo

| Permiso | Descripción |
|---|---|
| `products.read` | Consultar catálogo |
| `products.create` | Crear productos |
| `products.update` | Editar productos |
| `products.deactivate` | Desactivar productos |
| `suppliers.read` | Consultar proveedores |
| `suppliers.manage` | CRUD de proveedores |
| `inventory.read` | Ver stock actual |
| `entries.create` | Registrar entradas |
| `outputs.create` | Registrar salidas |
| `inventory.adjust` | Realizar ajustes manuales (requiere reason) |
| `reports.read` | Acceder a reportes |
| `settings.manage` | Modificar configuración |
| `users.manage` | CRUD de usuarios |
| `roles.manage` | Gestionar roles y permisos |
| `audit.read` | Consultar audit logs |

### 11.3 Doble Verificación

Los permisos **siempre** se verifican en el backend. El frontend puede usarlos para dar forma a la UI, pero el backend es la fuente de verdad de autorización.

---

## 12. Estrategia de Reporting

### 12.1 Parámetros Comunes de Filtro

Todos los reportes soportan: `dateFrom`, `dateTo`, `productId`, `categoryId`, `supplierId`, `movementType`.

### 12.2 Tipos de Reporte en v1

| Reporte | Descripción | Agrupación |
|---|---|---|
| Historial de movimientos | Todos los movimientos en rango | Por fecha |
| Consumo | Salidas por tipo en rango | Por producto |
| Rotación | Productos más/menos movidos | Por producto |
| Vencimientos | Entradas con fecha próxima | Por fecha de vencimiento |
| Bajo stock | Productos bajo su mínimo | Por categoría |
| Entradas por proveedor | Volumen por proveedor en rango | Por proveedor |

### 12.3 Exportación

- **v1:** CSV para todos los reportes
- **v2:** PDF con branding del tenant si el tiempo lo permite

Los headers del reporte deben usar `TenantBranding.restaurantName` y `logoUrl`.

---

## 13. Estrategia de Performance

### 13.1 Frontend

- Paginación server-side para todas las tablas con >20 registros potenciales
- Queries filtradas en el servidor (no cargar todos y filtrar en cliente)
- `staleTime` apropiado por tipo de dato en TanStack Query:
  - Config del tenant: `Infinity` (rara vez cambia)
  - Listas de productos: `5 minutos`
  - Stock actual: `1 minuto`
  - Alertas activas: `30 segundos`

### 13.2 Backend

- Paginación obligatoria en todos los endpoints de lista
- Índices en columnas de filtro frecuente (ver §8.3)
- Evitar N+1 queries con `include` de Prisma apropiado
- Pre-computar resumen del dashboard, no calcularlo en cada request
- Procesamiento de alertas fuera del request cycle (BullMQ)

### 13.3 Base de Datos

- Usar `Decimal` para cantidades de stock (nunca `Float`)
- Timestamps siempre en UTC
- Soft delete en lugar de eliminación física para entidades con historial

---

## 14. DevOps y Entornos

### 14.1 Entornos

| Entorno | Descripción |
|---|---|
| `local` | Desarrollo con Docker Compose |
| `staging` | Validación pre-producción (opcional en v1) |
| `production` | Despliegue real del cliente |

### 14.2 Docker Compose (Local)

```yaml
services:
  frontend:    # Vite dev server — puerto 5173
  backend:     # NestJS — puerto 3001
  postgres:    # PostgreSQL 16 — puerto 5432
  redis:       # Redis 7 — puerto 6379
```

### 14.3 Variables de Entorno

Ver `CLAUDE.md` Apéndice para lista completa de variables con `.env.example`.

Regla: Ningún secret en código fuente. Nunca commitear `.env`.

### 14.4 CI/CD con GitHub Actions

Pipeline mínimo:
1. `lint` — ESLint + TypeScript check
2. `test` — Unit tests + cobertura
3. `build` — Build de producción (frontend y backend)
4. `audit` — `npm audit` (bloquea en vulnerabilidades altas/críticas)
5. `e2e` — Playwright en ambiente de test (opcional en PR, obligatorio en main)

---

## 15. Estructura del Repositorio

```
project-root/
  CLAUDE.md                     # Guía de desarrollo y reglas del agente
  ARCHITECTURE.md               # Este documento
  README.md                     # Setup, comandos y onboarding
  engineering-notes/
    solved-errors.md
    architecture-decisions.md
    performance-notes.md
    refactoring-log.md
  frontend/
    src/
    public/
    index.html
    vite.config.ts
    tsconfig.json
    package.json
  backend/
    src/
    prisma/
      schema.prisma
      migrations/
      seeds/
    .env.example
    tsconfig.json
    package.json
  docker/
    docker-compose.yml
    docker-compose.prod.yml
  .github/
    workflows/
      ci.yml
```

---

## 16. Orden de Construcción Recomendado

Para entregar en un mes sin deuda técnica, construir en este orden. Cada fase protege la integridad del dominio para las siguientes.

| Fase | Módulos | Justificación |
|---|---|---|
| 1 | Infraestructura base (Docker, DB, NestJS bootstrap, Vite bootstrap) | Base sobre la que todo lo demás se construye |
| 2 | Auth + Users + Roles | Sin esto nada puede estar protegido |
| 3 | Categories + Units + Suppliers | Dependencias del catálogo de productos |
| 4 | Products | Entidad central del dominio |
| 5 | StockLevel + StockMovements | Núcleo de integridad del inventario |
| 6 | Entries | Primera operación real de stock |
| 7 | Outputs | Segunda operación real de stock |
| 8 | Alerts | Valor operativo inmediato post-movimientos |
| 9 | Dashboard | Visibilidad ejecutiva del estado del sistema |
| 10 | Reports | Análisis histórico |
| 11 | Settings + Branding | Configurabilidad del producto |
| 12 | Feature Flags | Control de módulos opcionales |
| 13 | Audit | Trazabilidad de acciones sensibles |
| 14 | Tests + Coverage | Cierre de cobertura en módulos críticos |
| 15 | Polish + E2E + Deploy | Calidad final y despliegue |

---

## 17. Reglas No Negociables de Arquitectura

| Regla | Consecuencia de violarla |
|---|---|
| Nunca hardcodear branding o datos de cliente | Rompe la reusabilidad del producto |
| Nunca mutar stock sin crear un `StockMovement` | Destruye el audit trail del inventario |
| Nunca poner reglas de negocio solo en el frontend | El backend puede ser consumido directamente |
| Nunca hacer operaciones de stock fuera de transacción | Riesgo de inconsistencia en el stock |
| Nunca saltarse permisos en rutas sensibles | Vulnerabilidad de seguridad directa |
| Nunca tratar esto como un proyecto de un solo cliente | Invalida la razón de existir del producto |
| Nunca introducir límites de módulo sloppy | Crea acoplamiento que es imposible de deshacer |
| Nunca elegir velocidad sobre integridad de dominio | La deuda de dominio no se puede refactorizar fácilmente |

---

## 18. Estándar Final

El sistema resultante debe ser:

- **Limpio** — código legible, módulos con responsabilidad única
- **Modular** — cada módulo funciona de forma independiente
- **Domain-safe** — el inventario siempre es auditable y consistente
- **Configurable** — ningún cliente requiere cambios de código para personalizar el sistema
- **White-label ready** — el branding viene de la base de datos
- **Vendible** — puede instalarse en un segundo restaurante sin modificaciones de código
- **Senior-level** — mantenible bajo presión real de cliente
- **Testeado** — la lógica crítica tiene cobertura que previene regresiones

Cada implementación debe acercar el producto a convertirse en una plataforma confiable y reutilizable para la gestión de inventario de restaurantes.

---

*Última actualización: ver `engineering-notes/architecture-decisions.md` para historial de cambios arquitectónicos.*
