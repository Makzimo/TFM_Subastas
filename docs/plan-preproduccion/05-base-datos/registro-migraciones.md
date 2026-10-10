# Registro de Migraciones - Preproducción

## Fecha
2025-10-10

## Acciones realizadas
1. Detectado BD existente con esquema pero sin historial Prisma Migrate → reset + baseline
2. Ejecutado `prisma migrate reset --force` (limpieza dev para sincronizar historial)
3. Ejecutado `prisma migrate dev --name init` → creada migración `20261010183233_init`
4. `prisma migrate status` → Database schema is up to date
5. Seed ejecutado correctamente

## Migraciones creadas
- `prisma/migrations/20261010183233_init/migration.sql`

## Estado
- Local/Preprod inicial sincronizado con schema
- Listo para baseline en Preprod/Prod según guía: https://pris.ly/d/migrate-baseline

## Notas
- BD localhost:5432 (remates) usada para validación
- No se editaron migraciones existentes (no aplicadas previamente)
- Archivo generado revisable para validación SQL antes de promover a Preprod/Prod
