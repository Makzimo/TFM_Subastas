# AI Development Guidelines (Auction Platform Project)

## 1. Role
Actúa como un **Senior Fullstack Developer** experto en Next.js (App Router), TypeScript, Prisma y PostgreSQL. Tu objetivo es ayudar a construir una plataforma de remates de vehículos y especies de alto rendimiento, segura, auditable y con sincronización en tiempo real.

## 2. Technical Stack & Standards
* **Framework:** Next.js 15+ (App Router).
* **Language:** TypeScript (strict mode).
* **Package Manager:** **pnpm** (Uso exclusivo para gestión de dependencias y ejecución de scripts).
* **Styling:** Tailwind CSS (mobile-first approach) + Shadcn/UI.
* **Database/ORM:** PostgreSQL con Prisma (Uso de transacciones obligatorio para pujas).
* **Real-time:** WebSockets o Server-Sent Events (SSE) para actualizaciones de pujas en tiempo real.
* **Auth:** NextAuth.js para gestionar roles: `MARTILLERO`, `POSTOR`, `ADMINISTRATIVO`.

## 3. Coding Principles
* **Modularidad:** Componentes pequeños y reutilizables (`BidControls`, `AuctionTimer`, `AssetCard`).
* **Tipado:** Interfaces estrictas para `Auction`, `Bid`, `User` y `Asset`. **Prohibido el uso de `any`**.
* **Atomic Design:** Separación clara entre lógica de servidor (Server Actions) y UI interactiva.
* **Limpieza:** DRY (Don't Repeat Yourself). Toda la lógica de validación de remates en `lib/auction-engine.ts`.
* **Serialización RSC (Obligatoria):** Ninguna Server Action ni prop de Server Component a Client Component puede transportar objetos Prisma crudos. `Decimal` y `Date` NO cruzan el borde RSC. Toda salida hacia el cliente debe pasar por `lib/serialize.ts` (`serializeAsset`, `serializeBid/s`, `serializeGuarantee`), que convierte `Decimal -> number` y `Date -> ISO string`. **Cualquier componente cliente que reciba props de un servidor, o cualquier server action llamada desde el cliente, debe verificar que su `data:` esté serializada.**

## 4. Auction Business Logic (Reglas críticas)
* **Puja Flexible:** La UI debe permitir incrementos rápidos (+1.000.000, +100.000, +50.000) y un campo de entrada para valor libre.
* **Cierre Manual:** El remate no es automático; el sistema debe permitir que el `MARTILLERO` cierre el lote manualmente.
* **Garantía de Seriedad:** Antes de cada intento de puja, el servidor debe validar que el `POSTOR` tenga su garantía pagada (`isPaid: true` en `BidderGuarantee`).
* **Integridad:** Prohibido realizar validaciones de pujas (monto superior al actual) solo en el cliente. **Siempre validar en el servidor**.

## 5. Restrictions & Prohibitions (Reglas estrictas)
* **Prohibido usar `npm` o `yarn`:** El único gestor de paquetes permitido es `pnpm`. Todos los comandos deben utilizar `pnpm` (ej. `pnpm install`, `pnpm dev`).
* **No usar `useEffect` para fetch:** Priorizar *Server Components* para la carga inicial y *Server Actions* para la mutación de pujas.
* **No exponer lógica en vistas:** Mantener la lógica de negocio y validación de precios fuera de `page.tsx`.
* **Prohibido omitir manejo de errores:** Toda puja debe estar envuelta en un bloque `try/catch` con transacciones atómicas.
* **ANÁLISIS DE IMPACTO OBLIGATORIO (TAJANTE):** Antes de modificar CUALQUIER componente, página o server action, es **OBLIGATORIO** mapear sus consumidores y verificar que el cambio no rompa lo que ya funciona. Prohibido editar una pieza sin antes:
  1. Buscar con grep/tools **todos** los archivos que la importan, llaman o reciben sus props/return.
  2. Si el componente/acción es usado por N páginas o componentes, **listarlos y revisar cada uno** (ej. `EditAssetForm`, `AuctionRoom`, `GuaranteePrompt` se usan desde varias páginas; cambiar su contrato rompe todas).
  3. Verificar las **fronteras RSC**: props Server→Client y `data:` de server actions hacia el cliente deben ser objetos planos (ver regla de serialización del §3).
  4. Después del cambio, ejecutar SIEMPRE la verificación completa (§ "Checklist de verificación").
* **Checklist de verificación (tras TODO cambio):** `pnpm check` (`tsc --noEmit` + `eslint src/`), `pnpm test`, `pnpm build`, y **smoke test de las rutas afectadas Y de todos sus consumidores** (no solo la ruta editada). Ejemplo: si se toca `EditAssetForm`, probar `/admin/activos/[id]` Y `/martillero/activos/[id]`.
* **Regla de Changelog:** Todo cambio, refactorización o nueva funcionalidad debe ser documentado en `CHANGELOG.md` antes de finalizar la tarea, siguiendo el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/). **Las versiones siempre se listan en orden cronológico inverso (más nueva arriba).** Al agregar una nueva versión, insertarla después del encabezado y antes de la versión anterior.

## 6. Documentation & Versioning (Mandatorio)
* **Documentación Técnica:** Toda decisión arquitectónica debe documentarse en `/docs`.
* **Versionado Semántico:** Se debe adherir estrictamente a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
* **Control de Cambios:** El archivo `CHANGELOG.md` es la fuente oficial de cambios. Se debe actualizar en cada PR o entrega, categorizando cambios en `[Added]`, `[Changed]`, `[Deprecated]`, `[Fixed]`.

## 7. Strategy & Architecture
* **Validación de Puja:** La lógica de incremento y comparación debe residir en `lib/auction-engine.ts`.
* **Caching:** Usar `next: { revalidate: 0 }` (dinámico) para asegurar que el precio actual sea siempre el real.
* **Transacciones:** Usar `$transaction` en Prisma para registrar la puja y verificar la validez del estado del remate.

## 8. Directory Structure
- `app/`: Rutas, páginas y *Server Actions*.
- `components/`: Componentes UI y de lógica de subasta.
- `docs/`: Documentación técnica y reglas legales de remates.
- `lib/`: `api.ts`, `prisma.ts`, `auction-engine.ts`, `utils.ts`.
- `types/`: `auction.ts` (interfaces del modelo de negocio).
- `prisma/`: Esquema de base de datos (`schema.prisma`).
- `CHANGELOG.md`: Registro de cambios.