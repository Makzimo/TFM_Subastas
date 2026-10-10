# Logging y Trazabilidad

## Estrategia
- **Logging estructurado (JSON)** en Producción (fácil parse + correlación).
- **Observabilidad centrada en negocio + errores.** Enfatizar trazabilidad auditoría pujas.

## Correlación (Obligatoria)
Usar IDs de correlación: `requestId`, `auctionId`, `lotId`, `bidId`, `userId`, `sessionId` (mínimo necesario). Permite trazar flujo end-to-end.

## Qué Loguear (Eventos Críticos)
| Evento | Nivel | Campos Mínimos | Notas |
|---|---|---|---|
| Puja **exitosa** | `info` | requestId,auctionId,lotId,bidId,userId,status,amount (registrado DB) | Evitar detalles sensibles extra. |
| Puja **fallida/rechazada** | `warn/info` | requestId,auctionId,lotId,userId,status,`reasonCode` | **Motivo rechazo** (negocio). No exponer datos internos. |
| Cierre manual (MARTILLERO) | `info` | requestId,auctionId,lotId,userId,action | **Auditoría obligatoria**. |
| Denegos autorización (RBAC) | `warn` | requestId,userId,action,resource,reasonCode | Detectar intentos abuso. |
| Errores TX/Prisma | `error` | requestId,correlation,code,errorClass | Detalles técnicos internos. **Sin PII/secrets**. |
| Migraciones DB | `info` | migration,name,direction,status | Trazabilidad despliegue. |
| Auth eventos críticos | `warn/info` | userId,event,status | Logout/inválidos. |

## Qué NO Loguear (Prohibido)
- `AUTH_SECRET`, `DATABASE_URL`, tokens, cookies sensibles.
- Nombres completos, emails, teléfonos, direcciones.
- Montos con contexto innecesario en logs no estructurados masivos.
- Stack traces completos a logs accesibles cliente. Stack → interno `error`.
- Payloads completos con datos sensibles.

## Niveles
- `error`: Fallos inesperados (TX, excepciones no controladas).
- `warn`: Rechazos negocio, denegos, anomalías.
- `info`: Eventos auditables negocio (éxito crítico).
- `debug`: **Deshabilitado en Producción**.

## Recomendaciones
- Logging centralizado (agregación + retención).
- No loguear en bucles (sala realtime) innecesariamente.
- Hash IPs vs IP raw (evaluar política privacidad).
- Truncar payloads largos. Integridad logs (append-only recomendado).