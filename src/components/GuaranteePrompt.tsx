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
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-400">
              Solicitud de garantía enviada
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              {method
                ? `Pago solicitado vía ${getPaymentMethodLabel(method)}. `
                : ""}
              La garantía para este lote quedó registrada y será revisada por un
              administrador. Podrá pujar una vez sea aprobada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {createState?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          {createState.error}
        </div>
      )}

      <p className="text-sm leading-relaxed text-neutral-400">
        Para pujar en este lote, presente una garantía de seriedad de{" "}
        <span className="font-semibold text-white">
          {formatCurrency(500000)}
        </span>
        . La solicitud queda sujeta a la aprobación del administrador.
      </p>

      <form action={createFormAction}>
        <input type="hidden" name="assetId" value={assetId} />
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Método de pago
          </legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-sm transition-colors hover:border-neutral-600 has-[:checked]:border-orange-500/50 has-[:checked]:bg-orange-500/5"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                defaultChecked={method.value === PAYMENT_METHODS[0].value}
                className="h-4 w-4 accent-orange-500"
              />
              <span className="font-medium text-neutral-300">
                {method.label}
              </span>
            </label>
          ))}
        </fieldset>
        <Button
          type="submit"
          disabled={createPending}
          className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {createPending
            ? "Procesando pago..."
            : `Pagar garantía de ${formatCurrency(500000)}`}
        </Button>
      </form>
    </div>
  );
}
