# Alcance

## Alcance Funcional (Incluido en Corte)
- **Gestión de Subastas:** Creación, apertura/cierre manual (MARTILLERO), estados, lotes.
- **Activos:** Gestión, asignación a subasta, visualización.
- **Garantías:** Solicitud/validación `BidderGuarantee.isPaid` previo a puja.
- **Sala de Remate:** Interfaz tiempo real, `BidControls` (incrementos rápidos + valor libre), `AuctionTimer`, actualización precio.
- **Roles y Permisos:** `MARTILLERO`, `POSTOR`, `ADMINISTRATIVO` con RBAC validado **SIEMPRE en servidor**.
- **Server Actions + RSC:** Cumplimiento serialización `lib/serialize.ts`. Prohibido Prisma crudo cruzando borde RSC.
- **Integridad Transaccional:** `$transaction` para registro de pujas y validación de estado.

## Fuera de Alcance (Out of Scope)
- Integraciones de pago externas nuevas (si ya existentes, validar solo compatibilidad).
- Nuevos canales de notificación (email/SMS) no críticos para núcleo de subasta.
- Mejoras UI cosméticas no relacionadas a regresión crítica.
- Refactorizaciones masivas no requeridas por bug bloqueante.
- Funcionalidades con feature flag diferido (documentar issue).

## Dependencias Externas
| Dependencia | Tipo | Observación |
|---|---|---|
| PostgreSQL | DB | Migraciones Prisma. Pool conexiones. |
| NextAuth.js | Auth | Sesiones, callbacks, RBAC. |
| Hosting/Infra | Despliegue | Soporta Node.js + Next.js 15, pnpm. |
| CDN (si aplica) | Estático | Evitar cache sala remate/precios (usar `revalidate: 0`). |
| Monitoreo/Alertas | Observabilidad | Logs estructurados, health checks. |

## Datos a Migrar
- Catálogos (roles/estados) si aplica.
- Usuarios/activos/configuraciones mínimas necesarias.
- **Limpieza:** Eliminar datos de prueba sensibles. No copiar secretos.

## Feature Freeze
- **Definición:** A partir de inicio de RC (Release Candidate), solo se aceptan **fixes críticos/blockantes** con justificación escrita, análisis de impacto y aprobación de Tech Lead.
- **Requisito:** Todo cambio bajo freeze debe actualizar `CHANGELOG.md` y pasar checklist completo.