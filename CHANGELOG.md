# Changelog

Todos los cambios notables de este proyecto se documentarán aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Regla de orden:** Las versiones se listan en **orden cronológico inverso** (la más nueva siempre arriba). Al agregar una nueva versión, insertarla **después del encabezado y antes de la versión anterior**.



## [0.16.2] - 2026-10-12

### Added
- **Incidencia de primer despliegue** (`docs/incidencias/2026-10-12-first-deploy-db-empty.md`) — BD vacía en producción (`P2021 TableDoesNotExist`), obstáculo de variables *Sensitive* en Vercel y bug de Prisma Console (SSO), y la solución adoptada (migración + seed desde el Build Command de Vercel)

### Fixed
- **Sesión válida rechazada por el middleware** (`middleware.ts`) — `getToken()` se resolvía con `process.env.NEXTAUTH_SECRET`, pero NextAuth v5 crea la sesión con **`AUTH_SECRET`**. Cuando ambas variables no coinciden, el login **creaba la sesión correctamente** (`/api/auth/session` devolvía el usuario) pero el middleware la rechazaba y redirigía a `/login?callbackUrl=...`, dando la impresión de que "no pasaba nada" al iniciar sesión. Ahora se resuelve con `AUTH_SECRET ?? NEXTAUTH_SECRET`. Diagnóstico verificado con navegador real (Playwright)
- **Login en producción sin retroalimentación** (`src/app/(auth)/login/page.tsx`) — `handleSubmit` no estaba envuelto en `try/catch`: si `signIn` rechazaba, la promesa se tragaba, `isPending` quedaba en `true` y **no se mostraba ningún mensaje** (botón sin cambio, sin error, sin redirección). Ahora se captura la excepción, se restaura el estado en `finally` y se muestra el error real. Además se reemplazó `router.push("/dashboard")` por `window.location.assign(...)` para que la cookie recién creada viaje al servidor y el middleware no redirija de vuelta a `/login` (carrera de cookie)
- **`.gitignore`**: la línea `.env*` agregada por `vercel link` anulaba el negativo `!.env.example` (la última regla que coincide gana), lo que podía dejar de trackear esa plantilla. Se reemplazó por `.vercel/`; `.env.*` sigue cubriendo los archivos con secretos (`.env.production.local`, `.env.prod`)

### Changed
- **Primer despliegue a producción** en Vercel + Prisma Postgres (`https://tfm-subastas.vercel.app`), con `GET /api/health` en verde. Migración `20261010183233_init` y seed de usuarios aplicados vía Build Command (temporal). Pendiente: revertir el Build Command a su valor por defecto

## [0.16.1] - 2026-10-10

### Added
- **Guía de despliegue en Vercel** (`docs/plan-preproduccion/09-lanzamiento-operaciones/guia-deploy-vercel.md`) — Pasos 0-8 para el primer lanzamiento a producción (GitHub, DB Neon, variables de entorno, migraciones, seed, health/smoke, monitoreo, rollback)
- **`db:migrate:deploy`** en `package.json` (`prisma migrate deploy`) — migraciones en entornos productivos
- Incidencias documentadas: `docs/incidencias/2026-10-10-paso3-backup-prod.md` y `docs/incidencias/2026-10-10-uploads-vercel.md`

### Changed
- `package.json`: `build` ahora es `prisma generate && next build` y se agrega `postinstall: prisma generate` (necesario para Vercel)
- `.env.example`: documentadas todas las variables requeridas (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `NEXTAUTH_*`, seed)

### Fixed
- **Bloqueante de producción identificado (subida de imágenes en Vercel)** — `/api/uploads` escribe en `public/uploads`; el filesystem de Vercel es de solo lectura. Documentado en `docs/incidencias/2026-10-10-uploads-vercel.md` (pendiente de decisión: Vercel Blob)

## [0.16.0] - 2026-10-10

### Added
- **Endpoint `GET /api/health`** (`src/app/api/health/route.ts`) — Healthcheck combinado (app + ping a la DB con `SELECT 1`). Responde `200` con `{ status, version, checks:{db}, latencyMs, ts }` o `503` si la DB falla. `force-dynamic` (sin cache), `runtime = "nodejs"`. No expone detalles internos (el error solo se registra en logs del servidor). Requerido por el runbook de lanzamiento (Paso 7) y el monitoreo/alertas
- **`/api/health` en `publicPaths`** de `middleware.ts` — el healthcheck es accesible sin sesión (antes el matcher lo redirigía a `/login`)

### Security
- **Parche de vulnerabilidad SSRF en Next.js** — `next` 16.3.6 → **16.4.0** (mínimo parcheado `>=16.3.8`). Corrige GHSA-cjq9-62q9-8jv4 (*Server-Side Request Forgery en Image Optimization*). Este HIGH era de **runtime de producción**, por lo que invalidaba la excepción SCA anterior (que asumía solo dev tooling). Tras el parche, `pnpm audit --audit-level=high` queda sin HIGH de runtime (solo 3 HIGH de dev tooling: `prisma` CLI y `eslint-config-next`)

### Changed
- **Consolidación del rediseño UI (dark theme estilo Consensys)** — Layouts por rol (`admin/`, `martillero/`, `postor/`, `remates/`, `(public)/`), nuevos componentes `AdminSidebar`, `MartilleroSidebar`, `PostorNav`, `Footer` y primitivos de UI (`PageHeader`, `StatCard`, `DataTable`, `Skeleton`). Estados de carga (`loading.tsx`) por sección
- `package.json`: versión `0.1.0` → `0.16.0` (alineada con SemVer/CHANGELOG)

### Docs
- **Plan de preproducción** completo en `docs/plan-preproduccion/` (11 áreas + anexos) y registro de incidencias en `docs/incidencias/`
- `AGENTS.md` actualizado (regla de serialización RSC + análisis de impacto obligatorio)

## [0.15.5] - 2026-09-24

### Fixed
- **Postor ahora usa el Navbar principal Consensys** — `src/app/postor/layout.tsx` reemplazado `PostorDesktopNav` por el componente `Navbar` principal. El postor ahora tiene el mismo pill container, CTA con icono circular y transiciones que admin/martillero
- **Postor dashboard con dark theme** — Eliminados `bg-white` hardcodeados en tarjetas de garantía, empty states y historial de pujas. Reemplazados por `bg-neutral-900/50 border-neutral-800`. Links de color `text-orange-600` → `text-orange-400` para mejor contraste en dark theme

