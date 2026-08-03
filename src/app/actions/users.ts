"use server";

import { getActiveUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAction } from "@/lib/audit";
import type { Role } from "@/generated/prisma/client";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const VALID_ROLES: Role[] = ["MARTILLERO", "POSTOR", "ADMINISTRATIVO"];

async function requireActiveAdmin() {
  return getActiveUser(["ADMINISTRATIVO"]);
}

async function createUserWithRole(data: {
  email: string;
  name: string | null;
  password: string;
  role: Role;
}) {
  if (!data.email || !data.password) {
    throw new Error("Email y contraseña son requeridos");
  }

  if (data.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  if (!VALID_ROLES.includes(data.role)) {
    throw new Error("Rol inválido");
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Ya existe un usuario con ese email");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name || null,
      passwordHash,
      role: data.role,
    },
  });
}

export async function createMartilleroAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const admin = await requireActiveAdmin();

    const martillero = await createUserWithRole({
      email: formData.get("email") as string,
      name: (formData.get("name") as string) || null,
      password: formData.get("password") as string,
      role: "MARTILLERO",
    });

    logAction({
      userId: admin.id,
      action: "MARTILLERO_CREATED",
      entityId: martillero.id,
      details: { email: martillero.email, name: martillero.name },
    });

    return { success: true, data: martillero };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function createUserAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const admin = await requireActiveAdmin();

    const role = (formData.get("role") as Role) || "POSTOR";
    const user = await createUserWithRole({
      email: formData.get("email") as string,
      name: (formData.get("name") as string) || null,
      password: formData.get("password") as string,
      role,
    });

    logAction({
      userId: admin.id,
      action: "USER_CREATED",
      entityId: user.id,
      details: { email: user.email, name: user.name, role },
    });

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getMartillerosAction() {
  await requireActiveAdmin();

  return prisma.user.findMany({
    where: { role: "MARTILLERO" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { assets: true } },
    },
  });
}

export async function getAllUsersAction() {
  await requireActiveAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { assets: true } },
    },
  });
}

export async function updateUserRoleAction(
  userId: string,
  role: Role
): Promise<ActionResult> {
  try {
    const admin = await requireActiveAdmin();

    if (admin.id === userId) {
      return { success: false, error: "No puedes cambiar tu propio rol" };
    }

    if (!VALID_ROLES.includes(role)) {
      return { success: false, error: "Rol inválido" };
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    logAction({
      userId: admin.id,
      action: "USER_ROLE_CHANGED",
      entityId: userId,
      details: { from: target.role, to: role, email: target.email },
    });

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const admin = await requireActiveAdmin();

    if (admin.id === userId) {
      return { success: false, error: "No puedes desactivar tu propia cuenta" };
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    logAction({
      userId: admin.id,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entityId: userId,
      details: { email: target.email, isActive },
    });

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function resetUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const admin = await requireActiveAdmin();

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logAction({
      userId: admin.id,
      action: "PASSWORD_RESET",
      entityId: userId,
      details: { email: target.email },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
