import { getAllUsersAction } from "@/app/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios | Admin",
};

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const users = await getAllUsersAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las cuentas de la plataforma
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo">
          <Button>Nuevo Usuario</Button>
        </Link>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
