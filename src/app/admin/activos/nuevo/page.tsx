import { getMartillerosAction } from "@/app/actions/users";
import { NuevoActivoForm } from "./nuevo-activo-form";

export default async function NuevoActivoPage() {
  const martilleros = await getMartillerosAction();

  return <NuevoActivoForm martilleros={martilleros} />;
}
