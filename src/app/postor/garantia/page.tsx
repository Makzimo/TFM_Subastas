import { getMyGuaranteesAction } from "@/app/actions/guarantees";
import { GuaranteeClient } from "./guarantee-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Garantías | Plataforma de Remates",
};

export default async function GarantiaPostorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const guarantees = await getMyGuaranteesAction();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Garantías de Seriedad
        </h1>
        <GuaranteeClient guarantees={guarantees} />
      </div>
    </main>
  );
}
