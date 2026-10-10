# Plan de Preproducción - Plataforma de Remates

## Propósito
Unificar todos los puntos críticos de lanzamiento, seguridad y verificación de bugs para llevar el proyecto a producción de forma controlada, segura y auditable.

## Navegación Rápida
- [Resumen Ejecutivo](./00-resumen-ejecutivo/resumen-ejecutivo.md)
- [Alcance y Criterios Go/No-Go](./01-alcance-criterios/)
- [Gobierno y Proceso](./02-gobierno-proceso/)
- [Seguridad](./03-seguridad/)
- [Infraestructura y Entornos](./04-infraestructura-entornos/)
- [Base de Datos](./05-base-datos/)
- [Calidad y Verificación de Bugs](./06-calidad-verificacion-bugs/)
- [Rendimiento y Observabilidad](./07-rendimiento-observabilidad/)
- [Despliegue y CI/CD](./08-despliegue-ci-cd/)
- [Lanzamiento y Operaciones](./09-lanzamiento-operaciones/)
- [Rollback y Contingencia](./10-rollback-contingencia/)
- [Anexos](./11-anexos/)

## Principios Aplicados
- Cumplimiento estricto de `AGENTS.md` (pnpm, Serialización RSC, validación SIEMPRE en servidor, transacciones obligatorias, análisis de impacto obligatorio).
- Enfoque shift-left (seguridad y calidad temprana).
- Despliegue controlado, auditable y reversible.
- Verificación por consumidores (rutas afectadas + todos sus consumidores).
- Trazabilidad, integridad de reglas de negocio y auditoría de pujas.
