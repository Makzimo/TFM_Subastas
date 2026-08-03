"use client";

import { useActionState } from "react";
import { updateAssetAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MartilleroSelect } from "@/components/MartilleroSelect";
import { useRef, useState } from "react";
import Image from "next/image";
import type { SerializedAsset } from "@/lib/serialize";

interface MartilleroOption {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  asset: SerializedAsset;
  martilleros?: MartilleroOption[];
}

export function EditAssetForm({ asset, martilleros }: Props) {
  const [state, formAction, isPending] = useActionState(updateAssetAction, null);
  const [imageUrl, setImageUrl] = useState<string>(asset.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      setUploading(false);

      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.error || "Error al subir imagen");
      }
    } catch {
      setUploading(false);
      alert("Error al subir imagen");
    }
  }

  return (
    <>
      {state?.success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Lote actualizado correctamente
        </div>
      )}

      {state?.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={asset.id} />
        <input type="hidden" name="imageUrl" value={imageUrl} />

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción *
          </label>
          <Input
            id="description"
            name="description"
            required
            defaultValue={asset.description}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="basePrice" className="text-sm font-medium">
            Precio Base (CLP) *
          </label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            required
            min="1"
            step="1"
            defaultValue={Number(asset.basePrice)}
          />
        </div>

        {martilleros && (
          <div className="space-y-2">
            <label htmlFor="martilleroId" className="text-sm font-medium">
              Martillero asignado
            </label>
            <MartilleroSelect
              martilleros={martilleros}
              defaultValue={asset.martilleroId}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Imagen</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploading && (
            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
          )}
          {imageUrl && (
            <div className="mt-2">
              <p className="mb-1 text-sm text-green-600">Imagen cargada</p>
              <Image
                src={imageUrl}
                alt="Preview"
                width={400}
                height={225}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isPending || uploading}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </>
  );
}