### Changed
- **`src/app/postor/layout.tsx`** — Usa `Navbar` en lugar de `PostorDesktopNav`, mantiene `PostorNav` (bottom mobile nav) como complemento
- **`src/app/postor/dashboard/page.tsx`** — Cards, empty states y bid items con colores dark theme consistentes


## [0.15.4] - 2026-09-24

### Changed
- **Navbar refinado visualmente para coincidir exactamente con Consensys.io** — Nuevo pill container (`borderRadius: 32px`, `border: 1px solid rgba(255,255,255,0.1)`, `padding: 4px`) que envuelve logo + nav links como grupo unificado. CTA con icono circular (48x48 `bg-[#121212]` dentro de pill `bg-[#1d1d1d]`). Transiciones cubic-bezier: `0.16,1,0.3,1` (650ms) para menú items, `0.455,0.03,0.515,0.955` (400ms) para CTA icon. Typography: `text-sm tracking-[0.28px]`


## [0.15.3] - 2026-09-24

### Changed
- **Navbar refinado estilo Consensys.io** — Botones de menú con border-radius: 24px (pill shape), fondo transparente por defecto. CTA dark gray rgb(29,29,29) con border-radius: 32px. Header transparente sobre el contenido. Logo 48x48 circular. Font size 13.3333px para items de menú. Dropdown panel con bg #1d1d1d y bordes white/10


## [0.15.2] - 2026-09-24

### Changed
- **Navbar refactorizado estilo Consensys.io** — Layout reestructurado: logo circular naranja (48px) a la izquierda, nav links como dropdown triggers con chevron, CTA "Log in/Salir" con ícono de flecha derecha. Fondo sólido negro (eliminado glassmorphism). Menú móvil con 3 líneas hamburger (animación X al abrir). Dropdown panels con descripciones y flecha de hover

### Fixed
- **Loading states dark theme** — Skeletons y loading pages actualizados de `bg-gray-200` (light) a `bg-neutral-800` (dark)

## [0.15.1] - 2026-09-24

### Fixed
- **Loading states dark theme** — Skeletons y loading pages actualizados de `bg-gray-200` (light) a `bg-neutral-800` (dark). Skeleton containers ahora usan `border-neutral-800 bg-neutral-900/50` para consistencia con el resto de la UI

### Changed
- **`src/components/ui/skeleton.tsx`** — Skeleton base `bg-neutral-800`, contenedores `border-neutral-800 bg-neutral-900/50`
- **`src/app/remates/loading.tsx`** — Pulse bars `bg-neutral-800`
- **`src/app/admin/dashboard/loading.tsx`** — Pulse bars `bg-neutral-800`
- **`src/app/postor/dashboard/loading.tsx`** — Pulse bars `bg-neutral-800`
- **`src/app/martillero/dashboard/loading.tsx`** — Pulse bars `bg-neutral-800`

## [0.12.3] - 2026-08-03

### Fixed
- **Warning de consola "An async function with useActionState was called outside of a transition"** — `BidControls` llamaba `formAction(fd)` de forma imperativa (desde `useEffect` de la cuenta regresiva y desde el clic en "Confirmar"), con lo que `isPending` no se actualizaba. Ahora la llamada se envuelve en `startTransition`
- **Botón Aprobar/Revocar en Garantías de Seriedad (admin)** — `GuaranteeItem` no refrescaba el Server Component tras aprobar/revocar: la DB se actualizaba pero el badge y el botón quedaban congelados hasta recargar la página. Ahora, tras una acción exitosa, se ejecuta `router.refresh()` para re-renderizar la tarjeta con el estado real

## [0.12.2] - 2026-08-03

### Fixed
- **Borde RSC: objetos Prisma crudos rompían componentes cliente** — `Decimal`/`Date` cruzaban props Server→Client y `data:` de server actions, provocando "Only plain objects can be passed to Client Components" (páginas de edición de lote) y fallos silenciosos en: **Cerrar remate** (admin y martillero), resincronización de la sala (`AuctionRoom.syncState`), puja, aprobación/rechazo de lotes, activación de remate y garantías del postor
- **Botón "Cerrar Remate"** — `closeAuctionAction` devolvía el `Asset` crudo con `Decimal`; el update en DB se ejecutaba pero la serialización fallaba antes de llegar al cliente y `router.refresh()` no corría, dejando la UI congelada en "Activo"
- **`/postor/garantia`** — fallaba al recibir `Decimal` en `amount` de cada garantía

### Added
- **`lib/serialize.ts`** — `serializeAsset`, `serializeBid/s`, `serializeGuarantee` (y `toNumber`/`toISO`): convierten `Decimal → number` y `Date → ISO string`. **Obligatorio** para toda salida hacia el cliente
- **Test de regresión** — `src/lib/serialize.test.ts` (`node:test` + `tsx --test`, 8 casos): verifica que la salida es 100% plana y JSON-serializable. Script `pnpm test`
- **Script `pnpm check`** — `tsc --noEmit` + `eslint src/` en un comando
- **Regla TAJANTE en `AGENTS.md`** — Análisis de impacto obligatorio antes de modificar cualquier componente/página/acción (mapear consumidores, verificar fronteras RSC) y checklist de verificación tras cada cambio (`pnpm check`, `pnpm test`, `pnpm build` + smoke test de rutas afectadas y sus consumidores)

### Changed
- `getAssetByIdAction`, `getLatestBidsAction`, `placeBidAction`, `closeAuctionAction`, `updateAssetAction`, `changeAssetStatusAction`, `approveAssetAction`, `rejectAssetAction`, `createGuaranteeAction`, `updateGuaranteeStatusAction`, `getMyGuaranteesAction` ahora serializan su salida
- `EditAssetForm` recibe `SerializedAsset` en lugar del tipo Prisma generado
- `AuctionRoom` y `/remates/[id]` adaptan el mapeo de pujas al shape plano (user/createdAt)

## [0.12.1] - 2026-08-03

### Added
- **Checkout simulado de garantía** — El prompt de garantía en la sala ahora muestra tarjetas seleccionables de método de pago (Visa, Mastercard, Webpay, Transferencia bancaria) y un botón **"Pagar garantía de $500.000"**. El método elegido se persiste en `BidderGuarantee.paymentMethod` y se muestra en el panel admin y en el listado del postor
- **`lib/payment-methods.ts`** — Constantes compartidas de métodos de pago (valores, labels y helper `getPaymentMethodLabel`)

### Changed
- `createGuaranteeAction` valida el `paymentMethod` del FormData contra la lista permitida antes de crear la garantía
- Mensaje de éxito de la solicitud indica el método de pago elegido

