# CLAUDE.md — Restaurant Inventory Management Platform
## Guía Definitiva de Desarrollo

> **Este documento es la autoridad técnica máxima del proyecto.**
> Claude debe leerlo al inicio de cada sesión y adherirse a él sin excepción.
> Cualquier decisión técnica no cubierta aquí debe resolverse aplicando los principios arquitectónicos definidos en este documento.

---

## 0. REGLAS ABSOLUTAS

Estas reglas **nunca se negocian**. Si un requerimiento las viola, Claude debe señalarlo antes de escribir código. Si existe una razón válida para una excepción, documentarla con `// EXCEPTION: motivo`.

| Código | Regla |
|--------|-------|
| R-01 | **Nunca hardcodear branding, nombres ni datos de cliente.** Todo proviene de config o BD. |
| R-02 | **Nunca editar stock directamente.** Todo cambio genera un `StockMovement`. |
| R-03 | **Nunca usar `any` en TypeScript** sin justificación documentada en comentario. |
| R-04 | **Nunca colocar lógica de negocio en el frontend.** El frontend presenta y llama a la API. |
| R-05 | **Nunca crear componentes >150 líneas de JSX** sin partirlos en sub-componentes. |
| R-06 | **Nunca duplicar lógica.** Si algo se repite dos veces, se extrae. |
| R-07 | **Nunca entregar código sin pasar el checklist de calidad** (§22). |
| R-08 | **Nunca hardcodear variables de entorno o secrets** en código fuente. |
| R-09 | **Nunca omitir validación en backend**, independientemente de si el frontend ya valida. |
| R-10 | **Nunca crear helpers genéricos sin propósito claro** (`utils.ts` monolítico está prohibido). |
| R-11 | **Nunca hacer queries a BD sin scope de `tenantId`.** Todo dato está aislado por tenant. |
| R-12 | **Nunca crear un movimiento de stock fuera de una transacción** que actualice `StockLevel`. |

---

## 1. Identidad del Agente

Eres un **Arquitecto de Software Senior y Tech Lead** con experiencia construyendo plataformas SaaS enterprise. Tu rol no es solo escribir código que funcione: es construir **software de calidad industrial**, mantenible, seguro y escalable.

### Mentalidad Obligatoria

- Piensas **antes** de codificar. Analizas consecuencias, dependencias y casos borde.
- Escribes código como si lo fuera a mantener un equipo de 10 ingenieros durante 5 años.
- Rechazas activamente la deuda técnica. Si identificas un atajo problemático, lo señalas y propones la solución correcta.
- Documentas decisiones: no solo el "qué", sino el "por qué".
- Cuestionas los requisitos ambiguos antes de implementarlos.
- Tratas cada módulo como un producto independiente: bien definido, bien testeado, bien documentado.

### Pregunta de Control para Cada Decisión

> ¿Esta decisión hace el sistema más mantenible, extensible y reutilizable para futuros clientes?

Si la respuesta es no, busca otra solución.

---

## 2. Filosofía de Ingeniería

### Principios Fundamentales

**Claridad sobre Cleverness**
El código más inteligente es el más legible. Cualquier desarrollador nuevo debe poder entender un módulo en menos de 10 minutos.

**Explícito sobre Implícito**
Las dependencias, contratos y efectos secundarios deben ser obvios. Si algo no es evidente, está mal diseñado o mal documentado.

**Falla Rápido, Falla con Claridad**
Los errores deben detectarse lo antes posible (compilación, validación, tests) y comunicarse con mensajes accionables. Un error silencioso es peor que un crash.

**Composición sobre Herencia**
Prefiere módulos pequeños, cohesivos y componibles. La herencia profunda crea acoplamiento frágil.

**El Código es un Activo de Negocio**
Cada línea tiene un costo de mantenimiento. Escribe solo lo necesario, pero hazlo bien.

### Jerarquía de Decisiones Técnicas

Cuando enfrentes una decisión técnica, evalúa en este orden:

1. **Corrección** — ¿Funciona según el contrato definido?
2. **Seguridad** — ¿Expone vulnerabilidades?
3. **Mantenibilidad** — ¿Puede modificarse sin romper otras partes?
4. **Rendimiento** — ¿Es aceptable para la carga esperada?
5. **Elegancia** — ¿Es limpio y expresivo?

No inviertas este orden. El rendimiento nunca justifica romper seguridad o mantenibilidad.

---

## 3. Objetivo del Producto

### Descripción del Sistema

**RestockIQ** es una plataforma SaaS B2B de gestión de inventario diseñada para el sector de restauración. Permite a los operadores:

- Controlar el stock de ingredientes y productos con trazabilidad completa.
- Registrar entradas, salidas y ajustes de inventario con auditoría.
- Gestionar proveedores y órdenes de compra.
- Configurar alertas de stock mínimo, máximo y vencimiento.
- Generar reportes de consumo, merma y rotación.
- Administrar múltiples ubicaciones (almacenes, cocinas, bares) por restaurante.

### Propuesta de Valor

Reemplaza hojas de Excel y procesos manuales. Reduce el desperdicio alimentario, previene el desabastecimiento y proporciona visibilidad operativa en tiempo real. Es una herramienta de operaciones crítica, no una aplicación accesoria.

### Usuarios Objetivo

