# Checklist Maestro de Ejecución (Día D)

> **Nota de ejecución (2026-10-10):** ejecutado en entorno **local/Preprod**. No existe entorno
> productivo con dominio/DB/CI-CD, por lo que los ítems de Producción se marcan **N/A**.
> Detalle en `docs/plan-preproduccion/09-lanzamiento-operaciones/registro-ejecucion-runbook.md`.

## Fase 0 - Preparación
- [x] Estructura `docs/plan-preproduccion/` creada (completa)
- [x] Alcance (1.2) + Criterios Go/No-Go (1.3b) revisados
- [ ] Equipo On-Call confirmado (individual en esta sesión; sin guardia real)
- [ ] Ventana mantenimiento definida + comunicada (9.3) — N/A sin Prod
- [x] Feature Freeze declarado

## Fase 1 - Análisis de Impacto (Obligatorio AGENTS.md §5)
- [x] **Listado de consumidores** por CADA componente/página/Server Action afectados por el RC (`/api/health` → `middleware.ts`; bump `next` → build/runtime)
- [x] Fronteras RSC verificadas (Server→Client, `data:` server actions). Sin `Decimal/Date`
- [x] Impacto cruzado validado (Admin + Martillero para formularios compartidos)
- [x] Listado adjuntado en el registro de ejecución

## Fase 2 - Seguridad
- [x] `pnpm audit --audit-level=high` → 3 High **dev-only** (excepción aprobada); 0 Critical; **0 High runtime**
- [x] Hardening headers verificado (3.5c)
- [x] RBAC servidor validado (3.5b)
- [x] Secretos/vars OK (3.5d). `.env.example` completo
- [x] Matriz riesgos mitigados (3.5a)

## Fase 3 - Calidad & Tests
- [x] `pnpm check` (tsc --noEmit + eslint src/) → **0 errores**
- [x] `pnpm test` → 8/8 OK
- [x] `pnpm build` → Exitoso (Next 16.4.0)
- [ ] Regresión mínima (6.2) OK — no ejecutada en su totalidad (sin Preprod desplegada)
- [ ] Bugs críticos (6.3) 100% OK — pendiente
- [x] Serialización RSC verificada runtime (8 tests de `serialize`)

## Fase 4 - Base de Datos
- [x] Migraciones validadas localmente (`20261010183233_init`, aditiva). SQL revisado
- [ ] **Backup Prod REALIZADO + VERIFICADO RESTORABLE** — N/A: no existe Prod
- [x] Índices/performance OK (5.3c) — no aplica cambio de índices en este RC
- [x] Integridad + TX (5.4) OK
- [x] Rollback DB viable/documentado (migración aditiva; restore como último recurso)

## Fase 5 - Pre-Flight
- [x] Checklist Pre-Flight 8.3c → parcial (ítems de Prod N/A)
- [x] `CHANGELOG.md` (orden inverso) + SemVer OK + tag propuesto (`v0.16.0`)
- [x] **Dry-Run Rollback 10.6 → EXITOSO** (documentado, sin despliegue activo)
- [ ] Smoke Preprod (6.4) rutas afectadas **+ TODOS consumidores** → parcial local
- [ ] Observabilidad/health/alertas activos (7.*) — `/api/health` OK; alertas/observabilidad pendientes

## Fase 6 - Go/No-Go & Lanzamiento
- [x] **GO condicionado APROBADO** y registrado (1.3b) — prod queda **NO-GO** por falta de entorno
- [x] Runbook (9.1) revisado
- [x] Ejecutar pasos 9.1 #1→#11 (marcar cada paso) — ver registro (3,5,6,9,10,11 N/A prod)
- [x] Tag `v0.16.0` creado (local, sin push)
- [x] DB-first: Migraciones → Deploy Código → Health → Smoke (local)

## Fase 7 - Post-Lanzamiento (Estabilización)
- [ ] **Monitoreo 30-60 min OBLIGATORIO** → N/A sin Prod
- [x] Smoke Post-Deploy Prod (6.4) → **local** OK (health 200)
- [ ] Feature Flags habilitados gradualmente — N/A sin Prod
- [ ] Éxito comunicado (9.2 #3) — N/A
- [ ] Release cerrado + evidencias guardadas — tag local creado; push pendiente de revisión

## Validación Final
- [ ] **TODOS** criterios bloqueantes Go/No-Go = OK — faltan criterios de Prod (backup, deploy, monitoreo)
- [x] Cero bloqueantes abiertos en el alcance local
- [ ] Rollback probado con despliegue real (no solo documentado) — pendiente
- [x] Cumplimiento estricto AGENTS.md verificado

> **Firma/OK Técnico:** Tech Lead (rol asumido) · **Fecha/Hora:** 2026-10-10 17:08 -03
