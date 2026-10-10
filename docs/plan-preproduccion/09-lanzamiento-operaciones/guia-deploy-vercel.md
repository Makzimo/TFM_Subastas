# Guía de Despliegue en Vercel (Primera vez)

> Guía paso a paso para llevar la plataforma de remates a producción usando **Vercel** + **PostgreSQL (Neon)**.
> Sigue el orden. No te saltes pasos.

---

## Antes de empezar (requisitos)

| Necesitas | Dónde se crea | Costo |
|---|---|---|
| Cuenta GitHub | https://github.com | Gratis |
| Cuenta Vercel | https://vercel.com | Gratis (plan Hobby) |
| Base de datos PostgreSQL | Neon (se crea desde Vercel) | Gratis (plan free) |

> **Nota:** El proyecto ya está en Git con el tag `v0.16.0`. Falta subirlo a GitHub.

---

## Paso 0 - Subir el proyecto a GitHub

En la carpeta del proyecto, ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/remates-tfm.git
git push -u origin main
git push origin release/v0.16.0
git push origin v0.16.0
```

> Si `main` no existe todavía, primero: `git branch -M main` y luego el push.

**Verifica:** que el repo aparezca en GitHub con el código.

---

## Paso 1 - Crear la Base de Datos (PostgreSQL) en Vercel

1. Entra a https://vercel.com y crea cuenta con GitHub.
2. En el dashboard, ve a **Storage** → **Create Database**.
3. Elige **Neon** (Postgres) → plan **Free**.
4. Región: la más cercana a tus usuarios (ej. `us-east-1` o `sa-east-1`).
5. Crea la base. Copia la **connection string** (empieza con `postgresql://...`). La necesitarás en el Paso 3.

> **Importante:** la connection string debe incluir `?sslmode=require` al final.

---

## Paso 2 - Importar el proyecto en Vercel

1. En Vercel: **Add New** → **Project** → **Import Git Repository**.
2. Selecciona tu repo `remates-tfm`.
3. Framework detectado: **Next.js** (dejar por defecto).
4. **NO hagas deploy todavía.** Primero configura las variables (Paso 3).

---

## Paso 3 - Configurar Variables de Entorno (¡CLAVE!)

En Vercel, antes del primer deploy: **Settings** → **Environment Variables**. Agrega **una por una**:

| Nombre | Valor | Entorno |
|---|---|---|
| `DATABASE_URL` | La connection string de Neon (Paso 1) | Production, Preview, Development |
| `AUTH_SECRET` | Resultado de `openssl rand -base64 32` | Production, Preview, Development |
| `AUTH_URL` | `https://tu-proyecto.vercel.app` (te lo da Vercel; ajusta tras el deploy) | Production |
| `AUTH_TRUST_HOST` | `true` | Production, Preview |
| `NEXTAUTH_URL` | Igual que `AUTH_URL` | Production |
| `NEXTAUTH_SECRET` | Igual que `AUTH_SECRET` | Production, Preview, Development |

> Genera el secreto con: `openssl rand -base64 32`
> En Windows sin openssl: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**Guarda.** Luego haz clic en **Deploy**.

---

## Paso 4 - Primer Deploy

Vercel ejecutará automáticamente:
1. `pnpm install` (instala dependencias)
2. `postinstall` → `prisma generate` (genera el cliente)
3. `prisma generate && next build` (compila)

**Verifica:** el deploy termina en verde. Te dará una URL: `https://tu-proyecto.vercel.app`.

---

## Paso 5 - Aplicar Migraciones en Producción (DB-First)

La base de datos está vacía. Hay que crear las tablas. **Desde tu máquina local**, con la connection string de producción:

```bash
# Ejecuta las migraciones contra la BD de producción
DATABASE_URL="postgresql://...neon...?sslmode=require" npx prisma migrate deploy
```

En Windows PowerShell:

```powershell
$env:DATABASE_URL="postgresql://...neon...?sslmode=require"; npx prisma migrate deploy
```