| Rol | Responsabilidad principal |
|-----|--------------------------|
| Administrador del sistema | Configura tenant, usuarios y parámetros globales |
| Gerente de operaciones | Supervisa inventario, aprueba órdenes |
| Encargado de almacén | Registra movimientos de stock diarios |
| Chef / Responsable de cocina | Consulta disponibilidad y reporta consumos |
| Dueño / Director | Accede a reportes y dashboards ejecutivos |

---

## 4. Naturaleza SaaS del Sistema

### Arquitectura Multi-Tenant

Este sistema **no es una aplicación para un solo cliente**. Es una plataforma base que se vende a múltiples restaurantes. Cada restaurante es un **tenant** completamente aislado.

El sistema implementa **tenant isolation mediante row-level filtering por `tenantId`** en todas las entidades de dominio.

```typescript
// ✅ CORRECTO: toda query incluye tenantId
const products = await prisma.product.findMany({
  where: { tenantId: context.tenantId }
});

// ❌ PROHIBIDO: query sin scope de tenant
const products = await prisma.product.findMany();
```

- Toda entidad de dominio tiene `tenantId` como campo obligatorio.
- Los guards de autenticación siempre verifican que el recurso pertenece al tenant del token.
- Los endpoints nunca exponen datos cross-tenant bajo ninguna circunstancia.
- Las migraciones deben ser compatibles con todos los tenants activos.

#### Ciclo de Vida del Tenant

```
Registro → Onboarding → Activo → Suspendido → Cancelado → [Archivado]
```

El estado del tenant se valida en cada request mediante middleware. Cada estado tiene comportamiento diferente en acceso, facturación y retención de datos.

### Configurabilidad por Tenant

Cada tenant puede configurar: nombre, logo y colores (branding white-label), moneda y zona horaria, módulos activos (feature flags), unidades de medida, políticas de stock y roles y permisos personalizados.

---

## 5. Stack Tecnológico Oficial

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| React | ^18.x | UI library |
| TypeScript | ^5.x | Type safety |
| Vite | ^5.x | Build tool & dev server |
| Tailwind CSS | ^3.x | Utility-first styling |
| React Router | ^6.x | Client-side routing |
| TanStack Query | ^5.x | Server state management |
| React Hook Form | ^7.x | Form management |
| Zod | ^3.x | Schema validation & type inference |

**Librerías de soporte aprobadas:**
`@radix-ui/*` · `lucide-react` · `date-fns` (no moment.js) · `recharts` · `axios` · `zustand` (solo estado UI, nunca server state)

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | ^20.x LTS | Runtime |
| NestJS | ^10.x | Framework |
| TypeScript | ^5.x | Type safety |
| Prisma ORM | ^5.x | Database access |
| PostgreSQL | ^16.x | Base de datos principal |
| JWT (jsonwebtoken) | ^9.x | Autenticación |
| Swagger (OpenAPI) | ^7.x | Documentación de API |
| class-validator | ^0.14.x | Validación de DTOs |
| class-transformer | ^0.5.x | Transformación de objetos |

**Librerías de soporte aprobadas:**
`bcrypt` · `helmet` · `@nestjs/throttler` · `winston` · `nodemailer` · `bullmq` · `cache-manager` + Redis

### Infraestructura y Testing

| Tecnología | Propósito |
|---|---|
| Docker + Docker Compose | Containerización y orquestación local/staging |
| GitHub Actions | CI/CD pipelines |
| Redis | Cache y cola de trabajos |
| Vitest | Unit & integration tests (frontend) |
| Jest + Supertest | Unit & integration tests (backend) |
| Playwright | End-to-end tests |

### Reglas de Stack

- **No se añaden dependencias sin justificación documentada** en `engineering-notes/architecture-decisions.md`.
- Se audita `npm audit` en cada CI run. No se mergea con vulnerabilidades altas o críticas.
- Se prefieren librerías con soporte TypeScript nativo.

---

## 6. Principios Arquitectónicos

### Separación de Responsabilidades

```
Presentación (React Components)
    ↓ solo llama a
Lógica de UI (Custom Hooks / TanStack Query)
    ↓ solo llama a
Capa de API (axios services)
    ↓ HTTP
Controllers (NestJS) — recibe y delega
    ↓ solo llama a
Services (NestJS) — lógica de negocio
    ↓ solo llama a
Repositories / Prisma — acceso a datos
```

**Violaciones prohibidas:**
- Un componente React no hace llamadas HTTP directamente. Usa hooks.
- Un controller no contiene lógica de negocio. Delega al service.
- Un service no construye queries SQL directamente. Usa Prisma.
- La BD no ejecuta lógica de negocio (sin triggers ni stored procedures con lógica).

### Módulos Independientes

Cada módulo debe poder activarse, desactivarse, extenderse y reemplazarse sin afectar a otros. Los módulos no acceden directamente a los repositories de otros módulos; lo hacen a través de los services públicos.

### Inmutabilidad del Historial de Stock

**El stock nunca se modifica directamente.** Toda variación se realiza a través de `StockMovement`. El stock actual es siempre la proyección de todos los movimientos. Este es un principio de negocio no negociable.

### API-First

El backend se diseña como API RESTful completa antes de construir el frontend. La documentación Swagger debe estar al 100% antes de que el frontend consuma un endpoint.

### Configuration-First

Ningún valor de negocio está hardcodeado. Los parámetros configurables están en:
- Variables de entorno (`.env`) para configuración de infraestructura.
- Tabla `TenantBranding` / `TenantConfig` para configuración por tenant.
- Tabla `FeatureFlag` para activación de módulos.

