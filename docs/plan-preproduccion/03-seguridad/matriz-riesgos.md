# Matriz de Riesgos de Seguridad

## Clasificación: Probabilidad (1-5) | Impacto (1-5) | Riesgo = P*I (1-25)

| Riesgo | P | I | Riesgo | Amenaza | Mitigación | Responsable | Estado |
|---|---|---|---|---|---|---|---|
| Puja inválida (bypass cliente) | 5 | 5 | **25 (Crítico)** | Integridad subasta | **Validación SIEMPRE en servidor**. Fuente única verdad `lib/auction-engine.ts`. Prohibido validar solo cliente. | Backend | ☐ |
| Bypass garantía (`isPaid`) | 5 | 5 | **25 (Crítico)** | Fraude | Verificar `BidderGuarantee.isPaid: true` **antes de cada intento** de puja + dentro de `$transaction`. | Backend | ☐ |
| Race condition doble puja | 4 | 5 | **20 (Crítico)** | Consistencia | `$transaction` + condiciones WHERE (estado+monto) + comparación servidor. | Backend | ☐ |
| Elevación de roles | 3 | 5 | **15 (Alto)** | Autorización | RBAC estricto NextAuth. Checks **SIEMPRE servidor** (Server Actions + rutas). Nunca confiar cliente. | Backend | ☐ |
| Serialización RSC incorrecta | 4 | 4 | **16 (Alto)** | Fuga/bugs | Obligatorio `serialize*`. Prohibido Prisma crudo Server→Client o `data:` actions. Verificar fronteras. | Dev | ☐ |
| CSRF/Inyección | 4 | 4 | **16 (Alto)** | Validación | Zod en todas entradas. Server Actions + protecciones Next.js. Sanitización. | Backend | ☐ |
| Abuso/DoS sala remate | 4 | 4 | **16 (Alto)** | Disponibilidad | Rate limiting (usuario/IP/sala), throttling pujas, backpressure. | Backend/Infra | ☐ |
| Fuga secretos | 3 | 5 | **15 (Alto)** | Exposición | `.env` no versionado. No log secrets/keys. Rotación. Validación arranque. | DevSecOps | ☐ |
| Dependencias vulnerables (SCA) | 4 | 4 | **16 (Alto)** | CVEs | `pnpm audit --audit-level=high` bloqueante. Lockfile congelado. | DevSecOps | ☐ |
| Errores TX → estado inconsistente | 3 | 5 | **15 (Alto)** | Integridad | Try/catch + rollback transacción. Verificar atomicidad. | Backend | ☐ |
| Exposición stack traces | 3 | 4 | **12 (Medio-Alto)** | Info leakage | Mensajes genéricos cliente. Logs detallados internos. No leak prod. | Backend | ☐ |
| Logs con PII | 3 | 4 | **12 (Medio-Alto)** | Privacidad | Logging estructurado. No nombres/emails/montos sensibles en logs no estructurados. | Backend/DevOps | ☐ |

## Umbrales de Acción
- **Crítico (16-25):** Deben estar **MITIGADOS Y VERIFICADOS** antes de GO.
- **Alto (12-15):** Mitigación aceptable + verificación.
- **Medio-Bajo (<12):** Trackear, priorizar post-release si necesario.