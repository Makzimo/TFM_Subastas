# Paso 3 Runbook - Backup Producción

## Fecha
2026-10-10

## Estado
**BLOQUEANTE**: No existe entorno de Producción configurado. No es posible realizar ni verificar backup real de Producción.

## Contexto
El runbook (9.1) paso #3 exige **antes** de cualquier migración/deploy en Prod:
- Backup de Producción realizado
- **Restaurabilidad verificada** (evidencia con fecha/resultado)

## Situación actual
- No hay host Prod, DB Prod, dominio ni credenciales productivas definidas.
- Backup local/dev verificado (migración init + seed OK) — **no sustituye** backup Prod.

## Requisitos para desbloquear
1. Definir entorno Prod (host, DB PostgreSQL, dominio, HTTPS).
2. Configurar política/servicio de backup (completo + incremental/WAL si aplica).
3. Ejecutar backup inicial.
4. **Probar restore en entorno aislado** y registrar evidencia (fecha, duración, resultado).
5. Marcar gate Go/No-Go Paso #3.

## Recomendación
No proceder a Pasos #5 (migraciones Prod) ni #6 (deploy) sin este gate cumplido. Es el **gate absoluto** del runbook.

## Firma / Aprobación
Pendiente responsable DevOps/DB.
