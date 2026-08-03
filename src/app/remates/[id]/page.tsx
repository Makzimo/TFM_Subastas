import { notFound } from "next/navigation";
import Image from "next/image";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getMyGuaranteeForAssetAction } from "@/app/actions/guarantees";
import { getLatestBidsAction } from "@/app/actions/bids";
import { Badge } from "@/components/ui/badge";
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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDIENTE: "outline",
  ACTIVO: "default",
  ADJUDICADO: "secondary",
  DESIERTO: "destructive",
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
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <a
            href="/remates"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver al listado
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {asset.imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={asset.imageUrl}
                  alt={asset.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio base</span>
                <span className="font-semibold">
                  {formatCurrency(Number(asset.basePrice))}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Martillero:{" "}
                  {asset.martillero?.name || asset.martillero?.email || ""}
                </p>
                <p>
                  Creado:{" "}
                  {new Date(asset.createdAt).toLocaleDateString("es-CL")}
                </p>
              </div>
            </div>

            {asset.status === "ACTIVO" &&
              ((session?.user?.role === "MARTILLERO" &&
                session?.user?.id === asset.martilleroId) ||
                session?.user?.role === "ADMINISTRATIVO") && (
                <div className="mt-6 rounded-lg border border-destructive/50 p-4">
                  <h3 className="mb-3 text-sm font-medium text-destructive">
                    Cerrar remate
                  </h3>
                  <CloseAuction assetId={asset.id} />
                </div>
              )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold">{asset.description}</h1>
                <Badge variant={STATUS_VARIANTS[asset.status] ?? "outline"}>
                  {STATUS_LABELS[asset.status] ?? asset.status}
                </Badge>
              </div>
            </div>

            {asset.status === "ACTIVO" ||
            asset.status === "ADJUDICADO" ||
            asset.status === "DESIERTO" ? (
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
                    ? { id: b.user.id ?? "", name: b.user.name, email: b.user.email }
                    : { id: "", name: null, email: "" },
                  createdAt: b.createdAt,
                  isWinning: b.isWinning,
                }))}
              />
            ) : (
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Este remate aún no está activo.
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Precio base: {formatCurrency(Number(asset.basePrice))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
