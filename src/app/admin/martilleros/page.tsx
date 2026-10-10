import { getMartillerosAction } from "@/app/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Martilleros | Admin",
};

export default async function AdminMartillerosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const martilleros = await getMartillerosAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Martilleros</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los martilleros de la plataforma
          </p>
        </div>
        <Link href="/admin/martilleros/nuevo">
          <Button>Nuevo Martillero</Button>
        </Link>
      </div>

      {martilleros.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-muted-foreground">
            No hay martilleros registrados aún.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {martilleros.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle>{m.name || "Sin nombre"}</CardTitle>
                <CardDescription>{m.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {m._count.assets} lote{m._count.assets !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Creado: {new Date(m.createdAt).toLocaleDateString("es-CL")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
