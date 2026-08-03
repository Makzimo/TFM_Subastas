import { getAllUsersAction } from "@/app/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios | Admin",
};

export default async function AdminUsuariosPage() {
  const users = await getAllUsersAction();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona las cuentas de la plataforma
            </p>
          </div>
          <Link href="/admin/usuarios/nuevo">
            <Button>Nuevo Usuario</Button>
          </Link>
        </div>

        <UsersTable users={users} />
      </div>
    </main>
  );
}
