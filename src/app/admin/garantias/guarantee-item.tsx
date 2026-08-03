"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateGuaranteeStatusAction } from "@/app/actions/guarantees";
import { Button } from "@/components/ui/button";
import { GuaranteeStatus } from "@/components/GuaranteeStatus";
import { getPaymentMethodLabel } from "@/lib/payment-methods";

interface GuaranteeItemProps {
  id: string;
  userName: string;
  userEmail: string;
  assetDescription: string | null;
  amount: number;
  isPaid: boolean;
  paymentDate: Date | null;
  paymentMethod: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function GuaranteeItem({
  id,
  userName,
  userEmail,
  assetDescription,
  amount,
  isPaid,
  paymentDate,
  paymentMethod,
}: GuaranteeItemProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const newStatus = formData.get("isPaid") === "true";
      const result = await updateGuaranteeStatusAction(id, newStatus);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{userName || userEmail}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <GuaranteeStatus isPaid={isPaid} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Lote: {assetDescription ?? "Sin lote"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          Monto: {formatCurrency(Number(amount))}
        </span>
        <span className="flex items-center gap-2">
          {paymentDate && (
            <span className="text-muted-foreground">
              Aprobada: {new Date(paymentDate).toLocaleDateString("es-CL")}
            </span>
          )}
          {paymentMethod && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {getPaymentMethodLabel(paymentMethod)}
            </span>
          )}
        </span>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        {!isPaid ? (
          <form action={formAction}>
            <input type="hidden" name="isPaid" value="true" />
            <Button size="sm" type="submit" disabled={isPending}>
              Aprobar
            </Button>
          </form>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="isPaid" value="false" />
            <Button
              size="sm"
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              Revocar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