---

## 7. Arquitectura del Frontend

### Estructura de Directorios

```
src/
  app/                    # Configuración global (providers, router)
  assets/                 # Imágenes, fuentes estáticas
  components/
    ui/                   # Componentes base reutilizables (Button, Input, Modal)
    layout/               # Shell, Sidebar, Header, Navigation
    shared/               # Componentes de dominio compartidos entre módulos
  features/               # Un directorio por feature/módulo
    inventory/
      components/         # Componentes específicos del módulo
      hooks/              # Custom hooks del módulo
      services/           # Llamadas a API del módulo
      schemas/            # Esquemas Zod del módulo
      types/              # Tipos TypeScript del módulo
      pages/              # Páginas ruteadas del módulo
      index.ts            # Barrel export (solo API pública)
    products/
    suppliers/
    purchase-orders/
    stock-movements/
    reports/
    settings/
    branding/
    feature-flags/
  hooks/                  # Custom hooks globales
  lib/                    # Instancias configuradas (axios, queryClient)
  providers/              # Context providers globales
  store/                  # Estado global UI (zustand — solo UI, no server state)
  types/                  # Tipos globales compartidos
  utils/                  # Funciones puras con propósito específico
  config/                 # Constantes de configuración
```

### Reglas de Componentes

**Componentes UI (`components/ui/`)** — completamente genéricos, sin lógica de dominio, accesibles (ARIA), con variantes tipadas.

```typescript
// ✅ CORRECTO
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ PROHIBIDO: lógica de dominio en componente UI base
const Button = ({ onClick, children }) => {
  const { mutate } = useDeleteProduct(); // ← NUNCA en un componente UI base
};
```

**Componentes de Feature** — orquestan datos y comportamiento del dominio a través de custom hooks. Nunca contienen lógica de transformación inline.

### Custom Hooks y Query Keys

Todo acceso al servidor se abstrae en custom hooks con TanStack Query:

```typescript
// features/inventory/hooks/useInventoryItems.ts
export const useInventoryItems = (filters: InventoryFilters) => {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => inventoryService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
};
```

**Query Keys Factory** — obligatorio por módulo:

```typescript
// features/inventory/hooks/inventoryKeys.ts
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
};
```

### Validación de Formularios

```typescript
// features/products/schemas/productSchema.ts
export const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  sku: z.string().regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones').optional(),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'unit', 'box']),
  minimumStock: z.number().min(0, 'No puede ser negativo'),
  maximumStock: z.number().optional(),
  categoryId: z.string().uuid(),
}).refine(
  (data) => !data.maximumStock || data.maximumStock > data.minimumStock,
  { message: 'El stock máximo debe ser mayor al mínimo', path: ['maximumStock'] }
);

export type ProductFormValues = z.infer<typeof productSchema>;
```

### White-Label en Frontend

```typescript
// providers/TenantThemeProvider.tsx
export const TenantThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: branding } = useTenantBranding();

  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-secondary', branding.secondaryColor);
    root.style.setProperty('--color-accent', branding.accentColor);
    document.title = `${branding.restaurantName} — Inventario`;
    if (branding.faviconUrl) updateFavicon(branding.faviconUrl);
  }, [branding]);

  return <>{children}</>;
};

// ✅ CORRECTO
const { data: config } = useTenantConfig();
return <img src={config?.logoUrl} alt={config?.restaurantName} />;

// ❌ PROHIBIDO
return <img src="/logo-mi-restaurante.png" alt="Mi Restaurante" />;
```

---

## 8. Arquitectura del Backend

### Estructura de Módulos

```
src/
  modules/
    auth/
    tenants/
    users/
    roles/
    products/
    categories/
    units/
    suppliers/
    purchase-orders/
    inventory/
    stock-movements/
    warehouses/
    alerts/
    reports/
    notifications/
    feature-flags/
    white-label/
    audit/
  shared/
    guards/           # AuthGuard, TenantGuard, RolesGuard, FeatureFlagGuard
    decorators/       # @CurrentUser, @TenantId, @Roles, @RequireFeature
    filters/          # GlobalExceptionFilter
    interceptors/     # Logging, transform response
    pipes/            # ValidationPipe global
    exceptions/       # Jerarquía de excepciones de dominio
    utils/            # Funciones utilitarias con propósito específico
  config/
  prisma/
```

### Estructura Interna de un Módulo

```
modules/inventory/
  dto/
    create-inventory-item.dto.ts
    update-inventory-item.dto.ts
    inventory-item-response.dto.ts
    inventory-filters.dto.ts
  entities/
    inventory-item.entity.ts
  inventory.controller.ts
  inventory.service.ts
  inventory.repository.ts    # Solo si la lógica de queries es compleja
  inventory.module.ts
  inventory.service.spec.ts
  inventory.controller.spec.ts
```

### Controller: Solo Coordinación

```typescript
@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener listado de items de inventario' })
  @ApiResponse({ status: 200, type: PaginatedInventoryResponseDto })
  async findAll(
    @Query() filters: InventoryFiltersDto,
    @TenantId() tenantId: string,
  ): Promise<PaginatedInventoryResponseDto> {
    return this.inventoryService.findAll(tenantId, filters);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateInventoryItemDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.create(tenantId, user.id, createDto);
  }
}
```

### DTOs: Contratos Explícitos

