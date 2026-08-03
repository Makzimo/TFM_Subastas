"use client";

import { useActionState } from "react";
import { approveAssetAction, rejectAssetAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  assetId: string;
  currentStatus: string;
}

export function ApprovalButtons({ assetId, currentStatus }: Props) {
  const router = useRouter();
  const [approveState, approveAction, approvePending] = useActionState(
    async () => {
      const result = await approveAssetAction(assetId);
      if (result.success) router.refresh();
      return result;
    },
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    async () => {
      const result = await rejectAssetAction(assetId);
      if (result.success) router.refresh();
      return result;
    },
    null
  );

  const isPending = approvePending || rejectPending;

  if (currentStatus === "APROBADO") {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
        Aprobado{approveState?.success ? " correctamente" : ""}
      </div>
    );
  }

  if (currentStatus === "RECHAZADO") {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
        Rechazado{rejectState?.success ? " correctamente" : ""}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(approveState?.error || rejectState?.error) && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {approveState?.error || rejectState?.error}
        </div>
      )}
      <div className="flex gap-2">
        <form action={approveAction}>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {approvePending ? "Aprobando..." : "Aprobar"}
          </Button>
        </form>
        <form action={rejectAction}>
          <Button
            type="submit"
            disabled={isPending}
            variant="destructive"
          >
            {rejectPending ? "Rechazando..." : "Rechazar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
