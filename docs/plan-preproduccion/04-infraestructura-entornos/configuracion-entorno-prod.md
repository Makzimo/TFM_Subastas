# Configuración de Entorno de Producción

## Variables y Secrets
- Validar `.env.production` vs `.env.example`. Sin secretos en repo.
- Fail-fast al arranque (vars críticas ausentes).
- Usar gestor de secrets (recomendado). Acceso restringido.

## Build & Runtime
- `NODE_ENV=production`
- Build Next.js optimizado (`pnpm build`). Verificar salida sin warnings críticos.
- Timeouts, memory limits definidos por runtime/host.
- Conexión DB con pooling (PgBouncer) + timeouts razonables.

## Red, SSL y Dominios
- **HTTPS obligatorio** + redirección HTTP→HTTPS.
- **HSTS** activo (`max-age=31536000; includeSubDomains; preload`).
- Certificados vigentes + renovación automatizada si aplica.
- Firewall restrictivo (exposición mínima). Whitelists si necesario.

## CDN, Cache y Tiempo Real
- **Sala de remate / precios / actualizaciones tiempo real:** **NO cachear**. Respetar `next: { revalidate: 0 }` (dinámico).
- **Assets estáticos:** Cache largo con hashes (óptimo).
- **Páginas híbridas:** Evaluar por ruta. Evitar servir HTML cacheado con precio obsoleto.
- **SSE/WebSocket:** Configurar timeouts/reconnect + keep-alive.

## Escalado y Conexiones
- Pool DB dimensionado (max connections) acorde a instancias.
- Límites request/response. Graceful shutdown.
- Readiness/Liveness probes configurados (ver health-checks).

## Seguridad Infra
- Headers aplicados (hardening). CSP validado Preprod.
- Rate limiting a nivel app (y edge si disponible).
- Logs estructurados enviados a destino centralizado.