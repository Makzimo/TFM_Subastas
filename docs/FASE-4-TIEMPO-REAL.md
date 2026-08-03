# FASE 4 — Tiempo Real (SSE + PostgreSQL LISTEN/NOTIFY)

> **Estado:** ✅ Completada (2026-07-18, actualizada 2026-08-01)
> **Dependencias:** FASE 3

## Objetivo

Actualizaciones de pujas en tiempo real para todos los conectados a la sala de subasta usando Server-Sent Events, con canal de broadcast via PostgreSQL LISTEN/NOTIFY para soporte multi-instancia.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 4.1 | Endpoint SSE: `app/api/sse/auctions/[id]/route.ts` | ✅ |
| 4.2 | Servidor de eventos centralizado: `lib/sse-server.ts` | ✅ |
| 4.3 | Componente `AuctionTimer.tsx` con countdown | ✅ |
| 4.4 | Componente `LiveBid.tsx` — precio actualizado en tiempo real | ✅ |
| 4.5 | Hook `hooks/useSSE.ts` — conexión SSE desde el cliente | ✅ |
| 4.6 | Integrar SSE en sala de subasta | ✅ |
| 4.7 | Canal de broadcast PostgreSQL LISTEN/NOTIFY: `lib/realtime.ts` | ✅ |
| 4.8 | Concurrencia de pujas con `SELECT ... FOR UPDATE` | ✅ |
| 4.9 | Eventos SSE enriquecidos (estado autoritativo) | ✅ |
| 4.10 | Re-sync de estado al reconectar | ✅ |

## Archivos creados/modificados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/realtime.ts` | **NUEVO** — Conexión dedicada pg.Client con LISTEN, publicación via pg_notify, instanceId para evitar double-delivery |
| `src/lib/sse-server.ts` | Refactorizado: singleton globalThis (registro de conexiones compartido entre module graphs de dev), fan-out local + publicación PostgreSQL, handler solo re-difunde eventos de otras instancias |
| `src/app/api/sse/auctions/[id]/route.ts` | force-dynamic, runtime nodejs, fix cancel() con closures |
| `src/types/realtime.ts` | **NUEVO** — Interfaces compartidas: LiveBidEventData, AuctionClosedEventData, ConnectedEventData |
| `src/lib/auction-engine.ts` | placeBid con FOR UPDATE, evento enriquecido; closeAuction con evento enriquecido |
| `src/hooks/useSSE.ts` | Reintentos ilimitados, callbacks via ref, onConnected para re-sync |
| `src/components/AuctionRoom.tsx` | Estado autoritativo local (price, bidCount, winner, status), re-sync on reconnect, onAuctionClosed |
| `src/components/BidHistoryLive.tsx` | Dedupe por id real del evento, addBid acepta LiveBidEventData, resetBids |
| `src/app/remates/[id]/page.tsx` | export const dynamic = "force-dynamic" |
| `src/app/remates/page.tsx` | export const dynamic = "force-dynamic" |
| `middleware.ts` | `/api/sse` agregado a publicPaths |

## Criterio de aceptación

- [x] Al pujar, todos los usuarios conectados ven el nuevo precio instantáneamente
- [x] Timer del remate funcional con countdown
- [x] Desconexión/reconexión estable (reintentos ilimitados con backoff cap 30s, re-sync de estado)
- [x] Sin polling innecesario
- [x] Múltiples pestañas/usuarios ven cambios sincronizados
- [x] Conexión SSE se cierra al abandonar la sala
- [x] Cierre del remate se refleja en tiempo real en todos los conectados
- [x] bidCount siempre muestra el total real de pujas (no el tamaño del historial local)
- [x] Re-sync de estado tras reconexión (recupera eventos perdidos durante desconexión)
- [x] 100+ postores simultáneos no producen pujas duplicadas sobre el mismo precio (FOR UPDATE)
- [x] Funciona en despliegue multi-instancia via PostgreSQL LISTEN/NOTIFY
- [x] Sala pública sin login: espectadores ven pujas en tiempo real sin autenticarse

## Arquitectura SSE (v2)

```
┌──────────────┐     GET /api/sse/auctions/[id]     ┌──────────────┐
│   Cliente    │ ◄────────────────────────────────── │   Servidor   │
│   (Browser)  │     Response Stream (text/event)     │   (Next.js)  │
└──────────────┘                                      └──────┬───────┘
       │                                                     │
       │  Server Action: placeBid()                          │  broadcastToAsset()
       └─────────────────────────────────────────────────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │  broadcastLocal()               │  pg_notify()
                   │  (fan-out a clientes locales)    │  (a PostgreSQL)
                   └─────────────────┬───────────────┘
                                     │
                              ┌──────┴──────┐
                              │ PostgreSQL  │
                              │ LISTEN/     │
                              │ NOTIFY      │
                              └──────┬──────┘
                                     │
                        ┌────────────┴────────────┐
                        │ Otras instancias        │
                        │ (fan-out a sus clientes) │
                        └─────────────────────────┘
```

## Concurrencia de pujas

Con 100+ postores simultáneos, dos usuarios pueden leer el mismo `currentPrice` en el mismo instante. Para evitar pujas duplicadas:

```sql
-- Dentro de $transaction:
SELECT id, status, "currentPrice"
FROM "Asset"
WHERE id = $1
FOR UPDATE;  -- Bloquea la fila hasta el commit
```

El `FOR UPDATE` serializa las pujas concurrentes a nivel de base de datos: si dos pujas intentan bloquear el mismo asset, la segunda espera a que la primera haga commit (o rollback) antes de leer el precio actualizado.

## Eventos SSE (v2)

| Evento | Data | Descripción |
|--------|------|-------------|
| `bid` | `{ assetId, eventId, bid: {id, amount, bidderName, bidderEmail, createdAt, userId}, currentPrice, bidCount, winnerId, winnerName }` | Nueva puja realizada + estado autoritativo completo |
| `auction-closed` | `{ assetId, eventId, status, winnerId, winnerName, bidderEmail, bidCount }` | Remate cerrado |
| `connected` | `{ clientId }` | Conexión establecida |

## Notas de implementación

- SSE es unidireccional (servidor → cliente), suficiente para este caso
- Cada conexión SSE se mantiene en un `ReadableStream` con keepalive cada 30s
- `broadcastLocal()` limpia conexiones muertas automáticamente
- PostgreSQL LISTEN/NOTIFY envía el payload después del COMMIT de la transacción transaccional — atomicidad garantizada
- `instanceId` (UUID por proceso) en cada payload evita double-delivery: la instancia emisora ignora sus propias notificaciones
- **`globalThis` singleton en `sse-server.ts`**: en Next.js dev (Turbopack), route handlers y Server Actions se compilan en module graphs separados → el módulo `sse-server.ts` se evalúa dos veces con variables de módulo independientes (un `Map` vacío en la instancia de las actions). El registro de conexiones (`assetConnections`, `clientCounter`, `listenerStarted`) vive en `globalThis` para que todas las instancias operen sobre el mismo estado. Mismo patrón que `prisma.ts`
- El listener reconnecta automáticamente si pierde la conexión a PostgreSQL (3s delay)
- En reconexión del EventSource, `AuctionRoom` ejecuta un re-sync via server actions para recuperar el estado autoritativo (precio, contador, ganador, últimos 5 pujas)
- `pg_notify` tiene un límite de 8KB por payload; los eventos SSE son de ~200 bytes
- `X-Accel-Buffering: no` en los headers del SSE evita buffering en reverse proxies nginx
