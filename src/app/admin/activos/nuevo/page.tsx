import { getMartillerosAction } from "@/app/actions/users";
import { NuevoActivoForm } from "./nuevo-activo-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NuevoActivoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATIVO") redirect("/dashboard");

  const martilleros = await getMartillerosAction();

  return <NuevoActivoForm martilleros={martilleros} />;
}
