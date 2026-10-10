# Criterios Go/No-Go

## Criterios Obligatorios (Must-Have)

| Categoría | Criterio | Verificación | Responsable | Bloqueante |
|---|---|---|---|---|
| Código | `pnpm check` (tsc --noEmit + eslint src/) sin errores | CI/Local | Dev/Tech Lead | **Sí** |
| Tests | `pnpm test` pasa (suites críticas) | CI | Dev/QA | **Sí** |
| Build | `pnpm build` exitoso | CI | Dev/DevOps | **Sí** |
| Seguridad | `pnpm audit --audit-level=high` sin High/Critical | CI/Preflight | DevSecOps/Dev | **Sí** |
| DB | Migraciones validadas en Preprod (SQL revisado). Backup Prod verificado/restorable | Preflight | DevOps/DB | **Sí** |
| Regresión | Smoke tests rutas afectadas **+ TODOS sus consumidores** OK | Preprod | QA/Dev | **Sí** |
| Lógica Subasta | Garantía (`isPaid`), cierre manual, TX, race conditions OK | Integration/E2E crítico | Backend/QA | **Sí** |
| Serialización RSC | Fronteras Server→Client y `data:` server actions usan objetos planos (`number/ISO`). Sin `Decimal/Date`. | Revisión + verificación | Dev | **Sí** |
| RBAC | Validación servidor por rol en acciones críticas | Integration | Backend | **Sí** |
| Observabilidad | Health checks, logs estructurados, alertas activas | Preprod | DevOps | **Sí** |
| Rollback | Plan + **dry-run** exitoso (app + DB si aplica) | Preprod | DevOps/Tech Lead | **Sí** |
| Changelog | `CHANGELOG.md` actualizado (Keep a Changelog, **orden cronológico inverso**) + SemVer correcto | Revisión | Dev/Tech Lead | **Sí** |
| Docs | Decisiones arquitectónicas documentadas en `/docs` | Revisión | Tech Lead | **Sí** |

## Umbrales
- **BLOQUEANTE (Go/No-Go):** Cualquier criterio marcado **Sí** en rojo. No se permite excepción sin registro formal.
- **NO-BLOQUEANTE:** Pequeñas mejoras UI, typos no funcionales. Deben trackearse como issue post-release.

## Proceso de Excepción
1. Justificación técnica detallada.
2. Análisis de impacto + riesgo mitigado.
3. Aprobación explícita Tech Lead + responsable área.
4. Registro en acta/release notes + seguimiento.

## Veredicto
- **GO:** Todos obligatorios OK + dry-run rollback OK + equipo on-call confirmado.
- **NO-GO:** Al menos 1 bloqueante pendiente o riesgo no mitigado.