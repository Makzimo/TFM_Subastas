"use client";

import { useActionState } from "react";
import { createMartilleroAction } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NuevoMartilleroPage() {
  const [state, formAction, isPending] = useActionState(createMartilleroAction, null);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <a
            href="/admin/martilleros"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a martilleros
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Martillero</CardTitle>
            <CardDescription>
              Crear una cuenta de martillero para la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                Martillero creado correctamente
              </div>
            )}

            {state?.error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Carlos Martínez"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="martillero@ejemplo.cl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear Martillero"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
