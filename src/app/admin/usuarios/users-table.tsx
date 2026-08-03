"use client";

import { useState, useTransition } from "react";
import {
  updateUserRoleAction,
  setUserActiveAction,
  resetUserPasswordAction,
} from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@/generated/prisma/client";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  _count: { assets: number };
}

interface Props {
  users: UserRow[];
}

export function UsersTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay usuarios registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium">Usuario</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Lotes</th>
            <th className="px-4 py-3 font-medium">Registro</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <UserRowItem key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRowItem({ user }: { user: UserRow }) {
  const [isRolePending, startRoleTransition] = useTransition();
  const [isActivePending, startActiveTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetPending, setResetPending] = useState(false);

  function handleRoleChange(role: string) {
    startRoleTransition(async () => {
      const res = await updateUserRoleAction(user.id, role as Role);
      setMessage(
        res.success
          ? { ok: true, text: "Rol actualizado" }
          : { ok: false, text: res.error || "Error" }
      );
    });
  }

  function handleToggleActive() {
    startActiveTransition(async () => {
      const res = await setUserActiveAction(user.id, !user.isActive);
      setMessage(
        res.success
          ? { ok: true, text: "Estado actualizado" }
          : { ok: false, text: res.error || "Error" }
      );
    });
  }

  async function handleResetPassword() {
    if (!resetPassword) return;
    setResetPending(true);
    const res = await resetUserPasswordAction(user.id, resetPassword);
    setResetPending(false);
    setMessage(
      res.success
        ? { ok: true, text: "Contraseña restablecida" }
        : { ok: false, text: res.error || "Error" }
    );
    if (res.success) {
      setResetOpen(false);
      setResetPassword("");
    }
  }

  return (
    <tr className={user.isActive ? "" : "bg-red-50/50"}>
      <td className="px-4 py-3">
        <p className="font-medium">{user.name || "Sin nombre"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isRolePending}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="POSTOR">Postor</option>
          <option value="MARTILLERO">Martillero</option>
          <option value="ADMINISTRATIVO">Administrador</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
            user.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.isActive ? "Activo" : "Desactivado"}
        </span>
      </td>
      <td className="px-4 py-3">{user._count.assets}</td>
      <td className="px-4 py-3">
        {new Date(user.createdAt).toLocaleDateString("es-CL")}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={user.isActive ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleActive}
            disabled={isActivePending}
          >
            {isActivePending
              ? "..."
              : user.isActive
                ? "Desactivar"
                : "Activar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen((v) => !v)}
          >
            Reset clave
          </Button>
        </div>
        {resetOpen && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="password"
              placeholder="Nueva contraseña (mín 6)"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="h-8 w-48"
            />
            <Button
              size="sm"
              onClick={handleResetPassword}
              disabled={resetPending || resetPassword.length < 6}
            >
              {resetPending ? "..." : "Guardar"}
            </Button>
          </div>
        )}
        {message && (
          <p
            className={`mt-1 text-xs ${
              message.ok ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </td>
    </tr>
  );
}
