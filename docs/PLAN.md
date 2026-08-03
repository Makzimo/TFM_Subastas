# Plan Maestro de Desarrollo — Plataforma de Remates

## Resumen Ejecutivo

Plataforma de remates de vehículos y especies de alto rendimiento, segura, auditable y con sincronización en tiempo real.

**Stack tecnológico:**
- Frontend: Next.js 16 (App Router) + TypeScript 5.8 (strict) + Tailwind CSS v4 + Shadcn/UI
- Backend: Next.js Server Actions + Prisma 7 ORM + PostgreSQL 16 (Docker)
- Tiempo real: Server-Sent Events (SSE)
- Auth: Auth.js (NextAuth v5)
- Versionado: Git + CHANGELOG (Keep a Changelog)

---

## Fases del Proyecto

| # | Fase | Estado | Dependencias | Archivo |
|---|------|--------|-------------|---------|
| 0 | Infraestructura y Setup | ✅ Completada | Ninguna | [FASE-0-SETUP.md](FASE-0-SETUP.md) |
| 1 | Autenticación y Roles | ✅ Completada | Fase 0 | [FASE-1-AUTH.md](FASE-1-AUTH.md) |
| 2 | Gestión de Activos (Lotes) | ✅ Completada | Fase 1 | [FASE-2-ACTIVOS.md](FASE-2-ACTIVOS.md) |
| 3 | Motor de Subastas (Core) | ✅ Completada | Fase 2 | [FASE-3-SUBASTAS.md](FASE-3-SUBASTAS.md) |
| 4 | Tiempo Real (SSE) | ✅ Completada | Fase 3 | [FASE-4-TIEMPO-REAL.md](FASE-4-TIEMPO-REAL.md) |
| 5 | Sistema de Garantías | ✅ Completada | Fase 1 | [FASE-5-GARANTIAS.md](FASE-5-GARANTIAS.md) |
| 6 | Dashboard y Reportes | ✅ Completada | Fase 1, 2 | [FASE-6-DASHBOARDS.md](FASE-6-DASHBOARDS.md) |
| 7 | Auditoría y Seguridad | ✅ Completada | Fase 3 | [FASE-7-AUDITORIA.md](FASE-7-AUDITORIA.md) |

---

## Dependencias entre Fases

```
FASE 0 ──→ FASE 1 ──→ FASE 2 ──→ FASE 3 ──→ FASE 4
                │           │           │
                ▼           ▼           ▼
              FASE 5     FASE 6     FASE 7
```

- **FASE 0** es bloqueante para todas las demás
- **FASE 1** es prerequisite para FASE 2, 5 y 6
- **FASE 2** es prerequisite para FASE 3 y 6
- **FASE 3** es prerequisite para FASE 4 y 7
- FASES 5, 6, 7 pueden desarrollarse en paralelo una vez completadas sus dependencias

---

## Convenciones de Código

- **Prohibido el uso de `any`** en TypeScript
- Toda lógica de validación server-side en `lib/auction-engine.ts`
- Server Actions para mutaciones, Server Components para carga
- Transacciones Prisma obligatorias para pujas
- Variables de entorno: nunca hardcodear URLs o secrets
- `next: { revalidate: 0 }` para datos dinámicos de subastas
- Documentar cada decisión en `docs/`
- Solo `pnpm` como gestor de paquetes

---

## Documentación del Proyecto

| Archivo | Contenido |
|---------|-----------|
| [ARQUITECTURA.md](ARQUITECTURA.md) | Capas del sistema, flujo de puja, modelo de seguridad |
| [MODELO-DATOS.md](MODELO-DATOS.md) | Schema Prisma, ER, índices, reglas de negocio |
| [FASE-0-SETUP.md](FASE-0-SETUP.md) | Infraestructura y setup inicial |
| [FASE-1-AUTH.md](FASE-1-AUTH.md) | Autenticación y roles |
| [FASE-2-ACTIVOS.md](FASE-2-ACTIVOS.md) | Gestión de activos |
| [FASE-3-SUBASTAS.md](FASE-3-SUBASTAS.md) | Motor de subastas |
| [FASE-4-TIEMPO-REAL.md](FASE-4-TIEMPO-REAL.md) | Tiempo real SSE |
| [FASE-5-GARANTIAS.md](FASE-5-GARANTIAS.md) | Sistema de garantías |
| [FASE-6-DASHBOARDS.md](FASE-6-DASHBOARDS.md) | Dashboards y reportes |
| [FASE-7-AUDITORIA.md](FASE-7-AUDITORIA.md) | Auditoría y seguridad |

---

## Estructura del Proyecto

```
ProyectoTFM_MaximilianoFaundez/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── sse/auctions/[id]/route.ts
│   │   ├── actions/
│   │   │   ├── auth.ts
│   │   │   ├── assets.ts
│   │   │   ├── bids.ts
│   │   │   ├── guarantees.ts
│   │   │   └── uploads.ts
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── activos/nuevo/page.tsx
│   │   │   ├── activos/[id]/page.tsx
│   │   │   ├── garantias/page.tsx
│   │   │   └── audit/page.tsx
│   │   ├── martillero/
│   │   │   └── dashboard/page.tsx
│   │   ├── postor/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── garantia/page.tsx
│   │   ├── remates/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── BidControls.tsx
│   │   ├── AuctionTimer.tsx
│   │   ├── AssetCard.tsx
│   │   ├── CloseAuction.tsx
│   │   ├── WinnerIndicator.tsx
│   │   ├── LiveBid.tsx
│   │   ├── Filters.tsx
│   │   ├── GuaranteeStatus.tsx
│   │   └── providers.tsx
│   ├── generated/prisma/ (autogenerado)
│   ├── hooks/
│   │   └── useSSE.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auction-engine.ts
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   ├── sse-server.ts
│   │   ├── storage.ts
│   │   ├── audit.ts
│   │   ├── errors.ts
│   │   └── stats.ts
│   └── types/
│       └── auction.ts
├── prisma/
│   ├── schema.prisma
│   ├── config.ts
│   ├── seed.ts
│   └── migrations/
├── docs/
│   ├── PLAN.md
│   ├── ARQUITECTURA.md
│   ├── MODELO-DATOS.md
│   └── FASE-*.md
├── docker-compose.yml
├── middleware.ts
├── .env
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── AGENTS.md
└── package.json
```
