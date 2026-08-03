import { getAdminStats, getRecentAssets } from "@/lib/stats";
import { StatCard } from "@/components/Filters";
import { AssetCard } from "@/components/AssetCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin | Plataforma de Remates",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const [stats, recentAssets] = await Promise.all([
    getAdminStats(),
    getRecentAssets(),
  ]);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="mb-8 text-muted-foreground">
          Vista general de la plataforma
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total de Lotes" value={stats.totalAssets} />
          <StatCard title="En Subasta (Activo)" value={stats.activeAssets} />
          <StatCard title="Total Pujas" value={stats.totalBids} />
          <StatCard
            title="Puja Más Alta"
            value={formatCurrency(stats.highestBid)}
          />
          <StatCard title="Usuarios" value={stats.totalUsers} />
          <StatCard
            title="Garantías Pendientes"
            value={stats.pendingGuarantees}
            description="Postores esperando verificación"
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lotes Recientes</h2>
          <a
            href="/admin/activos"
            className="text-sm text-primary hover:underline"
          >
            Ver todos →
          </a>
        </div>

        {recentAssets.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay lotes creados aún.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                id={asset.id}
                description={asset.description}
                basePrice={Number(asset.basePrice)}
                currentPrice={Number(asset.currentPrice)}
                status={asset.status}
                imageUrl={asset.imageUrl}
                bidCount={asset._count.bids}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
