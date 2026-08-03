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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Martilleros | Admin",
};

export default async function AdminMartillerosPage() {
  const martilleros = await getMartillerosAction();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Martilleros</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los martilleros de la plataforma
            </p>
          </div>
          <Link href="/admin/martilleros/nuevo">
            <Button>Nuevo Martillero</Button>
          </Link>
        </div>

        {martilleros.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
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
    </main>
  );
}