### Notes
- El "pago" sigue siendo una simulación: la solicitud queda `isPaid: false` pendiente de la aprobación del administrador (regla de negocio intacta)

## [0.12.0] - 2026-08-01

### Added
- **Selector de martillero al crear lote (admin)** — El formulario de creación de lotes del administrador (`/admin/activos/nuevo`) ahora incluye un `<select>` para asignar el martillero dueño del lote. Al crear, `createAssetAction` valida que el id pertenezca a un usuario `MARTILLERO` real y lo usa; si quien crea es un martillero, se le asigna a sí mismo (comportamiento previo). El formulario de edición (`/admin/activos/[id]`) también permite al admin reasignar el martillero
- **Redirect tras crear lote** — `createAssetAction` ahora redirige al listado correspondiente después de crear (`/admin/activos` para admin, `/martillero/activos` para martillero) en lugar de quedarse con el formulario lleno. Aplica también a la página de creación del martillero (comparte la misma action)
- **Gestión de usuarios (admin)** — Nueva sección `/admin/usuarios`: listado de todos los usuarios con filtro por rol, cambio de rol (POSTOR/MARTILLERO/ADMINISTRATIVO), activar/desactivar cuentas, creación de usuarios de cualquier rol (`/admin/usuarios/nuevo`) y restablecimiento de contraseña. Protegida contra auto-lockout (no se puede cambiar el propio rol ni desactivarse a sí mismo)
- **Campo `isActive` en `User`** — Permite desactivar cuentas. El login (`authorize`), las server actions (`getActiveUser`) y las pujas bloquean a los usuarios inactivos
- **Garantía de seriedad 1:1 por lote** — `BidderGuarantee` ahora se liga a un lote (`assetId` + `@@unique([userId, assetId])`). `placeBid` valida dentro de la transacción que el postor tenga garantía pagada **para ese lote específico**
- **Solicitud de garantía por lote aprobada por admin** — En la sala, el postor solicita la garantía para el lote (`createGuaranteeAction(assetId)`) y el administrador la aprueba/revoca desde `/admin/garantias` (ahora muestra el lote asociado). Se eliminó el auto-pago simulado (`payGuaranteeAction`)
- **Auditoría de usuarios** — Nuevos eventos `USER_CREATED`, `USER_ROLE_CHANGED`, `USER_ACTIVATED`, `USER_DEACTIVATED`, `PASSWORD_RESET` en `AuditLog`
- **Seed actualizado** — La garantía del postor se crea ligada al lote sembrado (Toyota Hilux) y se agrega un segundo postor sin garantía para demostrar el bloqueo

### Changed
- **`getActiveUser` (nuevo helper en `lib/current-user.ts`)** — Reemplaza los chequeos de sesión dispersos: valida autenticación, `isActive` (consultando la DB, no el JWT) y roles permitidos. Usado en assets, users, bids y guarantees
- **`getAssetParticipantsAction`** — Los "usuarios con garantía" ahora se calculan por lote (`where: { isPaid: true, assetId }`)
- **Página del postor `/postor/garantia`** — Muestra todas las garantías del postor por lote con su estado (aprobada/en revisión) y enlace al lote

### Fixed
- **Postores pujaban sin garantía del lote** — Con el modelo global anterior, una sola garantía pagada habilitaba pujar en todos los remates activos. Ahora la validación es estricta por lote dentro de la transacción (junto al `FOR UPDATE`)
- **Garantías globales existentes** — Se conservan en la migración con `assetId: null` (no habilitan pujar); los postores deben presentar garantía por cada lote

### Security
- **Cuentas desactivadas** — Un usuario desactivado no puede iniciar sesión ni ejecutar server actions (incluido pujar), incluso si mantiene una sesión JWT activa

## [0.11.0] - 2026-08-01

### Added
- **Tipos compartidos de eventos realtime** — `src/types/realtime.ts`: interfaces `LiveBidEventData`, `AuctionClosedEventData` y `ConnectedEventData` que definen el contrato entre servidor y cliente para los eventos SSE

### Changed
- **SSE pub/sub via PostgreSQL LISTEN/NOTIFY** — Nuevo módulo `src/lib/realtime.ts` que gestiona una conexión dedicada `pg.Client` con `LISTEN auction_events` y publicación via `pg_notify`. El canal de broadcast ya no depende exclusivamente del Map en memoria por proceso; cada instancia se suscribe al canal de PostgreSQL y re-difunde los eventos a sus clientes locales. Esto permite despliegues multi-instancia/load balancing sin perder eventos. El `instanceId` incluido en cada payload evita el double-delivery
- **sse-server refactorizado** — `broadcastToAsset` ahora hace fan-out inmediato a clientes locales + publica al canal PostgreSQL. Una conexión entrante activa el listener (lazy init, idempotente). El handler del listener solo re-difunde eventos de **otras instancias**, evitando duplicados en proceso único
- **Eventos SSE enriquecidos** — El evento `bid` ahora envía `{ eventId, bid: { id, amount, bidderName, bidderEmail, createdAt, userId }, currentPrice, bidCount, winnerId, winnerName }` (estado autoritativo completo, no solo monto). El evento `auction-closed` ahora incluye `{ status, winnerId, winnerName, bidderEmail, bidCount }`
- **`useSSE` reescrito** — Reintentos ilimitados con backoff exponencial (cap 30s). Los callbacks se refieren via `useRef` para evitar reconexiones espurias en cada re-render. Expone `onConnected` para sincronización post-reconexión
- **Páginas con `force-dynamic`** — `/remates`, `/remates/[id]` y el route handler SSE ahora declaran `export const dynamic = "force-dynamic"` para asegurar precio inicial siempre fresco
- **Route handler SSE** — Agregados `runtime = "nodejs"` y `X-Accel-Buffering: no` (compatibilidad nginx/reverse proxy)