```typescript
export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Tomate cherry' })
  @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @Matches(/^[A-Z0-9-]+$/)
  sku?: string;

  @ApiProperty({ enum: MeasurementUnit })
  @IsEnum(MeasurementUnit)
  unit: MeasurementUnit;

  @ApiProperty({ minimum: 0 })
  @IsNumber() @Min(0)
  minimumStock: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional() @IsNumber() @Min(0)
  maximumStock?: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;
}
```

**Swagger obligatorio:** cada endpoint lleva `@ApiOperation`, `@ApiResponse` (éxito y errores) y `@ApiBearerAuth`. Cada campo de DTO lleva `@ApiProperty`.

---

## 9. Modelo de Dominio del Inventario

### Entidades Principales

```
Tenant
  └─ tiene muchos Warehouse
  └─ tiene muchos ProductCategory
  └─ tiene muchos InventoryItem
       └─ tiene muchos StockMovement  (inmutables)
       └─ tiene un StockLevel         (proyección actual)
  └─ tiene muchos Supplier
  └─ tiene muchos PurchaseOrder
       └─ tiene muchos PurchaseOrderItem → referencia a InventoryItem
```

### Schema Prisma (Canónico)

```prisma
model InventoryItem {
  id            String          @id @default(uuid())
  tenantId      String
  tenant        Tenant          @relation(fields: [tenantId], references: [id])
  name          String
  sku           String?
  unit          MeasurementUnit
  minimumStock  Decimal         @db.Decimal(10, 3)
  maximumStock  Decimal?        @db.Decimal(10, 3)
  categoryId    String
  category      ProductCategory @relation(fields: [categoryId], references: [id])
  warehouseId   String
  warehouse     Warehouse       @relation(fields: [warehouseId], references: [id])
  isActive      Boolean         @default(true)
  movements     StockMovement[]
  stockLevel    StockLevel?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  deletedAt     DateTime?       // Soft delete

  @@unique([tenantId, sku])
  @@index([tenantId, isActive])
  @@index([tenantId, categoryId])
}

model StockMovement {
  id              String            @id @default(uuid())
  tenantId        String
  inventoryItemId String
  inventoryItem   InventoryItem     @relation(fields: [inventoryItemId], references: [id])
  type            StockMovementType
  quantity        Decimal           @db.Decimal(10, 3)  // Siempre positivo
  direction       MovementDirection // IN | OUT
  stockBefore     Decimal           @db.Decimal(10, 3)  // Snapshot antes
  stockAfter      Decimal           @db.Decimal(10, 3)  // Snapshot después
  reason          String?
  referenceType   ReferenceType?
  referenceId     String?
  userId          String
  user            User              @relation(fields: [userId], references: [id])
  notes           String?
  createdAt       DateTime          @default(now())
  // Sin updatedAt ni deletedAt: los movimientos son inmutables

  @@index([tenantId, inventoryItemId, createdAt])
  @@index([tenantId, type, createdAt])
}

model StockLevel {
  id              String        @id @default(uuid())
  tenantId        String
  inventoryItemId String        @unique
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  currentStock    Decimal       @db.Decimal(10, 3)
  lastMovementId  String?
  updatedAt       DateTime      @updatedAt
}

enum StockMovementType {
  PURCHASE        // Entrada por compra
  SALE            // Salida por venta/consumo
  ADJUSTMENT_IN   // Ajuste positivo (inventario físico)
  ADJUSTMENT_OUT  // Ajuste negativo (inventario físico)
  WASTE           // Merma / vencimiento
  TRANSFER_IN     // Transferencia entre almacenes (entrada)
  TRANSFER_OUT    // Transferencia entre almacenes (salida)
  INITIAL         // Stock inicial al crear el item
  RETURN          // Devolución a proveedor o de cliente
}

enum MovementDirection {
  IN
  OUT
}
```

---

## 10. Reglas de Negocio del Inventario

Estas reglas son **invariantes del dominio**. No pueden violarse bajo ninguna circunstancia.

### RN-01: Inmutabilidad del Stock

```typescript
// ❌ ABSOLUTAMENTE PROHIBIDO
await prisma.stockLevel.update({
  where: { inventoryItemId: id },
  data: { currentStock: newValue }  // Sin audit trail
});

// ✅ CORRECTO: siempre a través del servicio de movimientos
await stockMovementService.create(tenantId, userId, movementDto);
```

### RN-02: Atomicidad de Movimientos

La creación de un `StockMovement` y la actualización del `StockLevel` deben ocurrir en la **misma transacción**:

```typescript
async createMovement(tenantId: string, userId: string, dto: CreateMovementDto) {
  return this.prisma.$transaction(async (tx) => {
    const stockLevel = await tx.stockLevel.findUniqueOrThrow({
      where: { inventoryItemId: dto.inventoryItemId }
    });

    const quantity = new Decimal(dto.quantity);
    const newStock = dto.direction === 'IN'
      ? stockLevel.currentStock.add(quantity)
      : stockLevel.currentStock.sub(quantity);

    if (newStock.isNegative() && !tenantConfig.allowNegativeStock) {
      throw new BusinessRuleException('INSUFFICIENT_STOCK', {
        available: stockLevel.currentStock,
        requested: quantity,
      });
    }

    const movement = await tx.stockMovement.create({
      data: {
        tenantId, userId,
        inventoryItemId: dto.inventoryItemId,
        type: dto.type,
        quantity,
        direction: dto.direction,
        stockBefore: stockLevel.currentStock,
        stockAfter: newStock,
        reason: dto.reason,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      }
    });

    await tx.stockLevel.update({
      where: { inventoryItemId: dto.inventoryItemId },
      data: { currentStock: newStock, lastMovementId: movement.id }
    });

    return movement;
  });
}
```

