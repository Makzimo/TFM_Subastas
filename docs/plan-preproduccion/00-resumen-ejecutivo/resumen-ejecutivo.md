# Resumen Ejecutivo

## Objetivo
Toma de decisión para el pase a Producción (Go/No-Go) de la plataforma de remates de vehículos y especies.

## Alcance de Lanzamiento
- **Módulos habilitados:** Subastas, Activos, Garantías (`BidderGuarantee`), Usuarios, Sala de Remate (`AuctionRoom`), Paneles por rol (`MARTILLERO`, `POSTOR`, `ADMINISTRATIVO`).
- **Funcionalidades críticas:** Puja flexible (+incrementos rápidos + valor libre), **Cierre Manual** por MARTILLERO, validación de garantía pagada (`isPaid: true`) antes de pujar, y actualización de precio en tiempo real.
- **Reglas de negocio:** Validación **SIEMPRE en servidor**, transacciones atómicas (`$transaction`), lógica centralizada en `lib/auction-engine.ts`, y serialización RSC obligatoria (`lib/serialize.ts`).

## Riesgos Críticos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Bypass cliente en validación de pujas | Crítico | Validación exclusiva/obligatoria en servidor. Nunca confiar en cliente. |
| Bypass/verificación de garantía | Crítico | Comprobar `BidderGuarantee.isPaid: true` **antes de cada intento** de puja, dentro de transacción. |
| Race conditions (doble puja) | Crítico | `$transaction` + condiciones de estado/monto + fuente única de verdad (`auction-engine.ts`). |
| Serialización RSC incorrecta | Alto | Uso obligatorio `serializeAsset/serializeBid/s/serializeGuarantee`. Verificar fronteras Server→Client y `data:` de Server Actions. |
| Migraciones DB incorrectas | Alto | Migraciones validadas en Preprod, backup antes de Prod, preferir aditivas. |
| Exposición de secretos | Crítico | No versionar `.env`, rotación, validación arranque. |

## Bloqueantes Potenciales
- Migraciones Prisma pendientes o no validadas.
- `pnpm check` / `pnpm test` / `pnpm build` con errores.
- `pnpm audit --audit-level=high` con CVEs High/Critical.
- Falta de verificación de consumidores tras cambios.
- Backup/restauración no verificado.
- Plan de rollback no probado (dry-run).

## Estrategia de Mitigación
- **Cumplimiento AGENTS.md:** Análisis de impacto obligatorio (§5), checklist completo tras todo cambio (§5).
- **Calidad:** `pnpm check` (tsc --noEmit + eslint src/), `pnpm test`, `pnpm build` como gates bloqueantes.
- **Seguridad:** Auditoría dependencias, hardening, RBAC estricto, rate limiting.
- **Validación funcional:** Smoke tests por rutas afectadas **Y TODOS sus consumidores**.
- **DB segura:** Backup obligatorio + validación migraciones idénticas Preprod→Prod.
- **Reversibilidad:** Rollback probado (dry-run) + kill switch para pujas.

## Recomendación
Solo proceder a Producción si **TODOS** los criterios Go/No-Go se encuentran en estado `OK` y el **dry-run de rollback** fue exitoso. Cualquier desviación debe estar justificada, aprobada y registrada.