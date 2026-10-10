# Integridad y Transacciones

## Principios (Obligatorios - AGENTS.md §7)
- **Transacciones atómicas obligatorias:** Registrar puja + verificar validez estado remate **dentro de `$transaction`** (Prisma).
- **Fuente única de verdad:** Lógica de incremento/comparación **únicamente** en `lib/auction-engine.ts`.
- **Validación SIEMPRE en servidor.** Prohibido confiar cliente.
- **Garantía de seriedad:** `BidderGuarantee.isPaid: true` **antes de cada intento** de puja (dentro TX).

## Reglas de Negocio Críticas
| Regla | Aplicación | Verificación |
|---|---|---|
| Cierre Manual | Solo `MARTILLERO`. Idempotente. Auditado. | Integration (doble cierre → bloqueado). |
| Estado subasta/lote | Transiciones válidas únicamente. Estado debe permitir puja. | Integration (transición inválida → rechazada). |
| Monto puja | > precio actual (según `auction-engine.ts`). Incremento válido. Valor libre validado servidor. | Unit + Integration. |
| Garantía | Pre-check + validación TX (consistencia). | Integration. |
| Atomicidad | Fallo intermedio → **rollback automático**. Estado consistente. | Integration (simular fallo). |

## Prevención Race Conditions
- Usar **condiciones en WHERE** dentro TX (ej. estado esperado, precio/versión si aplica) + comparar contra último precio leído atómicamente.
- **Lectura + escritura atómica**: leer estado actual + validar + escribir en misma transacción.
- Reintentar con lectura fresca + mensaje de "precio actualizado" (UX seguro) vs rechazar (según diseño). Documentar estrategia.
- Evitar read-modify-write fuera de `$transaction`.

## Serialización RSC (Crítico - AGENTS.md §3)
- **Prohibido** objetos Prisma crudos cruzando borde RSC (Server Component → Client Component).
- **Obligatorio** `lib/serialize.ts`: `serializeAsset`, `serializeBid/s`, `serializeGuarantee`.
- Convierte `Decimal → number`, `Date → ISO string`.
- **Server Actions (`data:`):** Debe retornar objetos planos serializados hacia cliente.
- **Verificación obligatoria** en contratos Server→Client. Cualquier cambio de contrato requiere análisis consumidores.

## Checklist Integridad
- [ ] Pujas envueltas en `try/catch` + TX obligatoria.
- [ ] Validaciones centralizadas `auction-engine.ts` (sin duplicar lógica).
- [ ] Race condition testeado (2 pujas simultáneas) → 1 válida, 2ª rechazada con motivo claro.
- [ ] Doble cierre manual → rechazado (idempotente seguro).
- [ ] Garantía pagada verificada TX (no solo pre-check).
- [ ] Serialización verificada en fronteras afectadas.
- [ ] Rollback TX verificado (fallo simulado).