# Feature Flags

## Estrategia
- Habilitar/deshabilitar funcionalidades sensibles (sala de remate, cierre manual, pujas) sin redeploy inmediato.
- **Kill Switch** para pujas: capacidad de **bloquear mutaciones** instantáneamente ante anomalía (P0).

## Uso Recomendado
| Flag | Tipo | Uso | Default |
|---|---|---|---|
| `AUCTIONS_PUJA_ENABLED` | Escritura | Habilita pujas (kill switch global). | On (RC→Prod controlado) |
| `AUCTION_MANUAL_CLOSE_ENABLED` | Escritura | Cierre manual MARTILLERO. | Según release |
| `AUCTION_ROOM_REALTIME` | Feature | Tiempo real (SSE/WebSocket). | On |
| `PRE_RELEASE_WARNINGS` | UI | Avisos internos. | Off prod |
| `MAINTENANCE_MODE` | Global | Modo mantenimiento (read-only). | Off |

## Gobernanza
- **Rollout gradual:** Canary (% tráfico) o por rol (evaluar).
- **Cambios controlados:** Solo responsables autorizados modifican flags prod (auditar cambios).
- **Kill Switch:** Activación por **On-Call P0** (rápida, sin esperar aprobación completa si riesgo inminente). Registrar timestamp/quién.
- **Limpieza:** Plan retirar flags obsoletos post-release (deuda técnica). Documentar en Changelog si afectan comportamiento.

## Verificación
- Probar flags en Preprod (on/off). Asegurar que bloqueo mutaciones no rompe lectura crítica de forma inesperada. Preferir **separar lectura/escritura** para kill switch.