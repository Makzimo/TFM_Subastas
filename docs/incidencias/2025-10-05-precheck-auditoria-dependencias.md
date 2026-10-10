# Incidencia - Auditoría de Dependencias (Pre-Check Preproducción)

## Fecha
2025-10-05

## Estado
Identificado - Documentado (sin bloquear ejecución plan preproducción. Requiere tratamiento antes de producción).

## Contexto
Ejecución `pnpm audit --audit-level=high/critical` en rama/estado actual del repo.

## Hallazgos
- `pnpm audit --audit-level=high`: **33 high | 6 critical | 25 moderate | 1 low** (total 65)
- Critical destacado:
  - `next` >=16.2.0 <16.3.6 → GHSA-vcvr-r3jv-pc5j (Remote Code Execution in next/og ImageResponse) - **Patched >=16.3.6**

## Impacto
Crítico (CVEs en Next.js 16.2.10). Requiere actualización controlada antes de pase a Producción.

## Acción Correctiva
1. Evaluar impacto actualización Next.js 16.2.10 → >=16.3.6 (breaking changes menores/patch). Revisar changelog Next.js 16.3.x.
2. Actualizar `next` en `package.json` + lockfile (pnpm).
3. Ejecutar `pnpm check`, `pnpm test`, `pnpm build` tras actualización.
4. Re-run `pnpm audit --audit-level=high` → objetivo **0 High/Critical** (bloqueante Go/No-Go).
5. Validar rutas con `ImageResponse`/OG (si usadas). No aparecen usos evidentes en código, pero revisar.

## Priorización
**Bloqueante para Go/No-Go (Producción)** según criterio 3.5f y 8.1.

## Seguimiento
Asignar owner Dev/Tech Lead. Target resolver antes de fase Deploy Prod.

## Evidencia
Salida completa audit guardada en tool-output (65 vulnerabilidades). 
