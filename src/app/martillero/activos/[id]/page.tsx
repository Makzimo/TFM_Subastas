import { notFound } from "next/navigation";
import { getAssetByIdAction } from "@/app/actions/assets";
import { EditAssetForm } from "@/app/admin/activos/[id]/edit-form";
import { DeleteAssetButton } from "@/components/DeleteAssetButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MartilleroEditarActivoPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const asset = await getAssetByIdAction(id);

  if (!asset || asset.martilleroId !== session?.user?.id) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <a
            href="/martillero/activos"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a mis lotes
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <EditAssetForm asset={asset} />
          </CardContent>
        </Card>

        {asset.status === "PENDIENTE" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Zona de peligro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Eliminar este lote es permanente. Solo puedes eliminar lotes pendientes sin pujas.
              </p>
              <DeleteAssetButton
                assetId={asset.id}
                assetDescription={asset.description}
                redirectTo="/martillero/activos"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
