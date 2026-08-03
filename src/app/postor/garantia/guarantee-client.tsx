"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GuaranteeStatus } from "@/components/GuaranteeStatus";
import { getPaymentMethodLabel } from "@/lib/payment-methods";

interface GuaranteeItem {
  id: string;
  isPaid: boolean;
  paymentDate: string | null;
  paymentMethod: string | null;
  amount: number;
  asset: {
    id: string;
    description: string;
    status?: string;
  } | null;
}

interface Props {
  guarantees: GuaranteeItem[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function GuaranteeClient({ guarantees }: Props) {
  if (guarantees.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Aún no ha solicitado garantías. La garantía es 1:1 por lote: debe
            solicitarla desde cada lote activo en el que quiera participar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {guarantees.map((g) => (
        <Card key={g.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium">
                  {g.asset?.description ?? "Lote eliminado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Monto: {formatCurrency(Number(g.amount))}
                </p>
                {g.paymentMethod && (
                  <p className="text-sm text-muted-foreground">
                    Método de pago: {getPaymentMethodLabel(g.paymentMethod)}
                  </p>
                )}
                {g.paymentDate && (
                  <p className="text-sm text-muted-foreground">
                    Aprobada:{" "}
                    {new Date(g.paymentDate).toLocaleDateString("es-CL")}
                  </p>
                )}
              </div>
              <GuaranteeStatus isPaid={g.isPaid ?? null} />
            </div>
            {g.asset && g.asset.status === "ACTIVO" && (
              <Link
                href={`/remates/${g.asset.id}`}
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Ir al lote →
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
