# Protección de Datos y Privacidad

## Principios
- **Minimización:** Solo recolectar datos necesarios.
- **Minimización de logs:** No registrar PII innecesario.
- **Trazabilidad con integridad:** Auditoría de pujas completa pero segura.

## Logging Seguro
- **Estructurado (JSON):** Recomendado prod.
- **Campos permitidos:** `timestamp`, `level`, `msg`, `requestId`, `auctionId`, `lotId`, `bidId`, `userId` (anon/pseudónimo si aplica), `action`, `status`, `ipHash` (no IP raw si política restrictiva), `durationMs`, `errorCode`.
- **PROHIBIDO:** Nombres completos, emails, teléfonos, direcciones, montos sensibles sin justificación, tokens, secrets, payloads completos.
- **Niveles:** `debug` **deshabilitado** en producción. `info/warn/error` según necesidad.
- **Retención logs:** Definir ventana (eliminar/archivar). Cumplir política interna.

## Auditoría de Negocio
- **Pujas auditables:** `quién (userId)`, `cuándo (timestamp)`, `monto` (registrado en DB), `lote/subasta`, `IP/contexto mínimo`, `resultado (OK/rechazo)`, `motivo rechazo` (genérico vs técnico).
- **Integridad:** No alterar logs. Inmutables.
- **Cierre manual:** Auditoría obligatoria (martillero, timestamp, lote, motivo si aplica).

## Datos de Prueba/Desarrollo
- **Masking:** Usar datos sintéticos. Nunca copiar prod a dev con PII.
- **Anonymización:** Antes de compartir dumps.
- **Limpieza:** Scripts seguros (no exponer PII).

## Recomendaciones
- Revisar logs periódicamente (fuga accidental).
- Considerar hash de IPs vs storage raw.
- Documentar política retención en anexos.