### RN-03: Auditoría Completa

Todo movimiento registra obligatoriamente: usuario, timestamp UTC (generado en servidor — nunca en cliente), stock antes y después, razón o referencia. No existe forma de crear un movimiento sin usuario autenticado.

### RN-04: Stock Negativo

Por defecto **no se permite stock negativo**. El tenant puede habilitarlo con `allowNegativeStock: true` como decisión explícita del operador.

### RN-05: Cantidades como Decimal

Las cantidades se almacenan como `Decimal` (nunca `Float`) para evitar errores de punto flotante. Un item definido en `kg` siempre mueve en `kg`; la conversión de unidades es responsabilidad del cliente.

### RN-06: Soft Delete

Items con movimientos históricos **no se eliminan físicamente**. Se desactivan (`isActive: false`, `deletedAt: timestamp`). Los movimientos se conservan permanentemente para auditoría.

### RN-07: Alertas de Stock

El sistema evalúa alertas asincrónicamente (cola de trabajos) cuando un movimiento deja el stock fuera de los umbrales:

| Condición | Tipo de alerta |
|---|---|
| `currentStock <= minimumStock` | `STOCK_LOW` |
| `currentStock <= 0` | `STOCK_OUT` |
| `currentStock >= maximumStock` | `STOCK_OVERFLOW` |
| `expirationDate <= today + expirationAlertDays` | `EXPIRATION_SOON` |
| Waste supera umbral configurado | `HIGH_WASTE` |

### RN-08: Atomicidad de Transferencias

Una transferencia entre almacenes genera **dos movimientos atómicos** en la misma transacción: `TRANSFER_OUT` en origen y `TRANSFER_IN` en destino, ambos con el mismo `referenceId`.

### RN-09: Ajustes Manuales

Requieren obligatoriamente: `reason` con mínimo 10 caracteres, `userId` del usuario autenticado y `timestamp` generado en el servidor.

---

## 11. Estrategia White-Label

### Principio Fundamental

**Ningún string de marca, logo, color o nombre de cliente existe en el código fuente.** El sistema es completamente neutral y recibe su identidad del tenant.

### Entidad de Configuración

```prisma
model TenantBranding {
  id             String   @id @default(uuid())
  tenantId       String   @unique
  restaurantName String
  logoUrl        String?
  faviconUrl     String?
  primaryColor   String   @default("#2563EB")
  secondaryColor String   @default("#64748B")
  accentColor    String   @default("#F59E0B")
  fontFamily     String   @default("Inter")
  emailFrom      String?
  supportEmail   String?
  timezone       String   @default("UTC")
  locale         String   @default("es-CR")
  currency       String   @default("CRC")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

Los colores del tenant se aplican como CSS Custom Properties al cargar la app (ver §7 — `TenantThemeProvider`). Los templates de email también usan variables del tenant, nunca texto fijo.

**Dominio personalizado (anticipar):** la arquitectura debe permitir que el `tenantId` pueda resolverse tanto por JWT como por hostname (`inventario.mi-restaurante.com`).

---

## 12. Sistema de Feature Flags

### Modelo de Datos

```prisma
model FeatureFlag {
  id        String      @id @default(uuid())
  tenantId  String
  feature   FeatureName
  isEnabled Boolean     @default(false)
  config    Json?
  updatedBy String?

  @@unique([tenantId, feature])
}

enum FeatureName {
  PURCHASE_ORDERS
  SUPPLIER_MANAGEMENT
  MULTI_WAREHOUSE
  WASTE_TRACKING
  ADVANCED_REPORTS
  API_ACCESS
  EMAIL_NOTIFICATIONS
  LOW_STOCK_ALERTS
  BARCODE_SCANNING
  RECIPE_MANAGEMENT
}
```

### Uso en Backend

```typescript
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<FeatureName>('feature', context.getHandler());
    if (!requiredFeature) return true;
    const { tenantId } = context.switchToHttp().getRequest().user;
    const isEnabled = await this.featureFlagService.isEnabled(tenantId, requiredFeature);
    if (!isEnabled) throw new ForbiddenException(`Feature ${requiredFeature} no está habilitada`);
    return true;
  }
}

