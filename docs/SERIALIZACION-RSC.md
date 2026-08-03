# Serialización RSC — Objetos planos obligatorios

> **Estado:** ✅ Activo (v0.12.2)
> **Regla normativa:** `AGENTS.md` §3 (Serialización RSC) y §5 (Análisis de Impacto Obligatorio).

## Problema que resuelve

Next.js 16 (React 19) solo permite pasar **objetos planos** de Server Components a Client Components y como `data:` de server actions hacia el cliente. Las instancias de clase de Prisma (`Decimal`) NO son objetos planos y rompen el render (error "Only plain objects can be passed to Client Components") o fallan en silencio dentro de `try/catch` (botón "Cerrar Remate", resincronización de la sala).

## Regla

> Ninguna Server Action ni prop de Server Component a Client Component puede transportar objetos Prisma crudos. `Decimal` y `Date` NO cruzan el borde RSC.

## Cómo se aplica

Toda salida hacia el cliente pasa por `src/lib/serialize.ts`:

| Función | Convierte | Devuelve |
|---------|-----------|----------|
| `serializeAsset` | `Decimal → number`, `Date → ISO` | `SerializedAsset` |
| `serializeBid` / `serializeBids` | idem | `SerializedBid[]` |
| `serializeGuarantee` | idem | `SerializedGuarantee` |
| `toNumber` / `toISO` | helpers | number / string |

Casos verificados en v0.12.2:
- Props Server→Client: `EditAssetForm` (admin + martillero), `GuaranteeClient`, `AuctionRoom` (initialBids).
- `data:` de server actions: `getAssetByIdAction`, `getLatestBidsAction`, `placeBidAction`, `closeAuctionAction`, `updateAssetAction`, `changeAssetStatusAction`, `approveAssetAction`, `rejectAssetAction`, `createGuaranteeAction`, `updateGuaranteeStatusAction`, `getMyGuaranteesAction`.

## Análisis de impacto (antes de tocar algo)

1. Grep de **todos** los consumidores del archivo a modificar.
2. Si se usa desde N páginas, revisar cada una (ej. `EditAssetForm` → `/admin/activos/[id]` y `/martillero/activos/[id]`).
3. Verificar fronteras RSC: props y `data:` planos.

## Checklist de verificación (tras todo cambio)

1. `pnpm check` (tsc + eslint)
2. `pnpm test` (regresión de serialización)
3. `pnpm build`
4. Smoke test de rutas afectadas **y sus consumidores** (autenticado: login + GET de cada ruta).

## Ejemplo de test de regresión

```ts
// src/lib/serialize.test.ts — verifica salida 100% plana
assert.equal(bid.amount, 1000000);
assert.equal(typeof bid.createdAt, "string");
assert.doesNotThrow(() => JSON.stringify(bid));
```
