# Estrategia de Branching y Release

## Ramas
| Rama | Propósito | Protegida |
|---|---|---|
| `main` | Producción (única fuente estable desplegable). Solo merges aprobados (release/hotfix). | Sí |
| `develop` | Integración continua (sugerido). | Recomendada |
| `release/*` | Freeze/RC para estabilizar corte (ej. `release/v1.2.0`). | Sí |
| `feature/*` | Desarrollo por funcionalidad. | No |
| `fix/*` | Bugs no críticos. | No |
| `hotfix/*` | Bugs críticos producción. Merge directo a `main` + backport a `develop/release`. | Sí |

## Estrategia Recomendada
**Git Flow simplificado** (o Trunk-based + Release Branch). Ventaja: estabilización RC clara, gates estrictos y control freeze.

## Versionado Semántico (SemVer)
- **MAJOR (X):** Breaking changes (cambio contrato incompatible, migraciones no aditivas con ruptura).
- **MINOR (Y):** Nueva funcionalidad retrocompatible.
- **PATCH (Z):** Bug fixes retrocompatibles, seguridad, mejoras menores.
- **Pre-releases:** `vX.Y.Z-rc.1`, `vX.Y.Z-beta.1` si aplica.

## Tags y Releases
- Tag `vX.Y.Z` en `main` **únicamente** tras despliegue exitoso a Producción.
- Release Notes generados desde `CHANGELOG.md` (sección correspondiente a versión).
- Firmado/registrado (recomendado).

## Flujo de Release
1. Feature freeze → crear `release/vX.Y.Z`.
2. Estabilizar (solo fixes críticos). Ejecutar regresión completa + preflight.
3. CI verde + checklist Go/No-Go OK.
4. Merge a `main` → Tag `vX.Y.Z` → Deploy Prod.
5. Merge back a `develop` (si existe). Cerrar release.
6. Hotfix: `hotfix/vX.Y.Z+1` → `main` + tag + backport.