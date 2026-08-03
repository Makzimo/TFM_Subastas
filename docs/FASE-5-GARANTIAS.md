# FASE 5 — Sistema de Garantías

> **Estado:** ✅ Completada (2026-07-18) — actualizada a modelo por lote (2026-08-01)
> **Dependencias:** FASE 1

## Objetivo

Gestión de garantías de seriedad para postores habilitados a pujar. La garantía es **1:1 por lote**: un postor debe presentar garantía pagada para el lote específico en el que quiere pujar.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 5.1 | Server Actions CRUD: `app/actions/guarantees.ts` | ✅ |
| 5.2 | Página postor: registrar garantía por lote `app/postor/garantia/page.tsx` | ✅ |
| 5.3 | Panel admin: ver y aprobar garantías por lote `app/admin/garantias/page.tsx` | ✅ |
| 5.4 | Integración con `auction-engine.ts` — verificación por lote antes de puja | ✅ |
| 5.5 | Restricción: sin garantía del lote → sin puja (server-side) | ✅ |
| 5.6 | Componente de estado de garantía en la sala `GuaranteePrompt.tsx` | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/app/actions/guarantees.ts` | Server Actions: create (por lote), getMy, getAll, updateStatus |
| `src/app/postor/garantia/page.tsx` | Página del postor: listado de sus garantías por lote |
| `src/app/admin/garantias/page.tsx` | Panel admin de garantías con lote asociado |
| `src/components/GuaranteePrompt.tsx` | Prompt en la sala: solicitar garantía / pendiente / pagada |
| `src/components/GuaranteeStatus.tsx` | Badge de estado de garantía |

## Criterio de aceptación

- [x] Postor puede solicitar garantía para un lote específico (desde la sala o `/postor/garantia`)
- [x] La solicitud queda `isPaid: false` hasta que el **admin la aprueba** (ya no hay auto-pago simulado)
- [x] Admin puede ver todas las garantías indicando a qué lote pertenecen
- [x] Admin puede aprobar/revocar garantías
- [x] Sin garantía **del lote** → auction-engine.ts rechaza la puja (validación dentro de la transacción)
- [x] Estado de garantía visible en la sala: ninguno (solicitar), pendiente (aviso ámbar), pagada (habilitado pujar)

## Flujo

```
1. POSTOR solicita garantía para el lote X → BidderGuarantee (userId, assetId: X, isPaid: false)
2. ADMINISTRATIVO aprueba la garantía → isPaid: true, approvedAt: now()
3. POSTOR intenta pujar en el lote X:
   a. auction-engine.ts verifica, DENTRO de la $transaction (junto al SELECT ... FOR UPDATE),
      que exista BidderGuarantee con { userId, assetId: X, isPaid: true }
   b. Si no existe → rechazar con error "No tiene garantía de seriedad pagada para este lote"
   c. Si existe → permitir puja
4. Admin puede revocar → isPaid: false (el postor deja de poder pujar en ese lote)
```

## Modelo de datos (cambios v0.12.0)

```prisma
model BidderGuarantee {
  id            String    @id @default(uuid())
  userId        String
  assetId       String?   // nullable para no romper garantías legacy
  isPaid        Boolean   @default(false)
  paymentDate   DateTime?
  amount        Decimal
  paymentMethod String?   // v0.12.1: VISA | MASTERCARD | WEBPAY | TRANSFERENCIA
  asset         Asset?    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  user          User      @relation(...)

  @@unique([userId, assetId])
  @@index([userId, isPaid])
}
```

## Notas de implementación

- **Checkout simulado (v0.12.1):** la sala muestra tarjetas de método de pago (Visa, Mastercard, Webpay, Transferencia) + botón "Pagar garantía de $500.000". El método elegido se persiste en `paymentMethod`; el pago es simulado — la solicitud queda `isPaid: false` y la aprueba el ADMINISTRATIVO
- **Validación 1:1 por lote (v0.12.0):** antes era una garantía global por usuario que habilitaba pujar en cualquier lote. Ahora cada puja exige la garantía del lote concreto; las garantías legacy (`assetId: null`) no habilitan pujar
- **Aprobación admin (v0.12.0):** se eliminó `payGuaranteeAction`; el pago simulado fue reemplazado por aprobación del ADMINISTRATIVO
- `createGuaranteeAction` es `useActionState` con `FormData`; recibe `assetId` y `paymentMethod` vía `<input>` (no `bind`)
- El chequeo de garantía está dentro de la transacción de puja para evitar carreras
- Monto de garantía: $500.000 CLP (configurable)
