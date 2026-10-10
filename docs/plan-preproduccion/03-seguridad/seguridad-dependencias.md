# Seguridad de Dependencias (SCA)

## Auditoría Obligatoria
- **Comando:** `pnpm audit --audit-level=high`
- **Gate bloqueante:** **Cero CVEs High/Critical** antes de GO (criterio obligatorio).
- **Ejecución:** CI (preflight) + local pre-release.

## Gestión de Vulnerabilidades
1. **Detección:** Auditoría en cada RC.
2. **Clasificación:** High/Critical = bloqueantes. Medium = evaluar (riesgo vs esfuerzo).
3. **Remediación:** Actualizar paquete afectado (mínimo parche seguro). Preferir fix vs workaround.
4. **Excepción:** Solo si sin parche + mitigación + aprobación Tech Lead + registrado (riesgo aceptado temporal). **Evitar** en producción crítica.
5. **Verificación:** Re-run audit + tests + build tras fix.

## Supply Chain
- **Lockfile:** `pnpm-lock.yaml` **congelado** en CI (`--frozen-lockfile`).
- **Revisar diffs lockfile:** Revisar PRs con cambios lock sospechosos.
- **Fuentes confiables:** Usar registry oficial. Evitar paquetes deprecated/unmaintained.
- **Transitive deps:** Revisar árbol si CVE profundo (pnpm permite auditoría).
- **SBOM (recomendado):** Generar inventario dependencias críticas (trazabilidad).

## Buenas Prácticas
- **Actualizaciones controladas:** Renovate/Dependabot (recomendado) con PRs pequeños.
- **Pinning mínimo:** Evitar ranges peligrosos. Preferir actualizaciones parciales evaluadas.
- **Minimizar dependencias:** Eliminar no usadas (reducción superficie ataque).

## Checklist
- [ ] `pnpm audit --audit-level=high` → 0
- [ ] Lockfile íntegro, sin cambios no justificados
- [ ] Dependencias deprecated revisadas
- [ ] Parches aplicados verificados (build+tests)