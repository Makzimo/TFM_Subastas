import { getAllGuaranteesAction } from "@/app/actions/guarantees";
import { GuaranteeItem } from "./guarantee-item";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantías | Admin",
};

export default async function AdminGarantiasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const guarantees = await getAllGuaranteesAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Garantías de Seriedad
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las garantías de los postores
        </p>
      </div>

      {guarantees.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
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
  );
}
