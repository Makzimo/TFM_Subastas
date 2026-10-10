# Migraciones Prisma

## Validación Previa
- [ ] `pnpm prisma validate`
- [ ] `pnpm prisma format` (schema consistente)
- [ ] Revisar `prisma/schema.prisma` cambios vs impacto
- [ ] `pnpm prisma generate` OK

## Reglas Críticas
- **Nunca editar migraciones ya aplicadas** en ningún entorno.
- **Revisar SQL generado** antes de aplicar (`migrate dev` → revisar archivos SQL). Inspeccionar operaciones destructivas (`DROP`, `ALTER COLUMN NOT NULL`, `TRUNCATE`, `CASCADE`).
- **Migraciones aditivas preferidas** (zero-downtime). Cambios destructivos requieren ventana + migración segura + justificación.
- **DB-first vs Code-first:** **Aplicar migraciones DB ANTES de desplegar código** que dependa de ellas. Orden correcto documentado en runbook.

## Proceso (Preprod → Prod)
1. **Desarrollar**: `prisma migrate dev` (local). Commit archivos migración + schema.
2. **Revisar**: PR incluye SQL + impacto + plan rollback DB.
3. **Validar Preprod:** Aplicar **idénticas** a Prod (orden + contenido). Probar con datos representativos.
4. **Backup Prod**: **Obligatorio** antes de aplicar en Prod (ver Backup/Restore).
5. **Aplicar Prod:** Solo tras Go/No-Go. Monitorear locks prolongados.
6. **Post-migrate:** Smoke + verificar integridad.

## Rollback de Migraciones
- **Down migrations**: Documentar por migración crítica (si existen/viables). No todas destructivas son reversibles.
- **Estrategia preferida fallback:** **Restore desde backup** como último recurso (downtime mayor). Evaluar pérdida datos → requiere aprobación explícita.

## Precauciones
- Evitar cambios masivos en tabla grande sin estrategia (online DDL). Evaluar locks.
- `NOT NULL` sin default en datos existentes = bloqueante (requiere backfill).
- Índices grandes: crear con estrategia para minimizar bloqueo.

## Checklist
- [ ] SQL migración revisado y aprobado
- [ ] Preprod aplicado OK (dry-run validado)
- [ ] Backup Prod verificado restorable
- [ ] Ventana definida si destructivo
- [ ] Rollback DB documentado/viable