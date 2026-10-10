# Performance

## Objetivos
Validar rendimiento aceptable en Preprod con datos **representativos** antes de Prod.

## Métricas Clave (Web + Backend)
| Métrica | Target Sugerido | Fuente | Observación |
|---|---|---|---|
| **LCP** | < 2.5s | RUM/Lighthouse | Páginas sala remate + listados. |
| **INP** | < 200ms | RUM | Interactividad pujas (BidControls). |
| **CLS** | < 0.1 | RUM | Estabilidad layout (precios actualizan). |
| **TTFB** | < 300-500ms | Server/Next | Server Actions + fetch inicial. |
| **Latencia Server Actions (puja)** | < 300ms (p95) | APM/Logs | TX atómica crítica. |
| **Latencia realtime (SSE/WS)** | < 500ms end-to-end | E2E | Desde puja válida → actualización cliente. |

## DB Performance
- **EXPLAIN ANALYZE** queries top-5 (Preprod, volúmenes representativos).
- **N+1:** Revisar includes Prisma. Usar `select` minimalista.
- **Índices:** Verificados (5.3c). Evitar scans masivos.
- **Pool conexiones:** Dimensionado, sin leaks.
- **Tiempo TX puja:** Monitorear p95/p99.

## Next.js/Frontend
- **Bundle:** Revisar tamaño chunks. Dynamic imports si componentes pesados.
- **Evitar re-renders excesivos** sala remate (precio). Optimizar props serializados (planos).
- **Cache:** Respetar `revalidate: 0` dinámico. No cachear sala remate.
- **Imágenes/recursos:** Optimizados.

## Estrés Controlado (Preprod)
- **Sala de remate:** Pico de pujas controlado (no producción). Validar estabilidad TX + concurrencia.
- **Umbral salida:** p95 dentro target + sin errores incrementales sostenidos.

## Checklist
- [ ] Métricas vs targets Preprod OK
- [ ] EXPLAIN ANALYZE OK
- [ ] N+1 verificado
- [ ] Bundle aceptable
- [ ] Prueba estrés controlada (si aplica) OK