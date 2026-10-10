# Incidencia: HIGH de runtime (SSRF en Next.js) detectado en Pre-Flight

## Fecha
2026-10-10

## Severidad
**Alta (bloqueante Go/No-Go)** — vulnerabilidad de runtime de producción.

## Detección
Durante la ejecución del runbook (Paso 1, validación de criterios Go/No-Go) se ejecutó
`pnpm audit --audit-level=high`. Resultado: **4 HIGH**, uno de ellos **de runtime**:

- **`next` 16.3.6** — *Server-Side Request Forgery en Image Optimization* (GHSA-cjq9-62q9-8jv4).
  Vulnerable `>=16.0.0 <16.3.8`; parcheado `>=16.3.8`.

## Impacto
- La excepción SCA previa (`2025-10-10-excepcion-sca-high.md`) declaraba "solo dev tooling",
  lo que era **incorrecto**. El gate bloqueante "0 High/Critical" **no pasaba**.
- Sin este fix, el **Paso 4 (tag)** habría etiquetado un build con vulnerabilidad de runtime.

## Causa raíz
Dependencia `next` sin actualizar al último patch; la evidencia de auditoría previa no distinguía
dependencias de runtime vs. dev (`paths` con `.>next` es producción; las demás pasan por `prisma`/`eslint`).

## Acción correctiva
1. `package.json`: `next` `^16.3.6` → `^16.3.8` (resuelve a **16.4.0**, latest estable).
2. `pnpm install` (lockfile actualizado).
3. Re-ejecución de gates: `check`, `test`, `build`, `audit`, health local.

## Verificación post-fix
- `pnpm audit --audit-level=high` → **3 HIGH dev-only**, 0 Critical, **0 HIGH runtime**.
- `pnpm check` OK · `pnpm test` 8/8 · `pnpm build` OK (Next 16.4.0).
- `GET /api/health` → `200 {status:"ok", checks:{db:"ok"}}`.

## Proceso
Fix crítico de seguridad autorizado bajo Feature Freeze por Tech Lead (2026-10-10).
Análisis de impacto: cambio de dependencia runtime → revalidado con build + smoke local.

## Estado
**Resuelto.** Excepción SCA reducida a dev tooling (3 HIGH).
