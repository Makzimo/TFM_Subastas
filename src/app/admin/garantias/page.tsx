import { getAllGuaranteesAction } from "@/app/actions/guarantees";
import { GuaranteeItem } from "./guarantee-item";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantías | Admin",
};

export default async function AdminGarantiasPage() {
  const guarantees = await getAllGuaranteesAction();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Garantías de Seriedad
        </h1>
        <p className="mb-8 text-muted-foreground">
          Gestiona las garantías de los postores
        </p>

        {guarantees.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay garantías registradas aún.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {guarantees.map((g) => (
              <GuaranteeItem
                key={g.id}
                id={g.id}
                userName={g.user.name || ""}
                userEmail={g.user.email}
                assetDescription={g.asset?.description ?? null}
                amount={Number(g.amount)}
                isPaid={g.isPaid}
                paymentDate={g.paymentDate}
                paymentMethod={g.paymentMethod}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
