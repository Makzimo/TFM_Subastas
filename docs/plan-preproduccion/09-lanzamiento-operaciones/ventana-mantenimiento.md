# Ventana de Mantenimiento

## Definición
Registrar ventana aprobada antes de lanzar.

## Plantilla de Ventana

| Campo | Valor | Notas |
|---|---|---|
| **Versión** | `vX.Y.Z` | SemVer |
| **Fecha** | DD/MM/YYYY | — |
| **Inicio (TZ)** | HH:MM [America/Santiago u otra] | **TZ explícita** |
| **Fin estimado (TZ)** | HH:MM | Revisable |
| **Duración estimada** | Xh Ym | Referencial |
| **Impacto usuarios** | Sin downtime / Parcial / **Con downtime** | Clarificar |
| **Razón** | Migraciones DB + deploy + validación | Breve |
| **Mantenimiento requerido** | Sí/No | Según estrategia |
| **Rollback Window máx.** | HH:MM (o tiempo desde inicio) | **Definir "point of no return"** si aplica |

## Criterios para Ampliar/Reducir
- **Ampliar**: Migración compleja, smoke fail requiere fixes, rollback complejo, incidente no resuelto.
- **Reducir (adelantar fin)**: Todo OK antes, sin incidentes, smoke+monitoreo estable temprano.
- **Acción:** Notificar stakeholders inmediatamente al cambiar ventana.

## Avisos
- **Pre-aviso:** Mínimo razonable (según impacto). Enviar plantilla 9.2 #1.
- **Durante:** Actualizaciones si cambios ventana o incidente.
- **Post:** Cierre con éxito/rollback.

## Recomendaciones
- **Evitarr horario pico** si usuarios afectados.
- **Point of No Return:** Definir claramente. Después de cierto paso (p.ej. migración destructiva aplicada + datos modificados sin backup viable inmediato) rollback DB puede tener mayor costo. Documentar ese umbral en runbook/plan rollback.
- **Comunicación proactiva** ante desviaciones.