### Fixed
- **Causa raíz: broadcasts SSE nunca llegaban (duplicación de módulos en dev)** — `src/lib/sse-server.ts` mantenía el registro de conexiones (`assetConnections`, `clientCounter`, `listenerStarted`) como variables a nivel de módulo. En Next.js dev (Turbopack), route handlers y Server Actions se compilan en "module graphs" separados, creando **dos instancias del módulo**: los clientes SSE se registraban en la instancia del route handler, pero `broadcastToAsset` (invocado desde la server action de puja) operaba sobre la instancia de las actions con un `Map` vacío → ningún cliente recibía eventos. Verificado empíricamente: los logs mostraban `addClient mod=466a1988` y `broadcast mod=329ba922` (instancias distintas). Solución: **singleton a nivel de proceso via `globalThis`** (mismo patrón que `src/lib/prisma.ts`), para que todas las instancias del módulo compartan el mismo registro de conexiones. Tras el fix, `broadcastLocal` entrega a los clientes sin importar desde qué instancia se invoque
- **`cancel()` del ReadableStream nunca limpiaba conexiones** — El spec del Stream define `cancel(reason)` (recibe la razón de cancelación, NO el controller). El código anterior asignaba el parámetro a `controller`, por lo que `client.controller._clientId`, `_assetId` y `_keepAlive` eran `undefined` al cancelar → `removeClient` nunca se ejecutaba → fuga de conexiones y de intervalos `setInterval` con cada reconexión/refresh. Solucionado con closures que capturan el `clientId` y el `keepAlive` en el scope del `GET`
- **Cierre de remate no se reflejaba en tiempo real** — `onAuctionClosed` en `AuctionRoom` era un no-op; los banners ADJUDICADO/DESIERTO dependían de la prop `status` del Server Component (nunca se actualizaba client-side). Ahora el callback actualiza `auctionStatus`, `winner` y `bidCount` en estado local
- **`bidCount` incorrecto** — Se mostraba `bids.length` (máximo 5 items del historial local) en lugar del total real de pujas. Ahora el `bidCount` viene del servidor en cada evento SSE y se actualiza independientemente del historial
- **Sin reconciliación de estado** — Al reconectar después de un drop, el cliente se quedaba con el estado local que podía haber perdido eventos. Ahora `AuctionRoom.handleConnected` ejecuta un re-sync via server actions (`getAssetByIdAction` + `getLatestBidsAction`) para reconciliar precio, contador, ganador y últimos 5 pujas
- **Middleware bloqueaba `/api/sse` sin sesión** — La sala `/remates/[id]` es pública, pero `/api/sse` no estaba en `publicPaths` y el matcher lo capturaba. Visitantes sin sesión recibían un redirect 307 y el EventSource fallaba silenciosamente. Ahora `/api/sse` está en `publicPaths`

### Security
- **Race condition en validación de pujas (con 100+ postores)** — La validación de precio (`amount > currentPrice`) y mínimo de incremento ocurrían **fuera** de la transacción SQL, leyendo un `Asset` sin lock. Con 100+ postores simultáneos, dos podían leer el mismo precio y ambos pasar la validación → pujas duplicadas sobre el mismo precio. Ahora se ejecuta `SELECT ... FOR UPDATE` sobre el asset **dentro** de la transacción, serializando las pujas concurrentes a nivel de base de datos
- **Instalación de `@types/pg`** — Agregado como devDependency para tipado estricto del módulo PostgreSQL del listener

## [0.10.14] - 2026-07-23

### Changed
- **Terminología UI: "activo(s)" → "lote(s)"** — Se reemplazó la palabra "activo" por "lote" en toda la interfaz de usuario para referirse a los items/subastas. "Activo" es un término contable que no se ajusta al contexto de una plataforma de remates de vehículos y especies. "Lote" es el término estándar en subastas (61 ocurrencias en 24 archivos)
- **Navbar labels** — Admin: "Activos" → "Lotes", Martillero: "Mis Activos" → "Mis Lotes", "Nuevo Activo" → "Nuevo Lote"
- **Dashboard admin** — "Activos Recientes" → "Lotes Recientes", empty state text
- **Dashboard martillero** — "Mis Activos" → "Mis Lotes", "Activos Activos" → "Lotes Activos"
- **Páginas admin** — Títulos, headings, breadcrumbs, botones, empty states, success messages, error messages
- **Páginas martillero** — Títulos, headings, breadcrumbs, botones, empty states, success messages, error messages
- **Componentes** — `DeleteAssetButton`: "Eliminar Activo" → "Eliminar Lote", `CloseAuction`: "el activo se adjudicará" → "el lote se adjudicará", `ActivateAuctionButton`: "aprobar el activo" → "aprobar el lote"
- **Server Actions y lib** — Todos los mensajes de error y labels de auditoría: "Activo creado/actualizado/eliminado/encontrado" → "Lote"
- **Audit labels** — "Activo creado/actualizado/eliminado" → "Lote creado/actualizado/eliminado"

### Not Changed (intentionally)
- Rutas `/admin/activos`, `/martillero/activos` (estructura de URLs)
- Enums `ACTIVO`, `"ACTIVO"` en código TypeScript
- Funciones `AdminActivosPage`, `NuevoActivoPage`, etc.
- "Activo" como adjetivo de estado ("El remate está activo", "Remates Activos")
- `STATUS_LABELS` mapping `ACTIVO: "Activo"` (label de estado, no sustantivo)
- CHANGELOG entries (historial)

### Fixed
- **Menú hamburguesa no funciona en iOS** — Reescritura del menú móvil en `Navbar.tsx`. El backdrop y dropdown ahora se renderizan **fuera del `<nav>`** como hermanos directos, escapando del stacking context (`z-50`) que el nav creaba y que causaba que el backdrop (`fixed inset-0`) quedara por encima del dropdown en iOS Safari. Backdrop subido a `z-[100]` y dropdown a `z-[110]` para forzar la superposición correcta. Scroll lock simplificado: se usa solo `overflow: hidden` en `<body>` (sin `position: fixed` en `<html>` ni guardado de scroll position) para evitar que iOS cancele gestos táctiles durante cambios de estilo. Agregado `onTouchEnd` al botón hamburguesa como safety net para iOS Safari que puede no disparar `onClick`. Agregados `role="button"` y `tabIndex={0}` para accesibilidad en dispositivos móviles
- **Cross-origin bloqueaba iPhone en desarrollo** — Next.js bloquea conexiones cross-origin al dev server por seguridad. El iPhone accedía vía `192.168.0.143` y no recibía actualizaciones de JavaScript (HMR), quedándose con código cacheado. `allowedDevOrigins` ahora es configurable via env var `ALLOWED_DEV_ORIGIN` en `next.config.ts`

### Security
- **Seed passwords hardcodeadas** — `prisma/seed.ts` ahora lee contraseñas desde variables de entorno (`SEED_ADMIN_PASSWORD`, `SEED_MARTILLERO_PASSWORD`, `SEED_POSTOR_PASSWORD`) con fallback a los valores por defecto. Los `console.log` ya no imprimen contraseñas en plaintext
- **Docker credentials configurables** — `docker-compose.yml` ahora usa `${VARIABLE:-default}` para `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`, permitiendo override en producción
- **`.gitignore` reforzado** — Ahora cubre todos los variants de `.env` (`.env.*`) con excepción explícita de `.env.example`
- **IP de desarrollo configurable** — `next.config.ts` lee `ALLOWED_DEV_ORIGIN` desde env var en lugar de tener la IP hardcodeada

