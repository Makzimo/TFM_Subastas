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
**Pendiente de decisión.** No bloquea el build ni el deploy, pero **sí bloquea la funcionalidad de subir imágenes** en producción.

## Recomendación
Aplicar **Opción A (Vercel Blob)** antes del go-live si la subida de imágenes es parte del alcance del lanzamiento. Si no es crítica para el primer lanzamiento, aplicar Opción C y agendar.