**Verifica:** el comando dice que aplicó la migración `20261010183233_init`.

> ⚠️ **Antes de esto**, confirma que tienes un plan de backup (Neon hace backups automáticos en su plan).

---

## Paso 6 - Crear el usuario Admin (Seed)

Necesitas al menos un usuario administrador para entrar. Ejecuta el seed contra producción:

```bash
DATABASE_URL="postgresql://...neon...?sslmode=require" \
SEED_ADMIN_PASSWORD="TU_PASSWORD_SEGURA" \
SEED_MARTILLERO_PASSWORD="TU_PASSWORD_SEGURA" \
SEED_POSTOR_PASSWORD="TU_PASSWORD_SEGURA" \
npx tsx prisma/seed.ts
```

**Guarda** las contraseñas que uses. El admin será `admin@remates.cl`.

> ⚠️ **No uses las contraseñas por defecto de desarrollo en producción.**

---

## Paso 7 - Verificar (Health + Smoke)

### Health check
Abre en el navegador: `https://tu-proyecto.vercel.app/api/health`

**Debe devolver:** `{"status":"ok","version":"v0.16.0","checks":{"db":"ok"},...}`

Si devuelve `503` o `"db":"fail"` → la `DATABASE_URL` está mal. Revisa el Paso 3.

### Smoke test (lo mínimo crítico)
| Qué probar | Resultado esperado |
|---|---|
| Abrir `/login` | Carga la pantalla de login |
| Login con `admin@remates.cl` | Entra al dashboard |
| Abrir `/remates` | Lista los remates |
| Abrir la Sala de Remate de un lote | Carga y muestra precio |
| `/postor/garantia` | Muestra estado de garantía |

---

## Paso 8 - Monitoreo (30-60 min OBLIGATORIO)

Tras el deploy, **quédate observando 30-60 minutos**:
- Vercel → **Deployments** → **Functions** → revisa errores 5xx.
- Vercel → **Logs** (runtime) → busca errores en rojo.
- Abre `/api/health` un par de veces: debe seguir en `200`.

**No des el lanzamiento por cerrado hasta que pase ese tiempo sin errores.**

---

## Rollback (si algo sale mal)

Vercel guarda todos los deploys:
1. Vercel → **Deployments** → elige el deploy anterior bueno.
2. Clic en **...** → **Promote to Production** (o "Redeploy").
3. Verifica `/api/health` otra vez.

Si el problema es de base de datos (migración destructiva) → seguir `10-rollback-contingencia/plan-rollback.md` (restore desde backup Neon).

---

## Checklist final de lanzamiento

- [ ] Repo en GitHub (Paso 0)
- [ ] DB PostgreSQL creada (Paso 1)
- [ ] Variables de entorno configuradas en Vercel (Paso 3)
- [ ] Deploy en verde (Paso 4)
- [ ] Migraciones aplicadas a producción (Paso 5)
- [ ] Usuario admin creado (Paso 6)
- [ ] `/api/health` devuelve `ok` (Paso 7)
- [ ] Smoke test crítico OK (Paso 7)
- [ ] Monitoreo 30-60 min sin errores (Paso 8)
- [ ] Éxito comunicado

---

## Problemas conocidos (leer antes de lanzar)

| Problema | Detalle | Solución |
|---|---|---|
| **Subida de imágenes** | Vercel tiene el sistema de archivos de **solo lectura**. El endpoint `/api/uploads` escribe en `public/uploads` y **fallará en producción**. | Migrar a **Vercel Blob** (ver incidencia `2026-10-10-uploads-vercel.md`). En local sigue funcionando. |
| **SSE (tiempo real)** | Vercel serverless tiene límite de tiempo en conexiones. | Validar que la Sala de Remate funcione; si el SSE se corta, evaluar alternativa. |
| **Zona horaria** | Vercel usa UTC. | Revisar fechas si se muestran al usuario. |
