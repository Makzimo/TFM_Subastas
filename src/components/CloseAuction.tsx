"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { closeAuctionAction } from "@/app/actions/bids";
import { Button } from "@/components/ui/button";

interface CloseAuctionProps {
  assetId: string;
}

export function CloseAuction({ assetId }: CloseAuctionProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, _fd: FormData) => {
      const result = await closeAuctionAction(assetId);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <div className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Cerrando..." : "Cerrar Remate"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Al cerrar, el lote se adjudicará al ganador o quedará desierto.
      </p>
    </div>
  );
}
