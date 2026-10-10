# Runbook de Lanzamiento (Ejecutable)

## Principio
Ejecutar **paso a paso**, verificando cada check. Usar orden **DB-first**. Documentar tiempos reales (inicio/fin por paso).

## Cadena de Decisión
- **On-Call**: Detección + activación emergencia + kill switch (P0).
- **Tech Lead**: Decisión Go/No-Go + aprobación rollback DB (si destructivo).
- **DevOps/DBA**: Deploy, migraciones, backup/restore, infraestructura.
- **QA**: Smoke/regresión, validación funcional.
- **PO**: Validación negocio (si aplica).

## Pasos Ejecutivos

| # | Acción | Detalle/Comando | Responsable | Verificación (Check) | Trigger Rollback |
|---|---|---|---|---|---|
| **1. Confirmar Go/No-Go** | Ver checklist 3.3b + 8.3c | Revisar 100% ítems OK. Registro aprobación. | Tech Lead + PO | [ ] Checklist firmado/aprobado | **Cualquier NO-GO** → Abortar |
| **2. Feature Freeze** | Confirmar freeze | Comunicado equipo + stakeholders. | Tech Lead | [ ] Confirmado | — |
| **3. Backup DB (Obligatorio)** | Backup Prod verificado | Ejecutar procedimiento 5.2. Verificar checksum/restorable. Registrar evidencia. | DevOps/DBA | [ ] Backup OK + restorable verificado | Fallo backup → **NO-GO/Abortar** |
| **4. Crear Tag Release** | Tag SemVer | `git tag -a vX.Y.Z -m "Release vX.Y.Z"` → `git push origin vX.Y.Z` | Dev | [ ] Tag visible en repo | — |
| **5. Migraciones DB (DB-First)** | Aplicar migraciones validadas | Preprod idénticas. Monitorear locks. No editar aplicadas. | DevOps/DBA | [ ] Migraciones OK. Sin locks prolongados. | Fallo migración → Ver **10.3 Rollback DB** + evaluar |
| **6. Deploy Código** | Blue-Green/Rolling | Usar artefacto tag `vX.Y.Z`. Respetar estrategia 8.2. | DevOps | [ ] Deploy OK. Instancias nuevas sanas. | Healthcheck fail → **Rollback App** |
| **7. Health Checks** | Readiness/Liveness | `curl -f https://<dominio>/api/health` (múltiples). Esperar estable 1-2 min. | DevOps | [ ] `200 OK` estable (sin flapping). Checks DB OK. | Fallos consecutivos (≥3) → Rollback |
| **8. Smoke Post-Deploy (Crítico)** | Mínimo rutas + sala remate + consumidores | Ejecutar 6.4 (Post-Deploy reducido + crítico). | QA + Dev | [ ] 0 bloqueantes. Consola sin errores críticos. | Fallo crítico → Rollback inmediato |
| **9. Habilitar Feature Flags** | Gradual | Activar flags según 4.3. Separar lectura/escritura. Kill switch listo. | Tech Lead/DevOps | [ ] Habilitados según plan. Verificado comportamiento. | Anomalías → **Kill Switch** inmediato |
| **10. Monitoreo Activo** | Ventana estabilización | Dashboards + alertas. **30-60 minutos obligatorios**. Registrar tiempos. | On-Call | [ ] Sin alertas **P0** sostenidas. Métricas estables. | Alertas P0 → Ejecutar **Plan Rollback (10)** |
| **11. Cierre Lanzamiento** | Comunicar éxito | Ejecutar 9.2 (Comunicación). Actualizar release/tag notes. | Líder Proyecto | [ ] Éxito comunicado. Release cerrado. | — |

## Puntos de Control Críticos
- **Paso 3 (Backup):** **Gate absoluto**. Sin backup verificado → NO continuar.
- **Paso 5 (Migraciones):** DB-first inquebrantable.
- **Paso 7-8 (Health+Smoke):** Bloqueantes antes de habilitar tráfico/flags amplios.
- **Paso 10 (Monitoreo):** **Obligatorio 30-60 min**. No declarar éxito prematuro.

## Tiempos & Ventana
Registrar **hora inicio/final** cada paso. Comparar vs ventana estimada. Si supera ventana crítica → re-evaluar riesgo (Tech Lead).

## Abort Criteria
Abortar inmediatamente si: backup fail, migración con lock prolongado no mitigable, health fail sostenido, smoke crítico fail, Go/No-Go revocado por riesgo imprevisto. Usar Rollback/Contingencia según caso.