## [0.10.13] - 2026-07-20

### Fixed
- **Página pública `/remates` rota por auth check** — `getAssetsAction` y `getAssetByIdAction` tenían `auth()` que impedía a usuarios no autenticados ver el listado de remates y el detalle de activos. Se removió el auth check de ambas acciones ya que alimentan páginas públicas. La seguridad de las páginas admin/martillero sigue cubierta por los auth checks en las Server Components (Capa 1)
- **Brechas de seguridad en páginas admin** — Todas las páginas Server Components bajo `/admin` no verificaban autenticación ni rol. Un usuario no autenticado podía acceder directamente a URLs como `/admin/activos` y ver datos sensibles (activos, pujas, participantes, audit logs). Ahora todas las páginas admin verifican `auth()` + `redirect("/login")` + `redirect("/dashboard")` si no es ADMINISTRATIVO
- **Server actions de lectura sin auth** — `getAssetsAction`, `getAssetsWithApprovalAction` y `getAssetByIdAction` no verificaban sesión. Ahora todas lanzan `"No autenticado"` si no hay sesión
- **Funciones de datos admin sin auth** — `getAdminStats()`, `getRecentAssets()` y `getAllLogs()` no tenían protección. Ahora verifican sesión + rol ADMINISTRATIVO antes de ejecutar queries
- **Página postor/garantia sin auth** — No verificaba sesión. Ahora redirige a login
- **Página martillero/activos sin redirect** — Llamaba `auth()` pero no redirigía si la sesión era null. Ahora redirige a login

### Changed
- **Defensa en profundidad (3 capas)** — Se implementó autenticación en todas las capas: (1) Server Components con `auth()` + redirect, (2) Server Actions con verificación de sesión, (3) Funciones de datos con verificación de sesión + rol
- Patrón estándar: `const session = await auth(); if (!session?.user) redirect("/login"); if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");`

### Security
- 13 archivos modificados para cerrar brechas de seguridad
- Todas las rutas protegidas ahora tienen verificación server-side independiente del middleware

## [0.10.12] - 2026-07-20

### Added
- **Administrador puede cerrar remates** — El ADMINISTRATIVO ahora puede cerrar cualquier remate activo desde la sala de subasta, sin importar qué martillero lo creó. Esto permite resolver situaciones donde el martillero tiene dificultades de conexión o no puede acceder a la plataforma

### Changed
- `auction-engine.ts`: `closeAuction()` ahora recibe `userId` + `userRole` en lugar de solo `martilleroId`. Si el rol es `ADMINISTRATIVO`, se salta la verificación de ownership. El `logAction` registra quién cerró y con qué rol (`closedBy`)
- `bids.ts`: `closeAuctionAction()` acepta roles `MARTILLERO` y `ADMINISTRATIVO`. Para martilleros sigue verificando ownership; para admin no
- `remates/[id]/page.tsx`: El panel de cierre ahora se muestra si el usuario es martillero dueño del activo **o** si es administrador. Título cambiado de "Control del martillero" a "Cerrar remate"

## [0.10.11] - 2026-07-20

### Fixed
- **Menú hamburguesa no funciona en móvil** — Reescritura completa del menú móvil en `Navbar.tsx`. Se reemplazó la animación CSS con `max-h`/`overflow-hidden` (que no funcionaba de forma consistente) por un enfoque de **backdrop overlay**: el dropdown se renderiza condicionalmente (`{mobileOpen && ...}`) con `bg-slate-900` explícito y se superpone al contenido con `position: absolute`. Se agrega un backdrop semitransparente (`bg-black/50`) que cierra el menú al tocar fuera. Se bloquea el scroll del body cuando el menú está abierto. Se cierra automáticamente al navegar a otra ruta

### Changed
- **Dashboard del martillero rediseñado** — Se eliminó la sección "Pujas Recientes" y se reemplazó con métricas más útiles
- **Stat cards ampliadas** de 3 a 5: Mis Activos, Activos Activos, Pujas Recibidas, Activos Últimos 6 Meses, Activos Último Mes
- **Nueva sección "Últimos Remates Adjudicados"** — Hasta 3 cards con imagen del vehículo, nombre del ganador, monto adjudicado, cantidad de pujas y fecha de cierre. Cada card es un link a la sala de remates
- **Nueva sección "Top 5 Adjudicadores"** — Lista rankeada con medalla de oro/plata/bronce, nombre del postor, cantidad de remates ganados y monto total adjudicado

### Added
- **Métricas temporales** en `getMartilleroStats`: `assetsLast6Months` y `assetsLastMonth` — conteo de activos creados en los últimos 6 meses y último mes respectivamente
- **Top 5 adjudicadores** — `top5Adjudicadores` usando `prisma.bid.groupBy` con `isWinning: true`, ordenado por monto total adjudicado descendente
- **Últimos 5 adjudicados** — `last5Adjudicated` con datos del ganador, monto, pujas totales y fecha de cierre

## [0.10.10] - 2026-07-18

### Fixed
- **Menú hamburguesa no aparece en móvil** — El dropdown del menú móvil no tenía color de fondo explícito, por lo que el contenido (links de login/registro) era invisible sobre el fondo blanco de la página. Agregado `bg-slate-900` al contenedor del dropdown y transición CSS con `max-h` + `opacity` para animación de apertura/cierre
- **Navbar dropdown móvil siempre renderizado** — Se cambió de renderizado condicional `{mobileOpen && (...)}` a un div siempre presente con `max-h-0 opacity-0` cuando cerrado, evitando problemas de hidratación y asegurando transiciones suaves

### Added
- **Eliminar activo (Admin)** — Botón "Eliminar Activo" en la página de edición del admin con confirmación. El admin puede eliminar cualquier activo sin pujas y sin remate abierto. La acción está auditada en `AuditLog`
- **Eliminar activo (Martillero)** — Botón "Eliminar Activo" en la página de edición del martillero (solo visible cuando el activo está en estado PENDIENTE). El martillero solo puede eliminar sus propios activos sin pujas. La acción está auditada
- **Server action `deleteAssetAction`** — Nueva acción en `actions/assets.ts` con control de permisos: ADMINISTRATIVO puede eliminar cualquier activo elegible, MARTILLERO solo los suyos. Verifica que no tenga pujas ni remate activo
- Componente `DeleteAssetButton.tsx` — Componente reutilizable con confirmación `window.confirm`, estados de loading/error, y redirección configurable

