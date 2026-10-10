# Scripts de Verificación

## Comandos Obligatorios (Proyecto - Usar pnpm EXCLUSIVO)

```bash
# 1. Verificación estática completa (Obligatoria - AGENTS.md §5)
pnpm check  # Equivale a: tsc --noEmit + eslint src/

# 2. Tests
pnpm test

# 3. Build de Producción
pnpm build

# 4. Auditoría Seguridad Dependencias (BLOQUEANTE Go/No-Go)
pnpm audit --audit-level=high

# 5. Validación Prisma
pnpm prisma validate
pnpm prisma generate

# 6. Formato Prisma (opcional/consistencia)
pnpm prisma format

# 7. Ver migraciones estado (inspección)
# En entorno local/dev
pnpm prisma migrate status

# 8. Health Check Post-Deploy
curl -f https://<dominio-produccion>/api/health || exit 1

# 9. Verificación TypeScript estricta (aislada)
npx tsc --noEmit

# 10. ESLint src/
npx eslint src/
```

## Scripts de Pre-Flight (Recomendados)

```bash
# Pipeline pre-flight completo (fail-fast)
set -e
pnpm install --frozen-lockfile
pnpm prisma validate
pnpm prisma generate
pnpm check
pnpm test
pnpm build
pnpm audit --audit-level=high
echo "✅ Pre-flight OK"
```

## Notas Importantes
- **Único gestor:** `pnpm`. Prohibido `npm` o `yarn`.
- `--frozen-lockfile` **obligatorio** en CI.
- `pnpm audit --audit-level=high` = **0 High/Critical** requerido.
- **Análisis de Impacto Obligatorio** (§5 AGENTS.md): Ejecutar **antes** de cualquier edición de código (fuera de este plan). Listar consumidores + verificar fronteras RSC + smoke consumidores tras cambio.
- **Regla Serialización RSC:** Verificar `Decimal→number`, `Date→ISO` en `lib/serialize.ts` y fronteras afectadas.

## Checklist Ejecución Scripts
- [ ] `pnpm check` → 0 errores
- [ ] `pnpm test` → OK
- [ ] `pnpm build` → OK
- [ ] `pnpm audit --audit-level=high` → 0 High/Critical
- [ ] `pnpm prisma validate` → OK
- [ ] Health check 200 estable post-deploy