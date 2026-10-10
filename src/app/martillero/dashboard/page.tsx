import { getMartilleroStats } from "@/lib/stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Martillero | Plataforma de Remates",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function MartilleroDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getMartilleroStats(session.user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel del Martillero"
        description="Gestiona tus lotes de subasta"
      />

      <section>
        <h2 className="text-lg font-semibold mb-4">Resumen</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Mis Lotes"
            value={stats.myAssets}
            description="Lotes que administro"
          />
          <StatCard
            title="Lotes Activos"
            value={stats.activeAssets}
            description="En subasta ahora"
          />
          <StatCard
            title="Pujas Recibidas"
            value={stats.totalBidsOnMyAssets}
            description="En todos mis lotes"
          />
          <StatCard
            title="Últimos 6 Meses"
            value={stats.assetsLast6Months}
            description="Lotes creados"
          />
          <StatCard
            title="Último Mes"
            value={stats.assetsLastMonth}
            description="Lotes recientes"
          />
        </div>
      </section>

      {stats.last5Adjudicated.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos Remates Adjudicados</h2>
            <Link
              href="/martillero/activos"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.last5Adjudicated.map((asset) => (
              <Link key={asset.id} href={`/remates/${asset.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {asset.imageUrl ? (
                        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                          <Image
                            src={asset.imageUrl}
                            alt={asset.description}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          Sin img
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {asset.description}
                        </p>
                        <p className="mt-1 text-sm font-bold text-green-700">
                          {formatCurrency(asset.currentPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ganador: {asset.winnerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset.bidCount} pujas ·{" "}
                          {new Date(asset.closedAt).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {stats.last5Adjudicated.length === 0 &&
        stats.top5Adjudicadores.length === 0 && (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-muted-foreground">
              Aún no tienes remates adjudicados. Las métricas aparecerán cuando se cierren remates con ganador.
            </p>
          </div>
        )}

      {stats.top5Adjudicadores.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Top 5 Adjudicadores
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {stats.top5Adjudicadores.map((bidder, index) => (
                  <div
                    key={bidder.userId}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                            ? "bg-slate-400"
                            : index === 2
                              ? "bg-amber-700"
                              : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {bidder.userName || bidder.userEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bidder.winCount}{" "}
                        {bidder.winCount === 1 ? "remate ganado" : "remates ganados"}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {formatCurrency(bidder.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
