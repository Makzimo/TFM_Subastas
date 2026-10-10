# Gestión de Cambios

## Principios
- **Análisis de Impacto Obligatorio (§5 AGENTS.md):** Antes de modificar CUALQUIER componente, página o Server Action:
  1. Buscar **todos** los archivos que lo importan, llaman o reciben sus props/return (grep/glob/tools).
  2. Listar consumidores. Si N páginas/componentes → revisar **cada uno**.
  3. Verificar **fronteras RSC:** props Server→Client y `data:` server actions → objetos planos (serialización). Sin `Decimal/Date`.
  4. Tras cambio → ejecutar **checklist completo** (§5 AGENTS.md): `pnpm check`, `pnpm test`, `pnpm build` + **smoke test ruta afectada Y TODOS sus consumidores**.

## Flujo
1. **Propuesta**: Issue/PR con alcance claro.
2. **Impacto**: Adjuntar listado de consumidores + fronteras RSC verificadas.
3. **Implementación**: Cumplir convenciones (tipado estricto, DRY, sin `any`, lógica en `lib/auction-engine.ts`).
4. **Verificación**: Checklist obligatorio antes de merge.
5. **Documentación**: Actualizar `CHANGELOG.md` (Keep a Changelog, orden inverso). Registrar decisiones arquitectónicas en `/docs`.
6. **Aprobación**: Review mínimo + validación gates CI.

## Feature Freeze
- Solo **fixes críticos/blockantes**.
- Requiere justificación + análisis impacto + aprobación Tech Lead.
- Prohibido scope creep.

## Trazabilidad
- PR debe enlazar issue + referencia consumidores verificados.
- Cambios en contratos (props/exports/server actions) deben destacar explícitamente en PR description.