import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storeUpload } from "@/lib/uploads";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user || (role !== "ADMINISTRATIVO" && role !== "MARTILLERO")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido (solo JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo excede 5MB" }, { status: 400 });
    }

    const { url } = await storeUpload({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      originalName: file.name,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[uploads] Error al subir archivo:", error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
