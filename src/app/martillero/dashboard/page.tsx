import { getMartilleroStats } from "@/lib/stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { StatCard } from "@/components/Filters";
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
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Panel del Martillero
        </h1>
        <p className="mb-8 text-muted-foreground">
          Gestiona tus lotes de subasta
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard title="Mis Lotes" value={stats.myAssets} />
          <StatCard title="Lotes Activos" value={stats.activeAssets} />
          <StatCard title="Pujas Recibidas" value={stats.totalBidsOnMyAssets} />
          <StatCard title="Últimos 6 Meses" value={stats.assetsLast6Months} />
          <StatCard title="Último Mes" value={stats.assetsLastMonth} />
        </div>

        {stats.last5Adjudicated.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Últimos Remates Adjudicados</h2>
              <Link
                href="/martillero/activos"
                className="text-sm text-primary hover:underline"
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
          </div>
        )}

        {stats.last5Adjudicated.length === 0 &&
          stats.top5Adjudicadores.length === 0 && (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">
                Aún no tienes remates adjudicados. Las métricas aparecerán cuando se cierren remates con ganador.
              </p>
            </div>
          )}

        {stats.top5Adjudicadores.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">
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
          </div>
        )}
      </div>
    </main>
  );
}
