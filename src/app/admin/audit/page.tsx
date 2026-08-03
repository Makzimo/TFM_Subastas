import { getAllLogs } from "@/lib/audit";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auditoría | Admin",
};

const EVENT_LABELS: Record<string, string> = {
  BID_PLACED: "Puja realizada",
  AUCTION_CLOSED: "Remate cerrado",
  AUCTION_OPENED: "Remate abierto",
  GUARANTEE_PAID: "Garantía pagada",
  USER_REGISTERED: "Usuario registrado",
  ASSET_CREATED: "Lote creado",
  ASSET_UPDATED: "Lote actualizado",
  ASSET_DELETED: "Lote eliminado",
};

const EVENT_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  BID_PLACED: "default",
  AUCTION_CLOSED: "destructive",
  GUARANTEE_PAID: "secondary",
  USER_REGISTERED: "outline",
  ASSET_CREATED: "default",
  ASSET_UPDATED: "outline",
  ASSET_DELETED: "destructive",
};

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const logs = await getAllLogs(200);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Logs de Auditoría
        </h1>
        <p className="mb-8 text-muted-foreground">
          Historial de acciones críticas del sistema
        </p>

        {logs.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No hay registros de auditoría aún.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={EVENT_VARIANTS[log.action] ?? "outline"}>
                          {EVENT_LABELS[log.action] ?? log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("es-CL")}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {log.user.name || log.user.email}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Entity: {log.entityId.slice(0, 8)}...
                      </p>
                      {log.details && (
                        <pre className="mt-1 max-w-md overflow-x-auto text-xs text-muted-foreground">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
