"use client";

import { useActionState } from "react";
import { changeAssetStatusAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  assetId: string;
  assetStatus: string;
  approvalStatus: string;
}

export function ActivateAuctionButton({ assetId, assetStatus, approvalStatus }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async () => {
      const result = await changeAssetStatusAction(assetId, "ACTIVO");
      if (result.success) router.refresh();
      return result;
    },
    null
  );

  if (assetStatus === "ACTIVO") {
    return (
      <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
        El remate ya está activo
      </div>
    );
  }

  if (assetStatus !== "PENDIENTE") {
    return null;
  }

  if (approvalStatus !== "APROBADO") {
    return (
      <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
        Debes aprobar el lote antes de abrir el remate
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <form action={formAction}>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? "Abriendo remate..." : "Abrir Remate"}
        </Button>
      </form>
    </div>
  );
}
