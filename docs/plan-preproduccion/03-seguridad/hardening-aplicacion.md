# Hardening de Aplicación

## Security Headers (Recomendados)
| Header | Valor Recomendado | Justificación |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Fuerza HTTPS. |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing. |
| `X-Frame-Options` | `DENY` | Anti-clickjacking. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Minimiza info referer. |
| `Permissions-Policy` | Restringir (camera/mic/geolocation) | Reducir superficie. |
| `Content-Security-Policy` | Estricto (allowlist por origen) | Mitiga XSS. Configurar por entorno. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aislamiento. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Control recursos cruzados. |

## Rate Limiting & Throttling
- **Pujas:** Por usuario/IP/sala (anti-spam + race abuse). Throttling entre pujas.
- **Auth:** Login (brute force). Intentos fallidos.
- **Endpoints sensibles:** Server Actions críticas con límites.
- **Storage:** Redis recomendado para múltiples instancias (escalado horizontal).

## Validación & Sanitización
- **Esquemas Zod:** Todas entradas (Server Actions + APIs). Validar tipos y rangos (montos > 0, estado válido).
- **Fail-fast + mensajes genéricos:** Errores cliente sin detalles internos. Logs estructurados internos.
- **Data Integrity:** Nunca confiar en montos calculados cliente (recalcular servidor).

## Manejo de Errores
- `try/catch` **obligatorio** en pujas + TX.
- **No exponer stack traces** en producción.
- Mapear errores negocio (garantía pendiente, estado inválido) a mensajes claros y seguros.
- Correlación (`requestId/auctionId/bidId/lotId`).

## Bot Protection (Evaluar)
- reCAPTCHA/Turnstile si patrones abuso detectados. No bloquear flujo legítimo sala remate.

## Config Producción
- `NODE_ENV=production`.
- Ocultar debug/info sensible. Deshabilitar logs debug prod.
- Headers + CSP validados en Preprod (smoke headers).