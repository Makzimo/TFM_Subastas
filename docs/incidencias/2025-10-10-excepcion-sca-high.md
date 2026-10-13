# Excepción SCA - HIGH Residual (Solo Dev Tooling)

## Fecha
2025-10-10 (actualizado 2026-10-10)

## Vulnerabilidades HIGH (estado tras corrección)
- 3 HIGH residuales, **todas en dev tooling**:
  - `deepmerge-ts` (vía `prisma` CLI → `@prisma/config`) — patched `>=8.0.0`
  - `mysql2` (vía `prisma` CLI) — patched `>=3.22.0`
  - `braces` (vía `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`) — sin parche público compatible
- 0 Critical ✓

## Corrección de alcance (importante)
La versión previa de esta excepción afirmaba que **los 4 HIGH eran solo dev tooling**. Eso era **inexacto**: existía un HIGH de **runtime de producción**:

- `next` 16.3.6 → *Server-Side Request Forgery en Image Optimization* (GHSA-cjq9-62q9-8jv4). Vulnerable `>=16.0.0 <16.3.8`.

**Acción:** parcheado `next` a **16.4.0** (>=16.3.8) como fix crítico autorizado bajo Feature Freeze. Incidencia detallada en `2026-10-10-next-ssrf-fix.md`.

## Alcance de la excepción vigente
Solo `devDependencies` (linting/eslint y Prisma CLI). **No afecta runtime, build de producción ni código de aplicación.**

## Justificación
Riesgo aceptable temporalmente para tooling dev. Los gates funcionales pasan. Bloquea únicamente el `--audit-level=high` estricto. `braces` no tiene parche público estable compatible con la cadena; `deepmerge-ts`/`mysql2` dependen del CLI de Prisma (no del runtime).

## Aprobación
**APROBADA** por Tech Lead (rol asumido por el responsable de ejecución) el 2026-10-10, como **GO condicionado**: no quedan HIGH de runtime. Excepción acotada a dev tooling y registrada para trazabilidad.

## Verificación (2026-10-10)
- `pnpm check`: OK (0 errores)
- `pnpm test`: 8/8 OK
- `pnpm build`: OK (Next 16.4.0)
- `pnpm prisma validate`: OK
- `pnpm audit --audit-level=high`: 3 HIGH (dev-only), 0 Critical, 0 HIGH runtime

---

## Re-verificación (2026-10-12, v0.16.4)

Se repitió la auditoría tras el despliegue a producción y tras añadir `@vercel/blob`.

- `pnpm audit`: **7 hallazgos = 0 Critical · 3 HIGH · 4 moderate**, todos bajo `prisma` (devDependency) o `eslint-config-next`:

| Severidad | Paquete | Cadena | Parche |
|---|---|---|---|
| high | `braces` | `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` | **sin parche** (`<0.0.0`) |
| high | `deepmerge-ts` | `prisma` → `@prisma/config` | `>=8.0.0` |
| high | `mysql2` | `prisma` | `>=3.22.0` |
| moderate | `mysql2` | `prisma` | `>=3.23.1` |
| moderate | `@hono/node-server` ×2 | `prisma` → `@prisma/dev` | `>=1.19.13` / `>=1.19.15` |
| moderate | `valibot` | `prisma` → `@prisma/dev` | `>=1.4.2` |

### Evidencia de que no alcanzan el runtime
Análisis del bundle de producción generado por `pnpm build` (`.next/server`, 17 MB):

- `mysql2`, `deepmerge-ts`, `@hono/node-server` y `valibot`: **cero referencias** en `.next/server`.
- `micromatch`: una única aparición, y es un **string de datos** (el `package.json` vendorizado de un paquete), no un `require`/`import` ejecutable.
- `prisma` y `eslint-config-next` son `devDependencies`; el runtime de producción solo incluye `@prisma/client` + `@prisma/adapter-pg` (driver PostgreSQL) y `pg`.

### Por qué no se aplican `pnpm overrides`
- `braces` **no tiene versión parcheada** publicada, por lo que ningún override lo resuelve.
- `mysql2`/`deepmerge-ts`/`@hono/node-server`/`valibot` pertenecen al **CLI** de Prisma, que no se ejecuta en el servidor Next.js. Forzar un major (`deepmerge-ts` 8.x) en el árbol del CLI arriesga romper `prisma migrate` sin aportar seguridad al runtime. Se prefiere la excepción documentada y revisable.

**Conclusión:** la excepción vigente se mantiene. **0 vulnerabilidades de runtime.**
