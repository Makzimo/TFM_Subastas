# Backup y Restore

## Objetivos
- **RPO/RTO:** Definir y documentar (aceptables para corte producción).
- Garantizar **restaurabilidad** (no solo existencia de backup).

## Frecuencia
| Tipo | Frecuencia | Retención | Notas |
|---|---|---|---|
| Completo | Antes de release (obligatorio). Diario (recomendado prod). | Según política | Base para restore punto consistente. |
| Incremental/WAL (si disponible) | Según RPO | Según política | Permite PITR (Point-in-Time Recovery). Evaluar Postgres. |

## Requisitos Obligatorios
- **Backup OBLIGATORIO** antes de cualquier migración en Producción.
- **PRUEBA DE RESTORE OBLIGATORIA:** Ejecutar restore de prueba en entorno aislado (no sobre prod). Documentar fecha, duración, integridad, resultado. **Gate para Go/No-Go** (debe estar verificado y exitoso recientemente).
- **Verificación integridad:** Checksums + post-restore smoke tests (DB reachable + tablas críticas + conteos).

## Procedimiento Restore (Resumen)
1. **Confirmar necesidad** + aprobación (según plan rollback).
2. **Detener tráfico/escrituras** si downtime (ventana).
3. **Restaurar backup** a entorno/instancia objetivo (aislado o reemplazo según estrategia).
4. **Verificar integridad** (schema, conteos, datos críticos, FK).
5. **Smoke post-restore** (aplicación conecta, queries críticas OK).
6. **Rehabilitar tráfico** gradualmente. Monitorear.
7. **Registrar evento** + tiempos (RTO real).

## Política de Retención
- Definir por tipo (completo/incremental). Cumplir compliance interno.
- Almacenamiento externo/aislado (off-site) recomendado (protección borrado accidental).

## Checklist
- [ ] Backup Prod ejecutado
- [ ] Verificable (checksum/tamaño/fecha)
- [ ] **Restore de prueba documentado y OK** (última ejecución válida registrada)
- [ ] Procedimiento documentado y probado (dry-run)
- [ ] RPO/RTO definidos

## Registro de Restore de Prueba
Crear entrada: Fecha, entorno prueba, tipo backup, duración, OK/FAIL, observaciones, responsable. (Incluir en Anexos si desea).