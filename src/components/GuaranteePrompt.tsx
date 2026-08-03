"use client";

import { useActionState } from "react";
import { createGuaranteeAction } from "@/app/actions/guarantees";
import { PAYMENT_METHODS, getPaymentMethodLabel } from "@/lib/payment-methods";
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  assetId: string;
}

export function GuaranteePrompt({ assetId }: Props) {
  const [createState, createFormAction, createPending] = useActionState(
    createGuaranteeAction,
    null
  );

  if (createState?.success) {
    const method = (createState.data as { paymentMethod?: string } | undefined)
      ?.paymentMethod;
    return (
      <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Solicitud de garantía enviada</p>
        <p className="mt-1 text-amber-700">
          {method ? `Pago solicitado vía ${getPaymentMethodLabel(method)}. ` : ""}
          La garantía para este lote quedó registrada y será revisada por un
          administrador. Podrá pujar una vez sea aprobada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {createState?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {createState.error}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Para pujar en este lote, presente una garantía de seriedad de{" "}
        {formatCurrency(500000)}. La solicitud queda sujeta a la aprobación del
        administrador.
      </p>
      <form action={createFormAction}>
        <input type="hidden" name="assetId" value={assetId} />
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">
            Elija su método de pago
          </legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                defaultChecked={method.value === PAYMENT_METHODS[0].value}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-medium">{method.label}</span>
            </label>
          ))}
        </fieldset>
        <Button
          type="submit"
          disabled={createPending}
          className="mt-3 w-full bg-green-600 hover:bg-green-700"
        >
          {createPending
            ? "Procesando pago..."
            : `Pagar garantía de ${formatCurrency(500000)}`}
        </Button>
      </form>
    </div>
  );
}
