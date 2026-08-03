import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";

export type AuditEvent =
  | "BID_PLACED"
  | "AUCTION_CLOSED"
  | "AUCTION_OPENED"
  | "GUARANTEE_PAID"
  | "USER_REGISTERED"
  | "MARTILLERO_CREATED"
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "PASSWORD_RESET"
  | "ASSET_CREATED"
  | "ASSET_UPDATED"
  | "ASSET_DELETED"
  | "ASSET_APPROVED"
  | "ASSET_REJECTED";

export async function logAction(params: {
  userId: string;
  action: AuditEvent;
  entityId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityId: params.entityId,
        details: params.details
          ? (params.details as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch {
    // Silently fail — audit logging should never break the main flow
  }
}

export async function getLogsByEntity(entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getLogsByUser(userId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAllLogs(limit = 100) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATIVO") {
    throw new Error("No autorizado");
  }

  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
