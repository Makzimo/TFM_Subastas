import Link from "next/link";
import { getAssetsWithApprovalAction } from "@/app/actions/assets";
import { AssetCard } from "@/components/AssetCard";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Lotes | Martillero",
};

export default async function MartilleroActivosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const assets = await getAssetsWithApprovalAction();

  const myAssets = assets.filter(
    (a) => a.martilleroId === session?.user?.id
  );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Lotes</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los lotes de subasta
            </p>
          </div>
          <Link href="/martillero/activos/nuevo">
            <Button>Nuevo Lote</Button>
          </Link>
        </div>

        {myAssets.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay lotes creados aún.
            </p>
            <Link href="/martillero/activos/nuevo" className="mt-4 inline-block">
              <Button>Crear primer lote</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myAssets.map((asset) => (
              <div key={asset.id}>
                <AssetCard
                  id={asset.id}
                  description={asset.description}
                  basePrice={Number(asset.basePrice)}
                  currentPrice={Number(asset.currentPrice)}
                  status={asset.status}
                  imageUrl={asset.imageUrl}
                  bidCount={asset._count.bids}
                  approvalStatus={asset.approvalStatus}
                  href={`/martillero/activos/${asset.id}`}
                  showLiveButton
                />
                {asset.status === "ACTIVO" && (
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`/martillero/activos/${asset.id}/participantes`}
                      className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Participantes
                    </a>
                    <a
                      href={`/martillero/activos/${asset.id}/historial`}
                      className="flex-1 rounded-md bg-slate-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-slate-700"
                    >
                      Historial
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