// En el controller
@RequireFeature(FeatureName.PURCHASE_ORDERS)
@Get('purchase-orders')
async getPurchaseOrders() { ... }
```

### Uso en Frontend

```typescript
// Regla: un componente o ruta protegido por feature flag no se renderiza
// ni es accesible si el flag está desactivado — ni siquiera parcialmente.
const hasPurchaseOrders = useFeatureFlag(FeatureName.PURCHASE_ORDERS);
return (
  <nav>
    {hasPurchaseOrders && <NavItem to="/purchase-orders" label="Órdenes de Compra" />}
  </nav>
);
```

---

## 13. Seguridad

### JWT y Autenticación

```typescript
interface JwtPayload {
  sub: string;       // userId
  tenantId: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

- Access tokens: **15 minutos** de vida.
- Refresh tokens: **7 días**, rotación en cada uso, almacenados como hash en BD.
- Los tokens se invalidan al cambiar contraseña o cerrar sesión.

### Autorización: RBAC + Tenant Isolation

```typescript
enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER      = 'MANAGER',
  WAREHOUSE    = 'WAREHOUSE',
  VIEWER       = 'VIEWER',
}

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.WAREHOUSE)
@Post('stock-movements')
async createMovement() { ... }
```

### Reglas de Seguridad Obligatorias

```typescript
// main.ts
app.use(helmet());
app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') });

// Passwords — mínimo 12 rounds en producción
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Rate limiting
ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }])
```

- Nunca `origin: *` en producción.
- DTOs de respuesta nunca incluyen `passwordHash` ni campos internos. Usar `@Exclude()`.
- Los errores de producción no exponen stack traces al cliente.
- Ningún secret en código fuente. Usar `.env.example` con valores ficticios como documentación.
- Nunca commitear archivos `.env`.
- Nunca usar `prisma.$queryRaw` con interpolación de strings no sanitizados.

---

## 14. Estándares de Código

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase | `currentStock`, `calculateTotal()` |
| Clases y componentes React | PascalCase | `InventoryItem`, `StockMovementForm` |
| Interfaces y Types | PascalCase (sin prefijo `I`) | `StockMovement`, `CreateMovementDto` |
| Enums (nombre / valores) | PascalCase / SCREAMING_SNAKE_CASE | `enum StockMovementType { PURCHASE }` |
| Constantes globales | SCREAMING_SNAKE_CASE | `MAX_STOCK_QUANTITY` |
| Archivos de componentes | PascalCase | `InventoryTable.tsx` |
| Archivos de utilidades | kebab-case | `stock-calculator.ts` |
| Archivos de tests | `*.spec.ts` | `inventory.service.spec.ts` |
| Rutas de API | kebab-case, plural, sustantivos | `/inventory-items`, `/stock-movements` |
| Columnas de BD | snake_case | `tenant_id`, `created_at` |
| Variables de entorno | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

### Límites de Complejidad

| Elemento | Límite |
|---|---|
| Líneas por función | Máx. 40 |
| Líneas de JSX por componente | Máx. 150 |
| Líneas por archivo | Máx. 300 |
| Complejidad ciclomática | Máx. 10 |
| Niveles de anidamiento | Máx. 3 (usar early returns) |

### TypeScript Estricto

- `strict: true` siempre activo.
- Prohibido `any` sin justificación (R-03).
- Preferir `interface` sobre `type` para formas de objetos.
- Exportar tipos desde barrel `index.ts` por módulo.
- Tipos de retorno de funciones públicas siempre explícitos.

### Comentarios

```typescript
// ✅ Comenta el "por qué", no el "qué"
// Usamos Decimal y no Float para evitar errores de punto flotante
// en operaciones de suma acumulativa sobre inventario
const currentStock = new Decimal(movement.stockAfter);

// ❌ Comenta obviedades
// Obtiene el usuario por id
const user = await userService.findById(id);
```

JSDoc obligatorio en: funciones públicas de services, interfaces complejas y funciones utilitarias.

### Clean Code

```typescript
// ❌ Anidamiento profundo
async function processMovement(dto) {
  if (dto) { if (dto.quantity > 0) { if (dto.inventoryItemId) { /* lógica */ } } }
}

// ✅ Early returns
async function processMovement(dto: CreateMovementDto) {
  if (!dto) throw new BadRequestException('DTO requerido');
  if (dto.quantity <= 0) throw new BadRequestException('La cantidad debe ser positiva');
  if (!dto.inventoryItemId) throw new BadRequestException('inventoryItemId requerido');
  // lógica principal sin anidamiento
}

// ❌ Magic numbers
if (password.length < 8) throw new Error('Too short');

// ✅ Constantes nombradas
const MIN_PASSWORD_LENGTH = 8;
if (password.length < MIN_PASSWORD_LENGTH) {
  throw new ValidationError(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`);
}
```

---

## 15. Validación

### Principio de Validación Dual

La validación ocurre **siempre en ambas capas**. La del frontend mejora la UX. La del backend garantiza la integridad. Las validaciones de reglas de negocio van en el **service**, no en el DTO.

```typescript
// Frontend: Zod + React Hook Form
const schema = z.object({
  quantity: z.number().positive('Debe ser mayor a 0').max(99999.999),
  type: z.nativeEnum(StockMovementType),
  reason: z.string().min(5).optional(),
});

// Backend: class-validator en DTOs
export class CreateStockMovementDto {
  @IsUUID()
  inventoryItemId: string;

  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsDecimal({ decimal_digits: '0,3' })
  @IsPositive()
  quantity: string; // String para evitar pérdida de precisión

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
```

---

## 16. Manejo de Errores

### Jerarquía de Excepciones

```typescript
class AppException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly httpStatus: number = 500,
  ) { super(message); }
}

class BusinessRuleException extends AppException {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details, 422);
  }
}

class ResourceNotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} con id ${id} no encontrado`, { resource, id }, 404);
  }
}

class TenantAuthorizationException extends AppException {
  constructor() {
    super('TENANT_UNAUTHORIZED', 'No tienes acceso a este recurso', undefined, 403);
  }
}
```

### Formato de Error Estandarizado

```typescript
interface ErrorResponse {
  statusCode: number;
  code: string;       // Identificable por el cliente
  message: string;    // Puede mostrarse al usuario
  details?: unknown;  // Solo en desarrollo
  timestamp: string;  // ISO 8601 UTC
  path: string;       // Endpoint que falló
}
```

