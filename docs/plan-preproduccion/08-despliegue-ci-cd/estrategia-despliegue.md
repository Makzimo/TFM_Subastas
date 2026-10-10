# Estrategia de Despliegue

## Recomendación
**Blue-Green + Health Checks + Rollback inmediato.** Para **sala de remate (tiempo real)** priorizar **zero-downtime + rollback rápido**.

| Estrategia | Zero-Downtime | Rollback Velocidad | Complejidad | Recomendado |
|---|---|---|---|---|
| **Blue-Green** | Sí | **Muy Rápido** (switch tráfico) | Media | **Recomendado** |
| **Rolling** | Sí | Rápido (retroceder réplicas) | Media | Recomendado |
| **Canary** | Sí | Rápido | Media-Alta | Opcional (rollout gradual) |
| **Recreate** | No | Variable | Baja | **NO** (downtime evitable) |

## Orden de Despliegue (DB-First Crítico)

**Orden OBLIGATORIO:**

1. **Backup DB Prod** (verificado restorable) → OK
2. **Aplicar Migraciones Prisma** en Prod (**DB-first**). Validadas Preprod (idénticas).
3. **Deploy Código** que depende de esas migraciones.
4. **Smoke Post-Deploy + Health Checks**
5. **Habilitar Feature Flags** (gradual)

> **Nunca** desplegar código que asume nuevo esquema antes de aplicar migraciones.

## Migraciones y Zero-Downtime
- **Aditivas preferidas** (forward-only). Compatible backward/forward si despliegue progresivo.
- **Destructivas:** Requieren ventana mantenimiento + justificación + estrategia segura (down-migrations o restore). Evitar si posible.
- **Columnas nuevas no obligatorias** primero, backfill, luego hacer NOT NULL en deploy posterior (estrategia expand/contract).

## Rollout Gradual (Canary) - Opcional
- 5-10% tráfico → validar métricas + smoke → 50% → 100%.
- Útil si cambios alto riesgo (sala remate). Activar criterios de rollback automáticos por alertas.

## Feature Flags Post-Deploy
- Habilitar gradualmente (kill switch listo). Separar lectura/escritura para control emergencia.

## Criterios de Éxito Deploy
- Health checks 200 sostenido (readiness).
- Sin spike 5xx P0 tras switch.
- Smoke crítico OK.
- Métricas estables 10-15 min mínimos antes considerar estable.

## Notas Infra
- Evitar cold starts impactantes en ventana crítica.
- Verificar conexiones DB tras deploy (pool warm).
- Asegurar rollback apunta a **build/artefacto + tag** anterior estable (`vX.Y.Z-1`).