import { getAdminStats, getRecentAssets } from "@/lib/stats";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { AssetCard } from "@/components/AssetCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="space-y-8">
      <PageHeader
        title="Panel de Administración"
        description="Vista general de la plataforma de remates"
      />

      <section>
        <h2 className="text-lg font-semibold mb-4">Resumen</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de Lotes"
            value={stats.totalAssets}
            description="Todos los lotes creados"
          />
          <StatCard
            title="En Subasta"
            value={stats.activeAssets}
            description="Lotes con remate activo"
          />
          <StatCard
            title="Total Pujas"
            value={stats.totalBids}
            description="Pujas realizadas en total"
          />
          <StatCard
            title="Puja Más Alta"
            value={formatCurrency(stats.highestBid)}
            description="Mayor puja registrada"
          />
          <StatCard
            title="Usuarios"
            value={stats.totalUsers}
            description="Usuarios registrados"
          />
          <StatCard
            title="Garantías Pendientes"
            value={stats.pendingGuarantees}
            description="Postores esperando verificación"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lotes Recientes</h2>
          <Link
            href="/admin/activos"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {recentAssets.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-muted-foreground">
              No hay lotes creados aún.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                martilleroName={asset.martillero?.name ?? asset.martillero?.email}
                href={`/admin/activos/${asset.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