## [0.10.9] - 2026-07-18

### Fixed
- **Martillero podía cerrar remates de otros** — `closeAuctionAction` solo verificaba el rol MARTILLERO sin validar propiedad del activo. Ahora verifica `asset.martilleroId === session.user.id` tanto en la server action como en `auction-engine.ts`. Un martillero solo puede cerrar sus propios remates
- **Botón "Cerrar Remate" visible para todos los martilleros** — Ahora solo aparece en la sala de remates si el martillero logueado es dueño del activo (`session.user.id === asset.martilleroId`)
- **Martillero podía ver participantes/historial de otros** — `getAssetParticipantsAction` y las páginas de participantes/historial del martillero no verificaban propiedad. Ahora verifican `asset.martilleroId === session.user.id` y muestran 404 si no es dueño
- **Martillero no podía editar sus propios activos** — `updateAssetAction` solo aceptaba ADMINISTRATIVO. Ahora acepta MARTILLERO con verificación de ownership
- **Botón hamburguesa no funcionaba en móvil** — El botón del menú móvil no tenía padding suficiente para touch targets. Agregado `p-2` y `type="button"` para área de toque de 44x44px

### Added
- **Página de edición para martillero** — Nueva ruta `/martillero/activos/[id]` con formulario de edición (descripción, precio base, imagen). El martillero puede editar solo sus propios activos
- **AssetCard enlaza a edición** — El listado del martillero ahora enlaza cada activo a su página de edición en vez de la sala pública
- **Script `dev:lan`** — `pnpm dev:lan` expone el servidor en `0.0.0.0` para acceder desde otros dispositivos en la misma red WiFi

### Changed
- **Puja con confirmación automática de 3 segundos** — Al hacer clic en un botón de incremento rápido (+$50K, +$100K, +$1M), ahora aparece una barra de confirmación con countdown de 3 segundos, barra de progreso visual, botón verde "✓ Confirmar" y botón "✕ Cancelar". Si no se hace nada en 3 segundos, la puja se ejecuta automáticamente
- `BidControls.tsx`: reescrito completamente — estados `pendingIncrement` y `countdown`, timer con `useEffect` + `setTimeout`, recálculo automático del monto al confirmar (usa `currentPrice` actual), botones de incremento ya no usan `<form>`, input manual de monto se oculta durante countdown

## [0.10.8] - 2026-07-18

### Fixed
- **Botones de puja rápida no funcionaban** — Los 3 botones de incremento (+$50.000, +$100.000, +$1.000.000) usaban `formAction` de HTML sin estar dentro de un `<form>`, por lo que no hacían nada al hacer clic. Solución: cada botón ahora está envuelto en su propio `<form action={...}>` con `type="submit"`

### Changed
- **Rediseño sala de remates** — Layout reestructurado en 2 columnas: columna izquierda = imagen + info del activo + "Cerrar Remate" (solo martillero); columna derecha = descripción + badge + controles de puja + últimas 5 pujas en tiempo real
- `AuctionRoom.tsx`: nueva prop `initialBids` para historial inicial, renderiza `BidHistoryLive`/`BidHistoryList` debajo de BidControls, se eliminó `CloseAuction` de este componente (ahora está en page.tsx)
- `remates/[id]/page.tsx`: fetch de últimas 5 pujas, layout 2 columnas, `CloseAuction` en columna izquierda debajo de la imagen

### Added
- Componente `BidHistoryLive.tsx` — hook `BidHistoryLive` para manejar estado de pujas en tiempo real (prepend + recorte a 5), componente `BidHistoryList` para renderizar la lista con highlight verde en la más reciente y fecha relativa
- Función `getLatestBids(assetId, limit)` en `auction-engine.ts` — consulta optimizada de últimas N pujas
- Server action `getLatestBidsAction` en `actions/bids.ts`

## [0.10.7] - 2026-07-18

### Added
- **Garantía dentro de la sala de remates** — Componente `GuaranteePrompt.tsx` que permite al `POSTOR` crear y pagar su garantía en un solo paso directamente desde la sala de subasta, sin necesidad de redirigir a otra página. Si el postor ya tiene garantía pagada, ve `BidControls` normalmente; si no, ve el formulario de garantía
- **Botón "Ver en vivo" en activos** — `AssetCard` acepta prop `showLiveButton` para mostrar un botón verde que lleva a la sala de subasta cuando el activo tiene estado `ACTIVO`
- **Historial de pujas** — Páginas `/admin/activos/[id]/historial` y `/martillero/activos/[id]/historial` que muestran todas las pujas de un activo ordenadas por monto descendente con nombre del postor y fecha
- **Participantes del remate** — Server action `getAssetParticipantsAction` en `actions/guarantees.ts` que retorna tres grupos: postores pujando, con garantía sin pujar, y sin garantía. Páginas `/admin/activos/[id]/participantes` y `/martillero/activos/[id]/participantes`
- **Panel de gestión del remate** — En la página de edición del admin, sección "Gestión del Remate" con botones a "Ver Participantes" y "Ver Historial de Pujas" cuando el activo está `ACTIVO`
- **Acciones rápidas del martillero** — En el listado de activos del martillero, botones "Participantes" e "Historial" debajo de cada activo activo

### Changed
- `AuctionRoom.tsx`: acepta prop `hasGuarantee` para decidir si renderizar `BidControls` o `GuaranteePrompt`
- `remates/[id]/page.tsx`: consulta garantía del usuario logueado y la pasa como `hasGuarantee` a `AuctionRoom`
- `AssetCard.tsx`: agregado prop `showLiveButton?: boolean` para botón verde "Ver en vivo"
- `admin/activos/page.tsx`: pasa `showLiveButton` y `href` al AssetCard
- `martillero/activos/page.tsx`: pasa `showLiveButton` al AssetCard, envuelve cada card en `<div>` con acciones rápidas

## [0.10.6] - 2026-07-18

### Fixed
- **Admin no encontraba botón de aprobar** — `AssetCard` siempre enlazaba a `/remates/${id}` (página pública sin botones). Ahora acepta prop `href` opcional y el listado admin enlaza a `/admin/activos/${id}` donde están los botones de aprobación y activación

### Changed
- `AssetCard.tsx`: agregado prop `href?: string` para controlar destino del link (default: `/remates/${id}`)
- `admin/activos/page.tsx`: pasa `href={/admin/activos/${asset.id}}` al AssetCard

