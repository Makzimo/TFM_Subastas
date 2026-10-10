import { getPostorStats } from "@/lib/stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { GuaranteeStatus } from "@/components/GuaranteeStatus";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Postor | Plataforma de Remates",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACTIVO: "Activo",
  ADJUDICADO: "Adjudicado",
  DESIERTO: "Desierto",
};

export default async function PostorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getPostorStats(session.user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi Panel"
        description="Historial de participaciones y pujas"
      />

      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Resumen</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Mis Pujas"
            value={stats.myBids}
            description="Pujas realizadas"
          />
          <StatCard
            title="Pujas Ganadoras"
            value={stats.winningBids}
            description="Lotes que estoy ganando"
          />
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <p className="text-sm font-medium text-neutral-400 mb-2">Garantía</p>
            <GuaranteeStatus isPaid={stats.myGuarantee?.isPaid ?? null} />
            <Link
              href="/postor/garantia"
              className="inline-block mt-3 text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              Gestionar garantía →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Historial de Pujas</h2>

        {stats.recentBids.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
            <p className="text-neutral-400">
              Aún no has realizado ninguna puja.
            </p>
            <Link
              href="/remates"
              className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300 font-medium"
            >
              Explorar remates →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentBids.map((bid) => (
              <Link key={bid.id} href={`/remates/${bid.assetId}`}>
                <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:bg-neutral-800/50">
                  <div>
                    <p className="font-medium text-white">{bid.asset.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[bid.asset.status] ?? bid.asset.status}
                      </Badge>
                      {bid.isWinning && (
                        <Badge className="text-xs bg-orange-500">Ganando</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {formatCurrency(Number(bid.amount))}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(bid.createdAt).toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
