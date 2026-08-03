"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NuevoUsuarioPage() {
  const [state, formAction, isPending] = useActionState(createUserAction, null);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <a
            href="/admin/usuarios"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a usuarios
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Usuario</CardTitle>
            <CardDescription>
              Crear una cuenta de cualquier rol para la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                Usuario creado correctamente
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
                  placeholder="Ej: Juan Pérez"
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
                  placeholder="usuario@ejemplo.cl"
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

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Rol *
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="POSTOR"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="POSTOR">Postor</option>
                  <option value="MARTILLERO">Martillero</option>
                  <option value="ADMINISTRATIVO">Administrador</option>
                </select>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear Usuario"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
