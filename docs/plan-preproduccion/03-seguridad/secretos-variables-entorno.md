# Secretos y Variables de Entorno

## Política
- **Nunca commitear secretos.** `.env*` ignorados. Usar `.env.example` **completo y actualizado**.
- **Separación por entorno:** `.env.development`, `.env.staging/preprod`, `.env.production`. Sin mezcla.
- **Principio menor privilegio:** Credenciales DB con mínimos permisos (CRUD por schema, sin DDL excesivo fuera migraciones controladas).
- **Rotación:** Política definida. Revocar al rotar. Actualizar secretos en gestor (Vault/Secrets Manager) si aplica.

## Variables Críticas
| Variable | Propósito | Crítica | Observación |
|---|---|---|---|
| `DATABASE_URL` | Conexión Prisma/Postgres | **Sí** | Pooling (PgBouncer) recomendado prod. SSL requerido. |
| `AUTH_SECRET` | NextAuth | **Sí** | Generar fuerte. Rotar con cuidado. |
| `NEXTAUTH_URL` | NextAuth callback/base URL | **Sí** | Coincidir dominio prod. |
| `NODE_ENV` | Entorno | **Sí** | `production` en prod. |
| Webhook/Keys API | Externas | Según uso | Almacenar como secrets. No loguear. |

## Buenas Prácticas
- **Validación arranque:** Fail-fast si faltan vars críticas (evitar runtime failures tardíos).
- **No loguear:** Nunca imprimir `DATABASE_URL`, secrets en logs, build logs, errores.
- **Auditoría acceso:** Controlar quién accede a `.env` prod.
- **Zero-secret en repo:** Escanear historial si sospecha fuga (remediación documentada).
- **Gestor centralizado:** Recomendado (GitHub Actions Secrets, Doppler, Vault) vs archivos planos.

## Checklist `.env.example`
- [ ] Listar **todas** vars usadas (incluir comentarios sin valores reales).
- [ ] Marcar obligatorias vs opcionales.
- [ ] Documentar formato esperado (ej. `postgresql://...`).
- [ ] Sin secretos reales.