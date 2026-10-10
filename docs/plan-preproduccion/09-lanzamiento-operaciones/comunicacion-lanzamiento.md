# Comunicación de Lanzamiento

## Stakeholders
- **Interno:** Equipo Dev/QA/DevOps, Tech Lead, PO, On-Call.
- **Negocio:** Stakeholders proyecto.
- **Soporte:** Equipo soporte (si afecta usuarios).
- **Usuarios:** Si ventana mantenimiento afecta (avisos externos).

## Plantillas (Base)

### 1. Pre-Lanzamiento (Aviso de Ventana)
**Asunto:** [Aviso] Lanzamiento vX.Y.Z - Ventana Mantenimiento [DD/MM/YYYY HH:MM TZ]

**Contenido (mínimo):**
- Versión: `vX.Y.Z`
- Fecha/Hora inicio-fin (TZ explícita)
- Duración estimada
- Impacto esperado (downtime/parcial/ninguno)
- Motivo resumen
- Canal status/incidencias
- Responsable/On-Call

### 2. Inicio de Lanzamiento
**Asunto:** [INICIO] Lanzamiento vX.Y.Z

- Hora inicio
- Rama/tag `vX.Y.Z`
- Enfoque (migraciones + deploy)
- On-Call activo

### 3. Éxito de Lanzamiento
**Asunto:** [COMPLETADO] Lanzamiento vX.Y.Z exitoso

- Versión `vX.Y.Z`
- Hora finalización
- Duración real
- Resumen cambios clave (ref Changelog)
- Verificación smoke OK + monitoreo estable (60 min)
- URL entorno prod

### 4. Incidencia durante Lanzamiento
**Asunto:** [INCIDENCIA] Lanzamiento vX.Y.Z - Investigando

- Estado: Investigando
- Hallazgo
- Impacto
- Acciones en curso
- ETA actualización (reiterativo)

### 5. Rollback Ejecutado
**Asunto:** [ROLLBACK] vX.Y.Z → vX.Y.Z-1 ejecutado

- Versión revertida
- Motivo (breve, técnico + impacto)
- Hora inicio/fin rollback
- Estado actual (estable)
- Próximos pasos (post-mortem)

## Canales
- **Interno:** Slack/Equipo (canal #releases/#incidencias)
- **Externo (si aplica):** StatusPage, Email usuarios, Comunicación negocio
- **Registro:** Guardar comunicaciones relevantes (evidencia).

## Reglas
- **Transparente y concisa.** No exponer secretos/detalles técnicos innecesarios a usuarios.
- **Frecuencia:** Actualizar cada 15-30 min si incidente abierto.
- **Timestamp + TZ** siempre. Usar hora servidor/TZ definida.