## [0.10.5] - 2026-07-18

### Added
- Componente `ActivateAuctionButton.tsx` — botón "Abrir Remate" para que el administrador active activos pendientes
- Panel "Activar Remate" en página de edición del admin (`/admin/activos/[id]`) — muestra estado actual y permite activar cuando el activo está aprobado

### Fixed
- `changeAssetStatusAction` existía en el backend pero no había UI para invocarlo — ahora es funcional desde la página de edición del admin
- Flujo completo de activación: crear → aprobar → activar → aparece en `/remates`

## [0.10.4] - 2026-07-18

### Added
- Componente `ApprovalButtons.tsx` — botones de aprobar/rechazar activos para el administrador
- Panel de aprobación en página de edición de activo (`/admin/activos/[id]`) — muestra estado actual y permite aprobar o rechazar
- Listado de activos del martillero (`/martillero/activos`) ahora muestra el badge de approvalStatus

### Fixed
- `approveAssetAction` y `rejectAssetAction` estaban implementados pero nunca se invocaban desde la UI — ahora son funcionales desde la página de edición del admin
- Listado del martillero no mostraba estado de aprobación de sus activos

## [0.10.3] - 2026-07-18

### Fixed
- **Upload API bloqueaba a MARTILLEROS** — el endpoint `/api/uploads` solo aceptaba rol `ADMINISTRATIVO`, ahora acepta `ADMINISTRATIVO` y `MARTILLERO`
- **Sin preview visual de imagen en formularios** — los 3 formularios de creación/edición de activos ahora muestran un preview real de la imagen subida con `<Image>` de Next.js en vez de solo texto "Imagen cargada"

## [0.10.2] - 2026-07-18

### Fixed
- **Navbar no cambiaba para usuarios no-admin** — causado por `signIn` server-side que no notificaba al `SessionProvider` del cliente
- Login reescrito usando `signIn` de `next-auth/react` (client-side) con `redirect: false` — el `SessionProvider` se actualiza automáticamente después del login
- `providers.tsx` simplificado — quitada prop `session` redundante, `SessionProvider` maneja la sesión completamente en el cliente
- `layout.tsx` simplificado — quitado `await auth()` del root layout (ya no es necesario)
- `actions/auth.ts` limpiado — eliminada función `login` (ya no se usa, el login es client-side)

## [0.10.1] - 2026-07-18

### Fixed
- `SessionProvider` ahora recibe la sesión del servidor via `auth()` en root layout — el navbar muestra correctamente el estado de sesión (nombre, rol, links) inmediatamente después del login
- `next.config.ts`: configurado `images.remotePatterns` para `picsum.photos` — las imágenes externas ahora cargan correctamente en `Image` de Next.js
- Seed: Toyota Hilux actualizado con imagen placeholder (`picsum.photos/seed/toyota-hilux-2022/800/600`)

## [0.10.0] - 2026-07-18

### Added
- Componente `Navbar.tsx`: barra de navegación superior adaptativa (público + autenticado)
- Navbar muestra logo "Remates TFM", links de navegación por rol, nombre de usuario, badge de rol, botón de logout
- Navbar público: botones "Iniciar Sesión" y "Crear Cuenta" para usuarios no autenticados
- Navbar autenticado: links contextuales por rol (Administrador, Martillero, Postor) + badge de rol con colores
- Menú hamburguesa responsive para dispositivos móviles
- `/remates` es ahora la página principal (accesible sin autenticación)
- Root page (`/`) redirige automáticamente a `/remates`
- Filtrado de remates: solo se muestran activos (status = ACTIVO)
- Imagen placeholder para Toyota Hilux 2022 de ejemplo (picsum.photos)

### Changed
- `middleware.ts`: `/remates` agregado a `publicPaths` (accesible sin login)
- `app/layout.tsx`: incluye `<Navbar />` fijo + padding top para contenido
- `app/remates/page.tsx`: filtra por `status: "ACTIVO"`, muestra "Remates Activos"
- `app/(auth)/layout.tsx`: eliminado `<Providers>` duplicado

### Fixed
- Providers duplicado en layout de auth (SessionProvider anidado innecesariamente)

## [0.9.0] - 2026-07-18

### Added
- Enum `ApprovalStatus` (PENDIENTE, APROBADO, RECHAZADO) para flujo de aprobación de activos
- Server Actions: `createMartilleroAction`, `getMartillerosAction`
- Server Actions: `approveAssetAction`, `rejectAssetAction`
- Server Action: `getAssetsWithApprovalAction` con filtros de aprobación
- Página admin: `src/app/admin/martilleros/page.tsx` — listado de martilleros
- Página admin: `src/app/admin/martilleros/nuevo/page.tsx` — crear martillero
- Página martillero: `src/app/martillero/activos/page.tsx` — listado de activos
- Página martillero: `src/app/martillero/activos/nuevo/page.tsx` — crear activo
- Filtros de aprobación en admin/activos (Todos, Pendientes, Aprobados, Rechazados)
- Badge de estado de aprobación en AssetCard
- Validación: solo activos APROBADOS pueden pasar a estado ACTIVO
- Seed: martillero (`martillero@remates.cl` / `Martillero123!`)
- Seed: postor (`postor@remates.cl` / `Postor123!`) con garantía pagada
- Seed: Toyota Hilux 2022 como activo de ejemplo (APROBADO + ACTIVO)
- Eventos de auditoría: MARTILLERO_CREATED, ASSET_APPROVED, ASSET_REJECTED

### Changed
- `schema.prisma`: campo `approvalStatus` en Asset, relación `approvedBy`
- `assets.ts`: MARTILLERO puede crear activos (con aprobación pendiente)
- `auction-engine.ts`: verifica approvalStatus antes de activar remate
- `admin/activos/page.tsx`: usa `getAssetsWithApprovalAction` con filtros
- `AssetCard.tsx`: muestra approvalStatus y nombre del martillero

## [0.8.0] - 2026-07-18

### Added
- `src/lib/audit.ts` — sistema de auditoría con `logAction()`, `getLogsByEntity()`, `getLogsByUser()`, `getAllLogs()`
- `src/lib/errors.ts` — clases de error custom: `AuctionError`, `AuthError`, `ForbiddenError`, `ValidationError`, `NotFoundError`, `RateLimitError`
- `src/lib/rate-limit.ts` — rate limiting en memoria (10 req/min por usuario)
- Página admin de auditoría: `src/app/admin/audit/page.tsx`
- Eventos auditados: BID_PLACED, AUCTION_CLOSED, ASSET_CREATED, ASSET_UPDATED, USER_REGISTERED, GUARANTEE_PAID
- Rate limiting aplicado a pujas (max 10/min por usuario)

