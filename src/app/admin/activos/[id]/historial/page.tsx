import { notFound, redirect } from "next/navigation";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getBidsByAssetAction } from "@/app/actions/bids";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";


interface Props {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HistorialPujasPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const { id } = await params;
  const [asset, bids] = await Promise.all([
    getAssetByIdAction(id),
    getBidsByAssetAction(id),
  ]);

  if (!asset) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <a
            href={`/admin/activos/${id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver al lote
          </a>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Historial de Pujas</h1>
          <p className="mt-1 text-muted-foreground">{asset.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pujas registradas ({bids.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No hay pujas registradas para este lote.
              </p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      bid.isWinning ? "border-green-200 bg-green-50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {bid.user.name || bid.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.createdAt).toLocaleString("es-CL")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${bid.isWinning ? "text-green-600" : ""}`}>
                        {formatCurrency(Number(bid.amount))}
                      </p>
                      {bid.isWinning && (
                        <span className="text-xs font-medium text-green-600">
                          Puja ganadora
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
