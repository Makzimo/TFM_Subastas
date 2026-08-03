import Link from "next/link";
import { getAssetsWithApprovalAction } from "@/app/actions/assets";
import { AssetCard } from "@/components/AssetCard";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lotes | Admin",
};

export default async function AdminActivosPage({
  searchParams,
}: {
  searchParams: Promise<{ approval?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const params = await searchParams;
  const approvalFilter = params.approval;

  const assets = await getAssetsWithApprovalAction({
    approvalStatus: approvalFilter as "PENDIENTE" | "APROBADO" | "RECHAZADO" | undefined,
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lotes</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los lotes de subasta
            </p>
          </div>
          <Link href="/admin/activos/nuevo">
            <Button>Nuevo Lote</Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/activos">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                !approvalFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </span>
          </Link>
          <Link href="/admin/activos?approval=PENDIENTE">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                approvalFilter === "PENDIENTE"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Pendientes
            </span>
          </Link>
          <Link href="/admin/activos?approval=APROBADO">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                approvalFilter === "APROBADO"
                  ? "bg-green-100 text-green-800"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Aprobados
            </span>
          </Link>
          <Link href="/admin/activos?approval=RECHAZADO">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                approvalFilter === "RECHAZADO"
                  ? "bg-red-100 text-red-800"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Rechazados
            </span>
          </Link>
        </div>

        {assets.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay lotes{approvalFilter ? ` con estado ${approvalFilter.toLowerCase()}` : ""} aún.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                id={asset.id}
                description={asset.description}
                basePrice={Number(asset.basePrice)}
                currentPrice={Number(asset.currentPrice)}
                status={asset.status}
                imageUrl={asset.imageUrl}
                bidCount={asset._count.bids}
                approvalStatus={asset.approvalStatus}
                martilleroName={asset.martillero.name || asset.martillero.email}
                href={`/admin/activos/${asset.id}`}
                showLiveButton
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
