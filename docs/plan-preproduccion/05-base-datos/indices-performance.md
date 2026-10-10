# Índices y Performance de Base de Datos

## Enfoque
Optimizar consultas críticas de subasta (lecturas sala tiempo real + escrituras TX) sin introducir riesgo en migraciones.

## Consultas Críticas a Revisar
- Búsqueda/lectura última puja por lote/subasta.
- Listado activos/subastas por estado.
- Validaciones garantía (`BidderGuarantee` por userId/auction/estado).
- Actualizaciones estado lote/subasta (dentro TX).
- Paginación listados (evitar scans completos).

## Recomendaciones
- **Revisar índices existentes** vs patrones de consulta. Añadir selectivos si faltan.
- **Evitar índices redundantes** (sobrecarga escrituras).
- **Índices compuestos** por columnas filtro + orden (covering si posible).
- **Foreign Keys + índices** para joins críticos.
- **Migraciones seguras:** Crear índices grandes con estrategia online (Postgres: `CREATE INDEX CONCURRENTLY` cuando no bloquea escrituras críticas). Considerar ventana si requiere `CONCURRENTLY` fuera de TX migración o estrategia específica Prisma.

## Validación Performance
- **Preprod con volúmenes representativos.** Usar `EXPLAIN ANALYZE` en queries críticas.
- **Detectar N+1:** Revisar queries Prisma (select, includes). Optimizar includes/selectivos.
- **Pool/conexiones:** Verificar under/over-utilization.
- **Umbrales:** Definir aceptables (TTFB/latencia TX) antes de prod.

## Checklist
- [ ] EXPLAIN ANALYZE en top 5 queries crítico (Preprod)
- [ ] Índices necesarios identificados/aplicados
- [ ] N+1 revisado (Server Actions/Components servidor)
- [ ] Migración índices segura (sin bloqueo prolongado crítico)
- [ ] Performance aceptable vs baseline

## Notas Prisma
Al añadir índices: reflejar en `schema.prisma` (@@index, @unique) + migración. Evaluar `CREATE INDEX CONCURRENTLY` (requiere cuidado fuera de bloque migración transaccional estándar). Documentar estrategia si aplica.