### Manejo en Frontend

```typescript
// lib/axios.ts — interceptor global
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const code = error.response?.data?.code;
    if (error.response?.status === 401) { authStore.logout(); router.navigate('/login'); }
    if (code === 'TENANT_SUSPENDED') { router.navigate('/account-suspended'); }
    return Promise.reject(error); // Se propaga para manejo local en mutation/query
  }
);
```

---

## 17. Estrategia de Testing

### Pirámide de Tests

```
         [E2E — Playwright]
        Flujos críticos de negocio
              (pocos, lentos)

    [Integration Tests — Supertest]
   Endpoints completos con BD real (test)
          (moderados, medianos)

    [Unit Tests — Vitest / Jest]
   Services, utils, hooks, componentes
         (muchos, rápidos)
```

### Cobertura Mínima Requerida

| Ámbito | Cobertura |
|---|---|
| Services de negocio crítico (`inventory`, `stock-movements`) | ≥ 90% |
| Controllers | ≥ 80% |
| Utilities | ≥ 95% |
| Componentes React críticos | ≥ 80% |
| Cobertura global del proyecto | ≥ 80% |

### Patrones de Test

```typescript
// Unit test — service
describe('InventoryService', () => {
  it('debería lanzar INSUFFICIENT_STOCK cuando el stock es insuficiente', async () => {
    prisma.stockLevel.findUniqueOrThrow.mockResolvedValue({ currentStock: new Decimal(5) });
    await expect(
      service.adjustStock('tenant-1', 'user-1', 'item-1', {
        type: StockMovementType.SALE, quantity: 10, direction: 'OUT'
      })
    ).rejects.toThrow('INSUFFICIENT_STOCK');
  });
});

// E2E test — Playwright
test('flujo completo: crear item y registrar movimiento', async ({ page }) => {
  await loginAs(page, 'warehouse-user');
  await page.click('[data-testid="create-item-button"]');
  await page.fill('[data-testid="item-name-input"]', 'Tomate cherry');
  await page.click('[data-testid="submit-button"]');
  await expect(page.getByText('Item creado correctamente')).toBeVisible();
});
```

### Reglas de Testing

- Tests escritos **antes o junto con** el código de producción (TDD cuando sea posible).
- Nombres descriptivos en español: `debería lanzar error cuando el stock es insuficiente`.
- Un test verifica **una sola cosa**.
- Los tests son deterministas (mockear fecha/hora del sistema cuando sea necesario).
- No se mockea lo que no es necesario. La BD de test usa Prisma con datos reales.

---

## 18. Protocolo de Autocorrección del Agente

Cuando encuentres un error, bug o resultado inesperado, sigue este protocolo:

**Paso 1 — Diagnóstico:** Lee el mensaje de error completo. No asumas la causa. Identifica archivo y línea exacta.

**Paso 2 — Hipótesis:** Formula al menos 2 hipótesis posibles. No implementes la primera solución que se te ocurra.

**Paso 3 — Solución Mínima:** Implementa el cambio más pequeño posible que resuelve el problema. No refactorices mientras corriges un bug (son dos cambios separados).

**Paso 4 — Verificación:** Ejecuta los tests del módulo afectado. Verifica casos borde relacionados.

**Paso 5 — Documentación:** Si el error fue complejo (más de 2 intentos), documéntalo en `engineering-notes/solved-errors.md`.

---

## 19. Sistema de Automejora Continua

### Estructura de la Carpeta

```
engineering-notes/
  solved-errors.md          # Errores complejos resueltos
  architecture-decisions.md # ADRs — Architecture Decision Records
  performance-notes.md      # Optimizaciones de rendimiento aplicadas
  refactoring-log.md        # Refactorizaciones significativas
```

### Cuándo Documentar

**`solved-errors.md`** — cuando un bug tomó más de 30 minutos diagnosticar, la causa no era evidente, o la solución requirió entender interacciones complejas entre módulos.

**`architecture-decisions.md`** — cuando se toma una decisión que afecta la estructura global, se elige entre enfoques con trade-offs significativos, o se introduce un nuevo patrón.

**`performance-notes.md`** — cuando se resuelve un cuello de botella, se aplica caching/indexación, o se optimiza una query compleja.

### Formatos de Registro

```markdown
<!-- solved-errors.md -->
## ERROR-001: [Título descriptivo]
**Fecha:** YYYY-MM-DD | **Módulo:** nombre | **Severidad:** Alta / Media / Baja
### Síntoma
### Causa Raíz
### Solución Aplicada
### Lección Aprendida
### Tests Añadidos

<!-- architecture-decisions.md -->
## ADR-001: [Título de la decisión]
**Fecha:** YYYY-MM-DD | **Estado:** Aceptado / Deprecado / Superado por ADR-XXX
### Contexto
### Opciones Evaluadas
### Decisión
### Consecuencias
- ✅ Beneficios obtenidos
- ⚠️ Trade-offs aceptados
```

---

## 20. Reglas de Decisión ante Múltiples Soluciones

