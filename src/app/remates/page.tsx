import { getAssetsAction } from "@/app/actions/assets";
import { AssetCard } from "@/components/AssetCard";
import { Footer } from "@/components/Footer";
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
    <main className="min-h-screen bg-black">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Remates Activos
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-neutral-400">
            Vehículos y especies disponibles para puja en tiempo real
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-sm font-medium text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              {assets.length}{" "}
              {assets.length === 1 ? "lote" : "lotes"} disponibles
            </span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {assets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 px-6 py-16 text-center">
              <svg
                className="mx-auto h-12 w-12 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-white">
                No hay remates activos
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                En este momento no hay lotes disponibles para puja.
                <br />
                Vuelve pronto para ver nuevas oportunidades.
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
                  showLiveButton
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
