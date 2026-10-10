# Estrategia de Testing

## Pirámide
- **Unit (base):** Lógica pura (`lib/auction-engine.ts`), utilidades, validaciones. Rápidos, aislados.
- **Integration (medio):** Server Actions + Prisma (DB real/test). Validan reglas negocio + TX + RBAC.
- **E2E (cima, crítico):** Flujos clave (Playwright) sala remate, cierre manual, garantías.

## Enfoque
- **Negocio crítico primero:** Subastas, garantías, cierre manual, transacciones.
- **Casos obligatorios:** Felices, bordes, negativos, validaciones servidor, race conditions.
- **Nunca asumir framework** de tests (ver README/búsqueda repo). Respetar existente.
- **Aislamiento:** Datos limpios entre tests. No depender estado global.
- **Determinismo:** Evitar time-based flakies. Mock tiempo solo cuando necesario.

## Cobertura Orientada a Riesgo
| Área | Prioridad | Tipo |
|---|---|---|
| `auction-engine.ts` | P0 | Unit + Property-like bordes |
| Server Actions pujas | P0 | Integration (TX) |
| Garantías (`isPaid`) | P0 | Integration |
| Cierre manual (MARTILLERO) | P0 | Integration+E2E |
| RBAC | P0 | Integration |
| Serialización/RSC | P0 | Unit+Revisión+Smoke |
| Flujo sala remate | P1 | E2E crítico |
| Formularios + consumidores | P1 | Integration+Smoke |

## Requisitos
- Tests añadidos/actualizados si tocan lógica crítica.
- Regresión mínima pasa SIEMPRE antes de release.
- Fallos tests = **bloqueantes** en CI.