import { getAssetsAction } from "@/app/actions/assets";
import { AssetCard } from "@/components/AssetCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Remates | Plataforma de Remates",
  description:
    "Listado de remates de vehículos y especies de alto rendimiento",
};

export default async function RematesPage() {
  const assets = await getAssetsAction({ status: "ACTIVO" });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight">Remates Activos</h1>
        <p className="mt-2 text-muted-foreground">
          Vehículos y especies disponibles para puja
        </p>

        {assets.length === 0 ? (
          <div className="mt-8 rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay remates activos en este momento.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}