# Incidencia: primer despliegue a producción (BD vacía)

- **Fecha:** 2026-10-12
- **Entorno:** Producción (Vercel + Prisma Postgres)
- **Proyecto:** `tfm-subastas` (`prj_dxi5LhHAzzmDkHmcbw3HvdQ9qyaw`)
- **URL:** https://tfm-subastas.vercel.app
- **Estado:** resuelta

## Síntoma

- `GET /` → **500**
- `GET /api/health` → **200** `{"status":"ok","checks":{"db":"ok"}}`
- `GET /login` → **200**

### Error en logs de runtime

```
PrismaClientKnownRequestError: Invalid `prisma.asset.findMany()` invocation:
The table `public.Asset` does not exist in the current database.
code: 'P2021', driverAdapterError: TableDoesNotExist, digest: '2400197632'
```

## Causa raíz

La base de datos se creó **vacía**. El código se desplegó correctamente y la
**conexión a la BD funciona** (el healthcheck ejecuta `SELECT 1` con éxito), pero
**las migraciones nunca se aplicaron**, por lo que no existían las tablas
(`User`, `Asset`, `Bid`, `BidderGuarantee`, `AuditLog`).

`src/app/page.tsx` consulta `prisma.asset.findMany()` en cada request
(`export const dynamic = "force-dynamic"`), por eso el error es un 500
**runtime**, no de build.

> **Lección:** `/api/health` solo ejecuta `SELECT 1`
> (`src/app/api/health/route.ts:15`). **No valida la existencia de tablas.**
> Un health en verde no prueba que el esquema esté aplicado.

## Obstáculos encontrados

### 1. Variables de BD marcadas como "Sensitive" en Vercel

`vercel env pull .env.production.local --environment=production` devolvió:

```
DATABASE_URL="[SENSITIVE]"
POSTGRES_URL="[SENSITIVE]"
PRISMA_DATABASE_URL="[SENSITIVE]"
```

Las variables creadas por la integración con Prisma Postgres no pueden
convertirse de *Secret* a *Config* en su sitio, por lo que **no es posible
leerlas desde el CLI** para correr migraciones desde local.

### 2. Bug de Prisma Console (SSO de Vercel)

El botón **Open in Prisma** desde el Storage de Vercel fallaba con
`Unexpected Server Error`. Bug conocido y en curso de Prisma
(github.com/prisma/prisma/issues/30106). Impide copiar la cadena de conexión
**Direct** para usarla localmente.

## Solución adoptada

Aplicar migración y seed **desde el propio build de Vercel**, usando la
`DATABASE_URL` que la integración ya inyecta en el entorno de build.

1. Se agregaron las variables de autenticación y de seed en Vercel
   (`AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `NEXTAUTH_URL`,
   `NEXTAUTH_SECRET`, `SEED_ADMIN_PASSWORD`, `SEED_MARTILLERO_PASSWORD`,
   `SEED_POSTOR_PASSWORD`).
2. Se sobrescribió el **Build Command** del proyecto:

   ```
   pnpm db:migrate:deploy && pnpm db:seed && pnpm build
   ```

3. Se forzó un **deploy nuevo** (no un "Redeploy" del deploy anterior), ya que
   Vercel reutiliza el snapshot de configuración del deployment existente y el
   cambio de Build Command no se aplicaba sobre él.

Sobre el uso de la cadena **pooled**: el KB de Vercel+Prisma indica que si no
existe `DIRECT_URL`, los comandos de esquema de Prisma caen en el uso de
`DATABASE_URL` (pooled), por lo que es aceptable para este caso.

## Seguimiento pendiente

- **Revertir el Build Command** a su valor por defecto una vez aplicadas las
  migraciones, para que `db:migrate:deploy` y `db:seed` no se ejecuten en cada
  deploy (ambos son idempotentes, pero no deben formar parte del build normal).
- Resolver el **bloqueante de subida de imágenes** (Vercel tiene filesystem de
  solo lectura) → `2026-10-10-uploads-vercel.md`.

## Corrección asociada

- `.gitignore`: la línea `.env*` agregada por `vercel link` anulaba el negativo
  `!.env.example` (la última regla que coincide gana). Se reemplazó por
  `.vercel/`, dejando que `.env.*` siga protegiendo los secrets.
