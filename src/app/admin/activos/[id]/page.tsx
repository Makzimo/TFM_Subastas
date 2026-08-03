import { notFound, redirect } from "next/navigation";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getMartillerosAction } from "@/app/actions/users";
import { EditAssetForm } from "./edit-form";
import { ApprovalButtons } from "@/components/ApprovalButtons";
import { ActivateAuctionButton } from "@/components/ActivateAuctionButton";
import { DeleteAssetButton } from "@/components/DeleteAssetButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarActivoPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const { id } = await params;
  const [asset, martilleros] = await Promise.all([
    getAssetByIdAction(id),
    getMartillerosAction(),
  ]);

  if (!asset) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <a
            href="/admin/activos"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a lotes
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <EditAssetForm asset={asset} martilleros={martilleros} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalButtons
              assetId={asset.id}
              currentStatus={asset.approvalStatus}
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Activar Remate</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivateAuctionButton
              assetId={asset.id}
              assetStatus={asset.status}
              approvalStatus={asset.approvalStatus}
            />
          </CardContent>
        </Card>

        {asset.status === "ACTIVO" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gestión del Remate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <a
                  href={`/admin/activos/${id}/participantes`}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Ver Participantes
                </a>
                <a
                  href={`/admin/activos/${id}/historial`}
                  className="inline-flex items-center rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Ver Historial de Pujas
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Zona de peligro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Eliminar este lote es permanente. No se puede eliminar si tiene pujas registradas o si el remate está activo.
            </p>
            <DeleteAssetButton
              assetId={asset.id}
              assetDescription={asset.description}
              redirectTo="/admin/activos"
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
