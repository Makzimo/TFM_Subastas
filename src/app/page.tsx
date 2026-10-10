import Link from "next/link";
import { getAssetsAction } from "@/app/actions/assets";
import { AssetCard } from "@/components/AssetCard";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const assets = await getAssetsAction({ status: "ACTIVO" });

  return (
    <main className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 text-sm text-neutral-400 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Plataforma de remates en tiempo real
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Remates de{" "}
              <span className="text-orange-500">alto rendimiento</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400">
              Vehículos y especies de colección. Pujá en tiempo real,
              adjudicate con confianza. La plataforma más transparente del
              mercado chileno.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/remates"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Ver Remates Activos
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {assets.length} lotes disponibles
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      </section>

      {/* Cómo funciona */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-orange-500">
              Cómo funciona
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Tres pasos para adjudicarte
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Explorá los lotes",
                desc: "Browse我们的catálogo de vehículos y especies de alto valor. Cada lote incluye fotos, precio base y detalles completos.",
                icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
              },
              {
                step: "02",
                title: "Pujá en tiempo real",
                desc: "Participá en remates activos con pujas instantáneas. El sistema garantiza integridad y transparencia total.",
                icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
              },
              {
                step: "03",
                title: "Adjudicate",
                desc: "Si tu puja es la ganadora, el proceso de adjudicación es seguro y auditado. Garantía de seriedad incluida.",
                icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.244-1.764.894-1.764 1.821 0 .927.768 1.577 1.764 1.821M18.75 4.236c.996.244 1.764.894 1.764 1.821 0 .927-.768 1.577-1.764 1.821M4.5 12h15",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-neutral-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Paso {item.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      </section>

      {/* Lotes destacados */}
      {assets.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-orange-500">
                  Disponibles ahora
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  Lotes destacados
                </h2>
              </div>
              <Link
                href="/remates"
                className="hidden text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:inline-flex items-center gap-1"
              >
                Ver todos
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.slice(0, 3).map((asset) => (
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
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/remates"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-400"
              >
                Ver todos los lotes
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
