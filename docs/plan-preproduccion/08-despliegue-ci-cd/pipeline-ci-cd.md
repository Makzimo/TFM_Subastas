# Pipeline CI/CD - Quality Gates

## Etapas Obligatorias

| Etapa | Acción/Comandos | Criterio Éxito | Bloqueante | Notas |
|---|---|---|---|---|
| **Install** | `pnpm install --frozen-lockfile` | Instala OK | **Sí** | Exclusivo `pnpm`. Prohibido npm/yarn. Cache optimizado. |
| **Lint + Typecheck** | `pnpm check` (tsc --noEmit + eslint src/) | 0 errores/warnings bloqueantes | **Sí** (§5 AGENTS.md) | Gate crítico. |
| **Formato/Validación** | Format check (si aplica) | OK | Sí | Consistencia código. |
| **Prisma Validate/Generate** | `pnpm prisma validate` + `pnpm prisma generate` | OK | Sí | Schema válido + client generado. |
| **Tests** | `pnpm test` (Unit+Integration) | Suites críticas pasan 100% | **Sí** | Fallos = bloqueantes. |
| **Build** | `pnpm build` | Build exitoso, sin errores TS | **Sí** | Verificar artefacto válido. |
| **Security SCA** | `pnpm audit --audit-level=high` | **0 High/Critical** | **Sí** (Go/No-Go) | Bloqueante absoluto. |
| **DB Migrations Diff** | Revisar migraciones nuevas (SQL diff) | Revisado/aprobado (PR) | Sí | Validar destructivas. |
| **Artifacts** | Build + tags | Generados | Sí | Versionado por tag `vX.Y.Z`. |
| **Deploy Preprod** | Deploy RC | OK | Sí | Solo tras gates verdes. |
| **Smoke Preprod** | Rutas afectadas + **TODOS consumidores** | 0 bloqueantes | **Sí** | Ver 6.4. |
| **Regression Preprod** | Suite mínima RC | OK | Sí | 6.2. |
| **Approval Prod** | Gate manual + checklist completo (3.3b + 3.10c) | Aprobado | **Sí** | Double-check Go/No-Go. |
| **Deploy Prod** | Según estrategia (8.10b) | OK | Sí | DB-first respetado. |
| **Post-Deploy Smoke** | Smoke crítico Prod | OK | **Sí** | 6.4 (mínimo). |
| **Monitoring Hold** | 30-60 min observación | Sin P0 | Sí | No cerrar release hasta estable. |

## Reglas Pipeline
- **Fail-fast:** Parar en primer bloqueante.
- **Gates inmutables:** No bypass gates críticos (excepción solo proceso emergencia documentado).
- **Cache pnpm:** Optimizar para velocidad sin comprometer `--frozen-lockfile`.
- **Artefactos reproducibles:** Mismo commit → mismo build esperado.

## Branch Protection (Recomendado)
- `main`: Requiere PR, reviews, CI verde, status checks obligatorios (check, test, build, audit).
- `release/*`: Mismos gates + freeze rules.
- Prohibir force-push ramas protegidas.