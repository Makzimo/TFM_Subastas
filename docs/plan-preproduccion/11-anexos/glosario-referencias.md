# Glosario, Referencias y Conceptos Críticos

## Referencias Normativas
- [Semantic Versioning (SemVer) v2.0.0](https://semver.org/spec/v2.0.0.html)
- [Keep a Changelog (ES) 1.0.0](https://keepachangelog.com/es-ES/1.0.0/)
- [AGENTS.md](../../../AGENTS.md) - **Reglas obligatorias del proyecto**

## Conceptos Críticos del Proyecto
| Concepto | Descripción | Ubicación Referencia |
|---|---|---|
| **Serialización RSC** | Prohibido Prisma crudo Server→Client. `Decimal→number`, `Date→ISO`. Usar `serialize*`. | `lib/serialize.ts`, AGENTS.md §3 |
| **Server Actions** | Mutaciones servidor. `data:` hacia cliente **debe ser plano/serializado**. | `app/**/actions*`, AGENTS.md §3 |
| **Validación SIEMPRE en Servidor** | Nunca confiar cliente. Regla crítica pujas. | AGENTS.md §4 |
| **Transacciones Obligatorias** | `$transaction` para puja + validación estado. | AGENTS.md §7, Prisma |
| **Motor Subasta** | Fuente única verdad lógica incremento/comparación. | `lib/auction-engine.ts` |
| **Garantía de Seriedad** | `BidderGuarantee.isPaid: true` antes de cada puja. | Schema + lógica TX, AGENTS.md §4 |
| **Cierre Manual** | Controlado por `MARTILLERO`. No automático. | Reglas negocio, §4 AGENTS.md |
| **Análisis de Impacto Obligatorio** | Consumidores, fronteras RSC, smoke consumidores tras cambio. | AGENTS.md §5 |
| **Checklist Verificación Completo** | `pnpm check`, `pnpm test`, `pnpm build` + smoke consumidores. | AGENTS.md §5 |

## Arquitectura Clave
| Módulo | Función |
|---|---|
| `lib/auction-engine.ts` | Lógica centralizada subasta (validación montos/incrementos). |
| `lib/serialize.ts` | Serialización RSC obligatoria (`serializeAsset`, `serializeBid/s`, `serializeGuarantee`). |
| `lib/prisma.ts` | Cliente Prisma singleton. |
| `types/auction.ts` | Interfaces negocio (tipado estricto, sin `any`). |
| `prisma/schema.prisma` | Esquema DB + reglas. |
| `CHANGELOG.md` | Fuente oficial cambios (orden cronológico inverso). |

## Glosario Operativo
| Término | Significado |
|---|---|
| **Go/No-Go** | Decisión pase a Producción (criterios obligatorios). |
| **Feature Freeze** | Solo fixes críticos bajo aprobación. |
| **RC (Release Candidate)** | Versión candidata estabilización pre-prod. |
| **DB-First** | Migraciones DB antes de código dependiente. |
| **Zero-Downtime** | Sin interrupción servicio (objetivo). |
| **Kill Switch** | Deshabilitar mutaciones crítico (pujas) inmediato. |
| **P0/P1/P2** | Severidad incidencias (P0 = crítico). |
| **RPO/RTO** | Recovery Point/Time Objective. |
| **SCA** | Software Composition Analysis (auditoría dependencias). |
| **Shift-Left** | Seguridad/calidad temprana. |
| **Fail-Closed** | Denegar por defecto si ambiguo. |
| **Defense-in-Depth** | Validaciones en múltiples capas (servidor obligatorio). |

## Códigos de Rechazo (Recomendado - para logs)
| Code | Motivo Negocio (genérico, seguro) |
|---|---|
| `BID_GUARANTEE_NOT_PAID` | Garantía pendiente de pago |
| `BID_INVALID_AMOUNT` | Monto inferior a precio actual/mínimo |
| `BID_AUCTION_CLOSED` | Subasta/lote no abierto |
| `BID_LOT_INVALID_STATE` | Estado lote no permite pujas |
| `BID_RACE_CONDITION` | Precio actualizado, vuelva a intentar |
| `CLOSE_UNAUTHORIZED_ROLE` | Rol no autorizado para cierre manual |
| `CLOSE_ALREADY_CLOSED` | Lote ya cerrado |
| `AUTHZ_DENIED` | Acceso denegado |

> Usar `reasonCode` (no mensaje interno) en logs `warn/info` hacia correlación segura.