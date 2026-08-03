# Arquitectura del Sistema — Plataforma de Remates

## Visión General

Arquitectura basada en Next.js App Router con Server Components por defecto, Server Actions para mutaciones, y Server-Sent Events para tiempo real. Separación clara entre lógica de negocio (`lib/`) y presentación (`components/`, `app/`).

---

## Capas de la Arquitectura

```
┌─────────────────────────────────────────┐
│              PRESENTACIÓN               │
│   app/ (rutas, layouts, pages)          │
│   components/ (UI, controles, widgets)  │
├─────────────────────────────────────────┤
│            ACCIONES DEL SERVIDOR        │
│   app/actions/ (Server Actions)         │
│   hooks/ (useSSE, useAuction)           │
├─────────────────────────────────────────┤
│            LÓGICA DE NEGOCIO            │
│   lib/auction-engine.ts (core)          │
│   lib/auth.ts, lib/audit.ts, lib/...    │
├─────────────────────────────────────────┤
│            DATOS Y PERSISTENCIA         │
│   prisma/ (schema, migrations, seed)    │
│   lib/prisma.ts (singleton)             │
├─────────────────────────────────────────┤
│            TIEMPO REAL                  │
│   app/api/sse/ (endpoints SSE)          │
│   lib/sse-server.ts (emisor central)    │
└─────────────────────────────────────────┘
```

---

## Principios Arquitectónicos

### 1. Server Components por Defecto
- Carga inicial de datos en Server Components (sin `useEffect`)
- Client Components (`'use client'`) solo para interactividad: pujas, timers, formularios
- Datos se pasan como props de Server a Client Components

### 2. Server Actions para Mutaciones
- Toda escritura (pujas, crear activo, verificar garantía) pasa por Server Actions
- Validación server-side obligatoria en cada acción
- Transacciones Prisma para operaciones atómicas

### 3. Separación de Responsabilidades
- **`lib/auction-engine.ts`**: Toda la lógica de validación de remates
- **`lib/auth.ts`**: Autenticación y autorización
- **`lib/audit.ts`**: Logging de acciones críticas
- **`lib/errors.ts`**: Manejo centralizado de errores
- **`components/`**: UI pura, sin lógica de negocio
- **`types/`**: Interfaces estrictas del modelo de negocio

### 4. Datos Dinámicos
- Sala de subastas: `next: { revalidate: 0 }` (siempre fresco)
- Dashboards: revalidación por demanda o intervalos cortos
- Caché de solo lectura para catálogos estáticos

---

## Flujo de una Puja (Flujo Crítico)

```
1. POSTOR hace clic en "Pujar"
   ↓
2. Client Component envía Server Action
   ↓
3. Server Action llama a lib/auction-engine.ts
   ↓
4. auction-engine.ts:
   a. Verifica que el remate esté ACTIVO
   b. Verifica que el POSTOR tenga garantía pagada
   c. Verifica que el monto sea superior al actual
   d. Verifica incremento mínimo
   e. Ejecuta PRISMA TRANSACTION:
      - INSERT Bid
      - UPDATE Asset (nuevo precio)
   ↓
5. SSE emite evento a todos los conectados
   ↓
6. Client Components reciben y actualizan UI
```

---

## Modelo de Seguridad

### Autenticación
- NextAuth.js con estrategia JWT
- Sesión con información de usuario y rol
- Cookies HttpOnly + Secure

### Autorización
- Middleware de Next.js verifica rol en cada ruta
- Rutas protegidas: `/admin/*`, `/martillero/*`, `/postor/*`
- Server Actions validan rol del usuario antes de ejecutar

### Validación Server-Side
- Prohibido validar solo en cliente
- Cada Server Action valida: usuario autenticado, rol correcto, datos válidos
- Transacciones atómicas para prevenir condiciones de carrera

---

## Tiempo Real con SSE

### Por qué SSE sobre WebSockets
- Más simple de implementar con Next.js
- Funciona con Server Components sin configuración adicional
- Suficiente para el caso de uso (solo servidor → cliente)
- Sin necesidad de servidor WebSocket separado

### Arquitectura SSE
```
┌──────────────┐     POST /api/sse/auctions/[id]     ┌──────────────┐
│   Cliente    │ ◄────────────────────────────────── │   Servidor   │
│   (Browser)  │     Response Stream (text/event)     │   (Next.js)  │
└──────────────┘                                      └──────────────┘
       │                                                      │
       │  Server Action: placeBid()                           │
       └──────────────────────────────────────────────────────┘
                                  │
                          SSE emite evento a todos
```

---

## Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/remates

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui

# Almacenamiento (opcional)
STORAGE_PATH=./public/uploads
```

---

## Convenciones de Código

| Regla | Ejemplo |
|-------|---------|
| TypeScript strict, sin `any` | `const id: string = user.id` |
| Server Actions en `app/actions/` | `export async function placeBid(data: BidInput)` |
| Lógica en `lib/auction-engine.ts` | `export function validateBid(...)` |
| Componentes con nombre descriptivo | `BidControls.tsx`, `AuctionTimer.tsx` |
| Interfaces en `types/auction.ts` | `export interface Auction { ... }` |
| Transacciones Prisma para pujas | `$transaction([createBid, updateAsset])` |
| `revalidate: 0` para datos dinámicos | `fetch(url, { next: { revalidate: 0 } })` |
