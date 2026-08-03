# FASE 3 — Motor de Subastas (Core)

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** FASE 2

## Objetivo

Lógica central de pujas con validación server-side, transacciones atómicas Prisma, garantía de seriedad y cierre manual por el martillero.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 3.1 | Implementar validación de pujas en `auction-engine.ts` | ✅ |
| 3.2 | Transacciones Prisma para registro de pujas | ✅ |
| 3.3 | Validación de garantía (`BidderGuarantee.isPaid`) antes de cada puja | ✅ |
| 3.4 | Server Actions de pujas: `app/actions/bids.ts` | ✅ |
| 3.5 | UI: componente `BidControls.tsx` con incrementos flexibles | ✅ |
| 3.6 | Cierre manual del remate por MARTILLERO | ✅ |
| 3.7 | Componente `CloseAuction.tsx` | ✅ |
| 3.8 | Componente `WinnerIndicator.tsx` — postor ganador actual | ✅ |
| 3.9 | Página de sala de subasta: `app/remates/[id]/page.tsx` (actualizar) | ✅ |

## Archivos creados/modificados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/auction-engine.ts` | + placeBid(), closeAuction(), getBidsByAsset(), getWinningBid() |
| `src/app/actions/bids.ts` | Server Actions: placeBid, closeAuction, getBids, getWinner |
| `src/components/BidControls.tsx` | Controles de puja: +50k, +100k, +1M, campo libre |
| `src/components/CloseAuction.tsx` | Botón de cierre para MARTILLERO |
| `src/components/WinnerIndicator.tsx` | Muestra postor ganador actual |
| `src/app/remates/[id]/page.tsx` | Actualizado con sala de subasta completa |

## Criterio de aceptación

- [x] Puja validada exclusivamente server-side (prohibido validación en cliente)
- [x] Transacción atómica: INSERT Bid + UPDATE Asset.currentPrice
- [x] Sin garantía pagada → servidor rechaza la puja
- [x] Monto debe ser superior al `currentPrice` actual
- [x] Incremento mínimo configurable ($50.000 CLP)
- [x] UI permite: +50.000, +100.000, +1.000.000, campo libre
- [x] MARTILLERO puede cerrar el remate manualmente
- [x] Al cerrar: si hay pujas → ADJUDICADO, si no → DESIERTO
- [x] WinnerIndicator muestra ganador actual

## Flujo crítico de puja

```
1. POSTOR hace clic en "Pujar"
   ↓
2. Client Component envía Server Action placeBid()
   ↓
3. auction-engine.ts valida:
   a. Asset.status === ACTIVO
   b. User tiene BidderGuarantee.isPaid === true
   c. amount > Asset.currentPrice
   d. amount cumple incremento mínimo
   ↓
4. PRISMA TRANSACTION:
   - UPDATE previous winning Bid (isWinning = false)
   - INSERT Bid (amount, userId, assetId, isWinning = true)
   - UPDATE Asset (currentPrice = amount)
   ↓
5. Retornar nuevo precio al cliente
```

## Reglas de negocio

- **Incremento mínimo:** $50.000 CLP
- **Cierre manual:** solo MARTILLERO puede cerrar
- **Garantía:** requisito obligatorio para pujar
- **Transacciones:** atómicas para prevenir condiciones de carrera

## Notas de implementación

- `auction-engine.ts` es el archivo central de lógica de negocio
- Todas las validaciones son server-side, nunca en cliente
- `$transaction` de Prisma garantiza atomicidad
- Los incrementos rápidos son solo UI — la validación final es en servidor
- El cierre actualiza isWinning del ganador anterior antes de crear nueva puja
