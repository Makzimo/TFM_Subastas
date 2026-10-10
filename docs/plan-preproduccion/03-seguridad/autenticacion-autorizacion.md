# Autenticación y Autorización (RBAC)

## Autenticación (NextAuth.js)
- **Proveedor/Callbacks:** Revisar configuración, JWT vs Session, expiración, renovación.
- **Seguridad sesión:** Logout seguro, invalidación, detección cambio rol, rotación tokens si aplica.
- **URLs/Secrets:** `NEXTAUTH_URL`, `AUTH_SECRET` configurados por entorno. Nunca hardcode.
- **Fallo arranque:** Validar vars críticas.

## RBAC (Roles)
| Rol | Permisos Críticos | Validación Servidor |
|---|---|---|
| `ADMINISTRATIVO` | Gestión usuarios/activos (operativa). | Sí (Server Actions + checks). |
| `MARTILLERO` | **Cierre manual** de lotes, gestión subasta, supervisión. **NO debe pujar** (validar). | Sí (acción `closeLot`/equivalentes). |
| `POSTOR` | Pujar **únicamente** con garantía `isPaid: true`. Ver `GuaranteePrompt` si pendiente. | Sí (pre-check + TX). |

## Principios de Autorización
- **Nunca confiar en cliente.** Toda verificación en **servidor** (Server Actions, route handlers).
- **Principio menor privilegio.**
- **Checks centralizados:** Evitar checks dispersos en componentes cliente.
- **Protección de rutas:** Middleware + validación por rol + defensa en profundidad.
- **Fail-closed** por defecto (denegar si ambiguo).

## Recomendaciones
- **MFA**: Evaluar para `MARTILLERO`/`ADMINISTRATIVO` (registrar decisión: implementar/postponer + justificación).
- **Auditoría:** Loguear acciones sensibles (cierre manual, cambios rol) con correlación.
- **Revocación:** Invalidar sesión al cambiar permisos/rol.