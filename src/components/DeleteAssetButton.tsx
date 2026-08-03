"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAssetAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";

interface Props {
  assetId: string;
  assetDescription: string;
  redirectTo?: string;
}

export function DeleteAssetButton({ assetId, assetDescription, redirectTo }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el lote "${assetDescription}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);

    const result = await deleteAssetAction(assetId);

    if (result.success) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.back();
      }
    } else {
      setError(result.error || "Error al eliminar");
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Eliminando..." : "Eliminar Lote"}
      </Button>
    </div>
  );
}
