import { notFound } from "next/navigation";
import Image from "next/image";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getMyGuaranteeForAssetAction } from "@/app/actions/guarantees";
import { getLatestBidsAction } from "@/app/actions/bids";
import { AuctionRoom } from "@/components/AuctionRoom";
import { CloseAuction } from "@/components/CloseAuction";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACTIVO: "Activo",
  ADJUDICADO: "Adjudicado",
  DESIERTO: "Desierto",
};

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "border-neutral-700 text-neutral-400",
  ACTIVO: "border-emerald-500/30 text-emerald-400",
  ADJUDICADO: "border-blue-500/30 text-blue-400",
  DESIERTO: "border-red-500/30 text-red-400",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAssetByIdAction(id);
  if (!asset) return { title: "Lote no encontrado" };
  return { title: `${asset.description} | Remates` };
}

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const [asset, session, guarantee, bids] = await Promise.all([
    getAssetByIdAction(id),
    auth(),
    getMyGuaranteeForAssetAction(id),
    getLatestBidsAction(id, 5),
  ]);

  if (!asset) {
    notFound();
  }

  const latestBid = asset.bids[0];

  const guaranteeState: "none" | "pending" | "paid" = guarantee
    ? guarantee.isPaid
      ? "paid"
      : "pending"
    : "none";

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-6">
          <a
            href="/remates"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-white"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al listado
          </a>
        </nav>

        <div className="grid grid-cols-12 items-start gap-6">
          {/* Col 1 — Imagen + detalles */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {asset.imageUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={asset.imageUrl}
                    alt={asset.description}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-800">
                  <svg
                    className="h-16 w-16 text-neutral-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-lg font-bold leading-snug text-white">
                  {asset.description}
                </h1>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[asset.status] ?? "border-neutral-700 text-neutral-400"}`}
                >
                  {STATUS_LABELS[asset.status] ?? asset.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-neutral-800/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Base
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-300 tabular-nums">
                    {formatCurrency(Number(asset.basePrice))}
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-800/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Actual
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white tabular-nums">
                    {formatCurrency(Number(asset.currentPrice))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  {asset.martillero?.name ||
                    asset.martillero?.email ||
                    "Sin asignar"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  {new Date(asset.createdAt).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {asset.status === "ACTIVO" &&
              ((session?.user?.role === "MARTILLERO" &&
                session?.user?.id === asset.martilleroId) ||
                session?.user?.role === "ADMINISTRATIVO") && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
                    Zona de peligro
                  </h3>
                  <p className="mb-3 text-xs text-neutral-500">
                    Cerrar el remate es irreversible.
                  </p>
                  <CloseAuction assetId={asset.id} />
                </div>
              )}
          </div>

          {/* Col 2+3 — AuctionRoom */}
          <AuctionRoom
            assetId={asset.id}
            initialPrice={Number(asset.currentPrice)}
            initialBidCount={asset._count?.bids ?? 0}
            initialWinner={latestBid?.user ?? null}
            status={asset.status}
            userRole={session?.user?.role ?? null}
            guaranteeState={guaranteeState}
            initialBids={bids.map((b) => ({
              id: b.id,
              amount: Number(b.amount),
              user: b.user
                ? {
                    id: b.user.id ?? "",
                    name: b.user.name,
                    email: b.user.email,
                  }
                : { id: "", name: null, email: "" },
              createdAt: b.createdAt,
              isWinning: b.isWinning,
            }))}
          />
        </div>
      </div>
    </main>
  );
}
