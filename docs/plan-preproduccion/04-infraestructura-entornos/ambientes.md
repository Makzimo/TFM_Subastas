# Ambientes

## Definición de Ambientes

| Ambiente | Propósito | DB | Datos | Parecido a Prod |
|---|---|---|---|---|
| **Local** | Desarrollo diario | Dev/local | Sintéticos | Bajo |
| **Dev** | Integración features | Aislada | Anónimos/sintéticos | Parcial |
| **Staging/Preprod** | **Validación final, regresión, smoke, migraciones dry-run** | Preprod (mirror/subset representativo) | Enmascarados/representativos | **Máximo (idéntico posible)** |
| **Producción (Prod)** | Vivo | Prod | Reales | — |

## Principio Clave
**Preproducción debe ser lo más parecida posible a Producción** (infraestructura, configuración, versiones de Node, build, variables, topología, límites). Esto reduce riesgo de "funciona en staging, falla en prod".

## Datos
- Preprod: subset representativo (volúmenes/lotes similares) con PII enmascarado. Nunca dumps completos sin anonimizar si política restrictiva.
- Tests: aislados, auto-limpieza entre suites.

## Gobernanza
- Promoción controlada: Dev → Preprod (RC) → Prod (aprobación Go/No-Go).
- No promover código no verificado. Gates CI obligatorios.