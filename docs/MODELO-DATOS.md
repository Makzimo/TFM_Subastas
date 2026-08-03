# Modelo de Datos — Plataforma de Remates

## Diagrama Entidad-Relación

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     User     │       │     Asset        │       │   BidderGuarantee│
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (UUID PK) │       │ id (UUID PK)     │       │ id (UUID PK)     │
│ email (uniq) │       │ description      │       │ userId (FK)      │
│ role (Enum)  │       │ basePrice        │       │ isPaid (Boolean) │
│ name         │       │ status (Enum)    │       │ paymentDate      │
│ createdAt    │       │ imageUrl         │       │ amount           │
│ updatedAt    │       │ createdAt        │       │ createdAt        │
└──────┬───────┘       │ updatedAt        │       └──────────────────┘
       │               │ martilleroId(FK) │
       │               └────────┬─────────┘
       │                        │
       │    ┌───────────────────┘
       │    │
       ▼    ▼
┌──────────────────┐       ┌──────────────────┐
│      Bid         │       │    AuditLog      │
├──────────────────┤       ├──────────────────┤
│ id (UUID PK)     │       │ id (UUID PK)     │
│ amount (Decimal) │       │ userId (FK)      │
│ createdAt        │       │ action (String)  │
│ userId (FK)      │       │ entityId         │
│ assetId (FK)     │       │ details (JSON)   │
│ isWinning (Bool) │       │ createdAt        │
└──────────────────┘       └──────────────────┘
```

---

## Enums

### Role
```
MARTILLERO    → Controla el remate, cierra lotes
POSTOR        → Realiza pujas
ADMINISTRATIVO → Gestión general del sistema
```

### AuctionStatus
```
PENDIENTE   → Lote creado, aún no activo
ACTIVO      → Remate abierto, aceptando pujas
ADJUDICADO  → Remate cerrado, ganador definido
DESIERTO    → Remate cerrado sin pujas
```

---

## Modelos

### User
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `email` | String (unique) | Correo electrónico |
| `name` | String | Nombre completo |
| `passwordHash` | String | Contraseña hasheada (bcrypt) |
| `role` | Role (enum) | Rol del usuario (default: POSTOR) |
| `createdAt` | DateTime | Fecha de creación |
| `updatedAt` | DateTime | Última actualización |

**Relaciones:**
- `User` → `Bid[]` (un usuario puede hacer muchas pujas)
- `User` → `BidderGuarantee[]` (un usuario puede tener muchas garantías)
- `User` → `Asset[]` (un MARTILLERO puede administrar muchos activos)

---

### Asset
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `description` | String | Descripción del vehículo/especie |
| `basePrice` | Decimal | Precio base del lote |
| `currentPrice` | Decimal | Precio actual (actualizado con cada puja) |
| `status` | AuctionStatus (enum) | Estado del remate |
| `imageUrl` | String? | URL de imagen (opcional) |
| `createdAt` | DateTime | Fecha de creación |
| `updatedAt` | DateTime | Última actualización |
| `martilleroId` | String (FK) | Martillero responsable |

**Relaciones:**
- `Asset` → `Bid[]` (un activo puede tener muchas pujas)
- `Asset` → `User` (martillero responsable)

---

### Bid
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `amount` | Decimal | Monto de la puja |
| `createdAt` | DateTime | Fecha/hora de la puja |
| `userId` | String (FK) | Postor que realizó la puja |
| `assetId` | String (FK) | Activo sobre el cual se puja |
| `isWinning` | Boolean | ¿Es la puja ganadora? (default: false) |

**Relaciones:**
- `Bid` → `User` (postor)
- `Bid` → `Asset` (activo)

**Reglas de negocio:**
- `amount` debe ser superior al `currentPrice` del `Asset`
- Incremento mínimo configurable
- Solo se permite pujar si `Asset.status === ACTIVO`
- Solo se permite pujar si el `User` tiene `BidderGuarantee.isPaid === true` **para ese lote** (`assetId`)

---

### BidderGuarantee (modelo 1:1 por lote — v0.12.0)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `userId` | String (FK) | Postor asociado |
| `assetId` | String? (FK) | Lote sobre el cual se presenta la garantía (nullable solo para garantías legacy) |
| `isPaid` | Boolean | ¿Garantía aprobada/pagada? (default: false) |
| `paymentDate` | DateTime? | Fecha de pago (null si no pagada) |
| `amount` | Decimal | Monto de la garantía |
| `createdAt` | DateTime | Fecha de creación |

**Relaciones:**
- `BidderGuarantee` → `User` (postor)
- `BidderGuarantee` → `Asset` (lote)

**Unicidad:** `@@unique([userId, assetId])` — un postor solo tiene una garantía por lote.

**Reglas de negocio:**
- Un postor no puede pujar en un lote sin garantía pagada **de ese lote** (validado dentro de la transacción en `auction-engine.ts`)
- `isPaid` se establece en `true` tras aprobación del ADMINISTRATIVO
- Las garantías legacy con `assetId: null` se conservan pero **no habilitan pujar**

---

### AuditLog (NUEVO - Fase 7)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `userId` | String (FK) | Usuario que realizó la acción |
| `action` | String | Tipo de acción (BID_PLACED, AUCTION_CLOSED, etc.) |
| `entityId` | String | ID de la entidad afectada |
| `details` | JSON? | Detalles adicionales de la acción |
| `createdAt` | DateTime | Fecha/hora de la acción |

**Valores de `action`:**
- `BID_PLACED` → Puja realizada
- `AUCTION_CLOSED` → Remate cerrado
- `AUCTION_OPENED` → Remate abierto
- `GUARANTEE_PAID` → Garantía pagada
- `USER_REGISTERED` → Usuario registrado
- `ASSET_CREATED` → Activo creado
- `ASSET_UPDATED` → Activo actualizado

---

## Schema Prisma (Versión Extendida)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  MARTILLERO
  POSTOR
  ADMINISTRATIVO
}

enum AuctionStatus {
  PENDIENTE
  ACTIVO
  ADJUDICADO
  DESIERTO
}

model User {
  id            String             @id @default(uuid())
  email         String             @unique
  name          String?
  passwordHash  String
  role          Role               @default(POSTOR)
  isActive      Boolean            @default(true) // v0.12.0: cuentas desactivadas no inician sesión ni pujan
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  bids          Bid[]
  guarantees    BidderGuarantee[]
  auditLogs     AuditLog[]
  assets        Asset[]            @relation("MartilleroAssets")
  approvedAssets Asset[]           @relation("AprobadorAssets")
}

model Asset {
  id            String        @id @default(uuid())
  description   String
  basePrice     Decimal
  currentPrice  Decimal
  status        AuctionStatus @default(PENDIENTE)
  imageUrl      String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  martilleroId  String
  martillero    User          @relation("MartilleroAssets", fields: [martilleroId], references: [id])
  bids          Bid[]
  guarantees    BidderGuarantee[] // garantías presentadas para este lote (v0.12.0)
}

model Bid {
  id        String   @id @default(uuid())
  amount    Decimal
  createdAt DateTime @default(now())
  isWinning Boolean  @default(false)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id])

  @@index([assetId, isWinning])
  @@index([userId, createdAt])
}

model BidderGuarantee {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  isPaid      Boolean   @default(false)
  paymentDate DateTime?
  amount      Decimal
  createdAt   DateTime  @default(now())

  @@index([userId, isPaid])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  entityId  String
  details   Json?
  createdAt DateTime @default(now())

  @@index([entityId, action])
  @@index([userId, createdAt])
}
```

---

## Índices Recomendados

| Modelo | Índice | Propósito |
|--------|--------|-----------|
| `Bid` | `[assetId, isWinning]` | Buscar puja ganadora de un activo rápido |
| `Bid` | `[userId, createdAt]` | Historial de pujas de un usuario |
| `BidderGuarantee` | `[userId, isPaid]` | Verificar si usuario tiene garantía |
| `AuditLog` | `[entityId, action]` | Buscar logs de una entidad |
| `AuditLog` | `[userId, createdAt]` | Historial de acciones de un usuario |

---

## Flujo de Datos: Puja

```
1. POSTOR puja $10.000.000 por Activo #1
   ↓
2. Verificar: Asset.status === ACTIVO ✓
3. Verificar: User tiene BidderGuarantee.isPaid === true ✓
4. Verificar: amount > Asset.currentPrice ✓
   ↓
5. TRANSACTION:
   - INSERT Bid (amount: 10.000.000, userId, assetId)
   - UPDATE Asset (currentPrice: 10.000.000)
   ↓
6. INSERT AuditLog (action: BID_PLACED)
   ↓
7. SSE emit: { assetId: 1, newPrice: 10.000.000, bidder: "..." }
```
