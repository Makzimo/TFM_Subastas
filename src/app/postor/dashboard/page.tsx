import { getPostorStats } from "@/lib/stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GuaranteeStatus } from "@/components/GuaranteeStatus";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Postor | Plataforma de Remates",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACTIVO: "Activo",
  ADJUDICADO: "Adjudicado",
  DESIERTO: "Desierto",
};

export default async function PostorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getPostorStats(session.user.id);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Mi Panel
        </h1>
        <p className="mb-8 text-muted-foreground">
          Historial de participaciones y pujas
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mis Pujas</CardDescription>
              <CardTitle className="text-2xl">{stats.myBids}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pujas Ganadoras</CardDescription>
              <CardTitle className="text-2xl">{stats.winningBids}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Garantía</CardDescription>
              <CardTitle>
                <GuaranteeStatus
                  isPaid={stats.myGuarantee?.isPaid ?? null}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/postor/garantia"
                className="text-xs text-primary hover:underline"
              >
                Gestionar garantía →
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Historial de Pujas</h2>
        </div>

        {stats.recentBids.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Aún no has realizado ninguna puja.
            </p>
            <Link
              href="/remates"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Explorar remates →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentBids.map((bid) => (
              <Link key={bid.id} href={`/remates/${bid.assetId}`}>
                <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{bid.asset.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[bid.asset.status] ?? bid.asset.status}
                      </Badge>
                      {bid.isWinning && (
                        <Badge className="text-xs">Ganando</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(Number(bid.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.createdAt).toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
