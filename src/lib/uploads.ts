import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

/** Dónde quedó almacenado el archivo. */
export type UploadStorage = "blob" | "local";

export interface StoredUpload {
  /** URL pública tal como debe guardarse en `Asset.imageUrl`. */
  url: string;
  /** Clave/relación dentro del almacenamiento. */
  pathname: string;
  storage: UploadStorage;
}

export interface StoreUploadInput {
  buffer: Buffer;
  contentType: string;
  originalName: string;
}

const BLOB_PREFIX = "activos";
const LOCAL_DIR = join(process.cwd(), "public", "uploads");

/** Genera una clave única, inmutable y sin caracteres de ruta. */
function buildKey(ext: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = randomBytes(6).toString("hex");
  return `${BLOB_PREFIX}/${stamp}-${rand}.${ext}`;
}

/** Extensión normalizada a partir del nombre original (solo [a-z0-9]). */
function safeExtension(originalName: string, fallback: string): string {
  const raw = originalName.split(".").pop() ?? fallback;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return cleaned || fallback;
}

function extFromContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Persiste un archivo de imagen.
 *
 * - **Producción:** usa Vercel Blob (`BLOB_READ_WRITE_TOKEN`), que es el único
 *   almacenamiento escribible en Vercel (el filesystem de la lambda es de solo
 *   lectura, ver `docs/incidencias/2026-10-10-uploads-vercel.md`).
 * - **Local:** si no hay token, escribe en `public/uploads` para no requerir
 *   infraestructura extra durante el desarrollo.
 */
export async function storeUpload({
  buffer,
  contentType,
  originalName,
}: StoreUploadInput): Promise<StoredUpload> {
  const ext = safeExtension(originalName, extFromContentType(contentType));
  const pathname = buildKey(ext);
  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  if (useBlob) {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      allowOverwrite: false,
    });
    return { url: blob.url, pathname: blob.pathname, storage: "blob" };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(join(LOCAL_DIR, pathname.replace(`${BLOB_PREFIX}/`, "")), buffer);
  return { url: `/uploads/${pathname.replace(`${BLOB_PREFIX}/`, "")}`, pathname, storage: "local" };
}
