import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  const roleDashboardMap: Record<string, string> = {
    ADMINISTRATIVO: "/admin/dashboard",
    MARTILLERO: "/martillero/dashboard",
    POSTOR: "/postor/dashboard",
  };

  const dashboardUrl = roleDashboardMap[role];
  if (dashboardUrl) {
    redirect(dashboardUrl);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="mt-2 text-muted-foreground">
          Hola, {session.user.name || session.user.email}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Rol: <span className="font-medium">{role}</span>
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/remates"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ver Remates
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
