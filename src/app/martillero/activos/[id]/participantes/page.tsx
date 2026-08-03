import { notFound } from "next/navigation";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getAssetParticipantsAction } from "@/app/actions/guarantees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ParticipantesMartilleroPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const asset = await getAssetByIdAction(id);

  if (!asset || asset.martilleroId !== session?.user?.id) {
    notFound();
  }

  const participants = await getAssetParticipantsAction(id);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <a
            href="/martillero/activos"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a mis lotes
          </a>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Participantes</h1>
          <p className="mt-1 text-muted-foreground">{asset.description}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">
                Postores pujando ({participants.biddingUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.biddingUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nadie ha pujado aún en este remate.
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.biddingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        ${user.highestBid.toLocaleString("es-CL")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">
                Con garantía pagada, sin pujar ({participants.guaranteedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.guaranteedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Todos los postores con garantía ya están pujando o no hay postores habilitados.
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.guaranteedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Habilitado</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">
                Sin garantía pagada ({participants.nonGuaranteedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.nonGuaranteedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Todos los postores tienen garantía pagada.
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.nonGuaranteedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-xs text-red-500">No habilitado</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
