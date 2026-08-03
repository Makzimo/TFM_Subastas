# Plataforma de Remates

Plataforma web para subastas de vehículos y especies de alto rendimiento, con sincronización en tiempo real, sistema de garantías y auditoría completa.

## Stack Tecnológico

- **Frontend:** Next.js 16 (App Router) + TypeScript 5.8 + Tailwind CSS v4 + Shadcn/UI
- **Backend:** Server Actions + Prisma 7 ORM + PostgreSQL 16 (Docker)
- **Tiempo real:** Server-Sent Events (SSE)
- **Auth:** Auth.js v5 (NextAuth) con JWT
- **Versionado:** Git + CHANGELOG (Keep a Changelog)

## Requisitos Previos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (gestor de paquetes)
- [Docker](https://www.docker.com/) (para PostgreSQL)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ProyectoTFM_MaximilianoFaundez

# Instalar dependencias
pnpm install

# Levantar PostgreSQL con Docker
docker compose up -d

# Generar cliente Prisma
pnpm prisma generate

# Sincronizar schema con la base de datos
pnpm prisma db push

# Sembrar usuario admin
pnpm db:seed

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrativo | `admin@remates.cl` | `Admin123!` |

Para crear un **Postor** o **Martillero**, usar la página de registro (`/register`).

## Estructura del Proyecto

```
src/
├── lib/
│   ├── auth.ts            # Configuración Auth.js v5
│   ├── prisma.ts          # Singleton PrismaClient
│   ├── auction-engine.ts  # Motor de subastas (validaciones, transacciones)
│   ├── audit.ts           # Sistema de auditoría
│   ├── errors.ts          # Errores custom
│   ├── rate-limit.ts      # Rate limiting en memoria
│   └── stats.ts           # Estadísticas server-side
├── hooks/
│   └── useSSE.ts          # Conexión SSE con reconexión
├── components/            # Componentes UI y de lógica
├── app/
│   ├── (auth)/            # Login, registro
│   ├── admin/             # Panel administrativo
│   ├── martillero/        # Panel del martillero
│   ├── postor/            # Panel del postor
│   ├── remates/           # Listado y sala de subasta
│   └── api/               # Auth, uploads, SSE
└── middleware.ts           # Protección de rutas por rol
```

## Funcionalidades

### Autenticación y Roles
- Login y registro con JWT
- Tres roles: `ADMINISTRATIVO`, `MARTILLERO`, `POSTOR`
- Protección de rutas por middleware

### Gestión de Activos
- CRUD completo de lotes (vehículos/especies)
- Subida de imágenes con validación (JPEG, PNG, WebP, max 5MB)
- Transiciones de estado: `PENDIENTE → ACTIVO → ADJUDICADO/DESIERTO`

### Motor de Subastas
- Pujas con transacciones atómicas Prisma
- Incrementos flexibles: +$50.000, +$100.000, +$1.000.000 o campo libre
- Incremento mínimo: $50.000 CLP
- Cierre manual por el martillero

### Tiempo Real (SSE)
- Actualización de precios en vivo para todos los conectados
- Reconexión exponencial automática
- Indicador de conexión en la UI

### Sistema de Garantías
- Los postores deben tener garantía pagada para pujar
- Simulación de pago con verificación admin

### Dashboards
- **Admin:** métricas generales, activos, pujas, usuarios, garantías
- **Martillero:** sus activos, pujas recibidas
- **Postor:** historial de pujas, estado de garantía

### Auditoría
- Registro de acciones críticas: pujas, cierres, creación de activos
- Logs consultables por admin
- Rate limiting: max 10 pujas/min por usuario

## Comandos Disponibles

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm exec eslint src/ # Linter
pnpm prisma studio    # GUI de Prisma
pnpm db:seed          # Sembrar admin
```

## Base de Datos

PostgreSQL 16 via Docker:
- **Container:** `remates-db`
- **Puerto:** `5432`
- **Usuario:** `remates_user`
- **Password:** `remates_password`
- **Base:** `remates`

## Documentación

Ver carpeta `docs/`:
- `PLAN.md` — Índice del plan de desarrollo
- `FASE-0-SETUP.md` — Infraestructura
- `FASE-1-AUTH.md` — Autenticación
- `FASE-2-ACTIVOS.md` — Gestión de activos
- `FASE-3-SUBASTAS.md` — Motor de subastas
- `FASE-4-TIEMPO-REAL.md` — SSE
- `FASE-5-GARANTIAS.md` — Sistema de garantías
- `FASE-6-DASHBOARDS.md` — Dashboards
- `FASE-7-AUDITORIA.md` — Auditoría y seguridad

## Licencia

Proyecto académico — Trabajo de Fin de Máster
