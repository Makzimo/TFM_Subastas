"use server";

import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function register(
  _prevState: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos" };
  }

  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "El email ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: "POSTOR",
    },
  });

  return { success: true };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