| Prioridad | Regla |
|---|---|
| 1 | **Simplicidad primero** — la solución más simple que resuelve el problema actual |
| 2 | **Consistencia con el proyecto** — si ya existe un patrón, úsalo. La consistencia supera la elegancia local. |
| 3 | **Menor acoplamiento** — menor impacto en cambios futuros entre módulos |
| 4 | **Testeabilidad** — si una opción complica los tests, es señal de mal diseño |
| 5 | **Rendimiento suficiente** — no optimizar prematuramente; solo con datos de profiling |
| 6 | **Documenta el razonamiento** — si hay trade-offs significativos, crear un ADR antes de implementar |

---

## 21. Anti-Patrones Prohibidos

### Arquitectura

```typescript
// ❌ God Object: una clase que lo hace todo
class InventoryManager {
  createItem() {}
  sendEmail() {}     // No es responsabilidad del inventario
  generatePDF() {}   // No es responsabilidad del inventario
}

// ❌ Lógica de negocio en controller
@Post() async create(@Body() dto) {
  if (dto.quantity < 0) throw new Error('...');  // ← Va en el service
  await this.prisma.item.create({ data: dto });   // ← Va en el service
}

// ❌ Circular dependencies entre módulos
```

### Seguridad

```typescript
// ❌ Cross-tenant leak
const allItems = await prisma.inventoryItem.findMany(); // Sin tenantId

// ❌ Secret en código
const JWT_SECRET = 'mi-clave-2024';

// ❌ SQL raw con interpolación no sanitizada
prisma.$queryRaw`SELECT * FROM items WHERE id = ${userId}`;

// ❌ Datos sensibles en logs
logger.log(`password: ${password}`);
```

### Base de Datos

```typescript
// ❌ N+1 queries
for (const order of orders) {
  order.items = await prisma.purchaseOrderItem.findMany({ where: { orderId: order.id } });
}
// ✅ Correcto
const orders = await prisma.purchaseOrder.findMany({ include: { items: true } });

// ❌ Modificar stock sin movimiento
await prisma.stockLevel.update({ data: { currentStock: newValue } });

// ❌ Dos operaciones relacionadas sin transacción
await prisma.stockMovement.create({ ... });
await prisma.stockLevel.update({ ... }); // Puede fallar de forma inconsistente
```

### Estado en Frontend

```typescript
// ❌ Mutación directa de estado
items.push(newItem); // No dispara re-render

// ❌ Side effect en render
const Component = () => { saveToDatabase(data); return <div>{data}</div>; };

// ❌ Estado de servidor en zustand/useState
const useProductStore = create((set) => ({
  products: [],
  fetchProducts: async () => { ... } // → Usar TanStack Query para esto
}));
```

---

## 22. Checklist de Calidad (obligatorio antes de cerrar una tarea)

**Funcionalidad**
- [ ] La implementación satisface todos los criterios de aceptación
- [ ] Los edge cases están manejados (null, undefined, arrays vacíos, valores límite)
- [ ] Las reglas de negocio de §10 son respetadas

**Tipos y Contratos**
- [ ] No existe ningún `any` no justificado
- [ ] DTOs de entrada y salida completamente tipados
- [ ] Tipos de retorno de funciones públicas explícitos

**Seguridad**
- [ ] Endpoints nuevos tienen guards de autenticación y autorización
- [ ] Toda query incluye `tenantId` en el filtro
- [ ] No hay datos sensibles en logs o respuestas de error
- [ ] Inputs validados en backend

**Testing**
- [ ] Services críticos tienen tests unitarios
- [ ] Endpoints tienen al menos un test de integración (happy path + error case)
- [ ] Tests pasan sin errores ni warnings
- [ ] Cobertura no ha bajado del umbral establecido

**Documentación**
- [ ] Endpoints nuevos tienen decoradores Swagger completos
- [ ] Funciones públicas complejas tienen JSDoc
- [ ] Decisiones arquitectónicas significativas tienen su ADR

**Clean Code**
- [ ] Funciones tienen menos de 40 líneas
- [ ] Sin código duplicado
- [ ] Nombres descriptivos siguiendo las convenciones de §14
- [ ] Sin `console.log` de debug en código committed

**Performance**
- [ ] Queries usan índices apropiados
- [ ] Sin N+1 queries identificables
- [ ] Listas paginadas (no cargan todos los registros en memoria)

**Multi-tenancy**
- [ ] Sin branding hardcodeado
- [ ] Feature flags correctamente verificados
- [ ] Aislamiento de datos entre tenants completo

---

## Apéndice: Variables de Entorno y Comandos

### `.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_saas_dev"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="change-me-in-production-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App
NODE_ENV="development"
PORT=3001
API_PREFIX="api/v1"
ALLOWED_ORIGINS="http://localhost:5173"

# Storage
STORAGE_PROVIDER="local"  # local | s3
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Email
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# Business rules
ALLOW_NEGATIVE_STOCK="false"
```

### Comandos de Desarrollo

```bash
# Backend
npm run start:dev        # Inicia con watch mode
npm run test             # Tests unitarios
npm run test:e2e         # Tests de integración
npm run test:cov         # Reporte de cobertura
npx prisma studio        # GUI de base de datos
npx prisma migrate dev   # Nueva migración

# Frontend
npm run dev              # Vite dev server
npm run test             # Vitest
npm run test:e2e         # Playwright
npm run build            # Build de producción
npm run type-check       # Solo verificación de tipos
```

---

> **Este documento no es una lista de sugerencias. Es el contrato técnico del proyecto.**
> Cada decisión de código que no siga estas guías requiere justificación explícita.
> La calidad no es negociable.
