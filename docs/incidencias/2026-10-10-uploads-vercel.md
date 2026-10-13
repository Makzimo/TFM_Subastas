# Bloqueante Producción - Subida de Imágenes en Vercel

## Fecha
2026-10-10

## Severidad
**Alta (bloqueante funcional para producción en Vercel).**

## Descripción
El endpoint `src/app/api/uploads/route.ts` guarda archivos en `public/uploads` usando `fs/promises`:

```ts
const uploadDir = join(process.cwd(), "public", "uploads");
await writeFile(filepath, buffer);
```

En **Vercel**, el sistema de archivos del runtime es **de solo lectura** (excepto `/tmp`, que es efímero y no persistente). Por lo tanto:
- La subida de imágenes **fallará** en producción.
- Aunque funcionara, el archivo desaparecería al reiniciar la función.

En **local** sigue funcionando sin cambios.

## Impacto
Los roles `ADMINISTRATIVO` y `MARTILLERO` no podrán subir imágenes de activos en producción.

## Opciones de solución

### Opción A (recomendada) - Vercel Blob
- Instalar `@vercel/blob`.
- Cambiar `route.ts` para usar `put()` de Vercel Blob.
- Vercel provisiona automáticamente `BLOB_READ_WRITE_TOKEN`.
- Plan Hobby: 1 GB storage gratis.
- **Ventaja:** oficial, simple, integrado con Vercel.

### Opción B - Servicio externo (Cloudinary / S3 / Supabase Storage)
- Más control, pero más configuración.

### Opción C - Diferir
- Lanzar sin subida de imágenes y usar URLs externas (picsum.photos ya permitido en `next.config.ts`).
- Documentar como deuda técnica.

## Estado
**RESUELTO (2026-10-12, v0.16.4) — Opción A aplicada (Vercel Blob).**

### Implementación
- `src/lib/uploads.ts` — nueva abstracción `storeUpload({ buffer, contentType, originalName })`:
  - Si existe `BLOB_READ_WRITE_TOKEN` → `put()` de `@vercel/blob` con `access: "public"`, clave única en `activos/<ISO8601>-<random>.<ext>` y `allowOverwrite: false`.
  - Sin token (desarrollo local) → escribe en `public/uploads`, para no exigir infraestructura adicional en local.
  - Devuelve `{ url, pathname, storage }`; la ruta persiste solo `url` en `Asset.imageUrl`.
- `src/app/api/uploads/route.ts` — delega el almacenamiento en `storeUpload()`; mantiene autorización (solo `ADMINISTRATIVO`/`MARTILLERO`), MIME allow-list (`image/jpeg|png|webp`), límite de 5 MB y manejo de errores con `console.error`.
- `next.config.ts` — `images.remotePatterns` ampliado con `**.public.blob.vercel-storage.com` (requerido porque `AssetCard` usa `next/image`).
- `.env.example` — documentada `BLOB_READ_WRITE_TOKEN`.

### Impacto en consumidores
Ninguno rompe. `Asset.imageUrl` sigue siendo un `string` y los tres formularios que llaman a `/api/uploads` (`admin/activos/nuevo`, `admin/activos/[id]/edit-form`, `martillero/activos/nuevo`) consumen `res.json().url` sin cambios. Las URLs absolutas de Blob funcionan igual en `<img src>` y en `next/image`.

### Acción pendiente sobre infraestructura
Crear el store de Blob en el panel de Vercel (→ *Storage* → *Blob*) y añadir `BLOB_READ_WRITE_TOKEN` al entorno. Sin esa variable, la app sigue funcionando pero en modo local (`public/uploads`), que en Vercel **fallará** al escribir.

## Recomendación
Aplicar **Opción A (Vercel Blob)** antes del go-live si la subida de imágenes es parte del alcance del lanzamiento. Si no es crítica para el primer lanzamiento, aplicar Opción C y agendar.
