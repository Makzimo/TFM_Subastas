import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActiveUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
};

export async function getActiveUser(
  allowedRoles?: string[]
): Promise<ActiveUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!user.isActive) {
    throw new Error("Cuenta desactivada");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("No autorizado");
  }

  return user;
}