### Changed
- `auction-engine.ts`: registra eventos de auditoría después de cada puja, cierre y creación de activo
- `bids.ts`: aplica rate limiting antes de procesar pujas

## [0.7.0] - 2026-07-18

### Added
- Utilidad `src/lib/stats.ts` — estadísticas server-side con Prisma aggregates
- Dashboard administrativo: `src/app/admin/dashboard/page.tsx`
- Dashboard martillero: `src/app/martillero/dashboard/page.tsx`
- Dashboard postor: `src/app/postor/dashboard/page.tsx`
- Componente `Filters.tsx` — filtros por estado con URL params
- Componente `StatCard.tsx` — tarjeta de estadística reutilizable
- Métricas: total activos, pujas, usuarios, garantías pendientes
- Historial de pujas por rol con badges de estado

## [0.6.0] - 2026-07-18

### Added
- Server Actions de garantías: `src/app/actions/guarantees.ts`
- Página postor: `src/app/postor/garantia/page.tsx` — solicitar y pagar garantía
- Panel admin: `src/app/admin/garantias/page.tsx` — ver y verificar garantías
- Componente `GuaranteeStatus.tsx` — badge de estado de garantía
- Flujo completo: crear → pagar (simulación) → verificar por admin
- Validación: sin garantía pagada no se puede pujar (ya en auction-engine)

## [0.5.0] - 2026-07-18

### Added
- Servidor SSE centralizado: `src/lib/sse-server.ts` — gestión de conexiones por asset
- Endpoint SSE: `src/app/api/sse/auctions/[id]/route.ts`
- Hook `src/hooks/useSSE.ts` — conexión SSE con reconexión exponencial
- Componente `LiveBid.tsx` — precio actualizado en tiempo real
- Componente `AuctionTimer.tsx` — countdown del remate
- Componente `AuctionRoom.tsx` — wrapper completo de sala de subasta en vivo
- Eventos SSE: `bid` (nueva puja), `auction-closed` (cierre de remate)
- Indicador de conexión en tiempo real en la sala de subasta

### Changed
- `auction-engine.ts`: emite eventos SSE después de cada puja y cierre
- `remates/[id]/page.tsx`: usa AuctionRoom para actualizaciones en vivo

## [0.4.0] - 2026-07-18

### Added
- Motor de pujas: `placeBid()` con transacciones atómicas Prisma
- Cierre manual de remate: `closeAuction()` (ADJUDICADO si hay pujas, DESIERTO si no)
- Server Actions de pujas: `src/app/actions/bids.ts`
- Componente `BidControls.tsx`: incrementos rápidos (+$50k, +$100k, +$1M) y campo libre
- Componente `WinnerIndicator.tsx`: muestra postor ganador actual
- Componente `CloseAuction.tsx`: botón de cierre para MARTILLERO
- Sala de subasta actualizada: controles de puja, indicador ganador, cierre manual
- Incremento mínimo configurable ($50.000 CLP)
- Validación server-side: status ACTIVO, garantía pagada, monto > precio actual

### Changed
- `auction-engine.ts`: expandido con placeBid, closeAuction, getBidsByAsset, getWinningBid

## [0.3.0] - 2026-07-18

### Added
- `src/lib/auction-engine.ts`: lógica de negocio de activos (CRUD, transiciones de estado, validaciones)
- Server Actions CRUD de activos: `src/app/actions/assets.ts`
- API route para uploads: `src/app/api/uploads/route.ts`
- Componente `AssetCard.tsx` para listados de activos
- Página pública de listado: `app/remates/page.tsx`
- Página de detalle: `app/remates/[id]/page.tsx`
- Panel admin: listado de activos `app/admin/activos/page.tsx`
- Panel admin: crear activo `app/admin/activos/nuevo/page.tsx`
- Panel admin: editar activo `app/admin/activos/[id]/page.tsx`
- Shadcn/UI: componentes `card`, `badge`, `button`, `input`
- Transiciones de estado validadas server-side (PENDIENTE→ACTIVO, ACTIVO→ADJUDICADO/DESIERTO, etc.)
- Validación de precio base (> 0) en servidor
- Upload de imágenes con validación de tipo y tamaño (JPEG, PNG, WebP, max 5MB)
- Almacenamiento de imágenes en `public/uploads/`

## [0.2.0] - 2026-07-18

### Added
- Auth.js v5 (next-auth@beta) con estrategia JWT y credenciales
- `src/lib/auth.ts`: configuración Auth.js con providers y callbacks
- API route `src/app/api/auth/[...nextauth]/route.ts`
- Server Actions de auth: `register`, `login`, `logout`
- Páginas de login y registro: `app/(auth)/login/`, `app/(auth)/register/`
- Layout de auth con Providers wrapper
- Middleware de protección de rutas por rol (ADMINISTRATIVO, MARTILLERO, POSTOR)
- Dashboard por rol con redirección automática
- Página de listado de remates
- `src/types/next-auth.d.ts`: extensión de tipos de sesión
- `src/components/providers.tsx`: SessionProvider wrapper

## [0.1.0] - 2026-07-18

### Added
- Proyecto inicializado con Next.js 16 (App Router) + TypeScript 5.8 (strict mode)
- Tailwind CSS v4 con configuración CSS-first
- Shadcn/UI configurado (components.json, theme CSS variables)
- Prisma 7 con PostgreSQL adapter (`@prisma/adapter-pg`)
- Docker Compose con PostgreSQL 16 Alpine para desarrollo local
- Schema Prisma: modelos `User`, `Asset`, `Bid`, `BidderGuarantee`, `AuditLog`
- Enums `Role` (MARTILLERO, POSTOR, ADMINISTRATIVO) y `AuctionStatus` (PENDIENTE, ACTIVO, ADJUDICADO, DESIERTO)
- Seed de usuario admin inicial (`admin@remates.cl`)
- `lib/prisma.ts`: singleton de PrismaClient con driver adapter
- `lib/utils.ts`: helper `cn()` para merge de clases Tailwind
- `types/auction.ts`: interfaces TypeScript del modelo de negocio
- ESLint con `typescript-eslint` (regla `no-explicit-any`)
- `.gitignore`, `.env.example`
- Documentación en `docs/`: PLAN.md, ARQUITECTURA.md, MODELO-DATOS.md
