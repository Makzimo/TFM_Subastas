"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/current-user";
import { PAYMENT_METHOD_VALUES } from "@/lib/payment-methods";
import { serializeGuarantee } from "@/lib/serialize";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createGuaranteeAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getActiveUser(["POSTOR"]);
    const assetId = formData.get("assetId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;

    if (!assetId) {
      return { success: false, error: "Lote no especificado" };
    }

    if (!PAYMENT_METHOD_VALUES.includes(paymentMethod as never)) {
      return { success: false, error: "Método de pago no válido" };
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });
    if (!asset) {
      return { success: false, error: "Lote no encontrado" };
    }

    const existing = await prisma.bidderGuarantee.findFirst({
      where: { userId: user.id, assetId },
    });

    if (existing) {
      return {
        success: false,
        error: existing.isPaid
          ? "Ya tiene la garantía aprobada para este lote"
          : "Ya tiene una solicitud de garantía pendiente para este lote",
      };
    }

    const guarantee = await prisma.bidderGuarantee.create({
      data: {
        userId: user.id,
        assetId,
        amount: 500000,
        isPaid: false,
        paymentMethod,
      },
    });

    return { success: true, data: serializeGuarantee(guarantee) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getMyGuaranteeForAssetAction(assetId: string) {
  try {
    const user = await getActiveUser();
    return prisma.bidderGuarantee.findFirst({
      where: { userId: user.id, assetId },
    });
  } catch {
    return null;
  }
}

export async function getMyGuaranteesAction() {
  try {
    const user = await getActiveUser();
    const guarantees = await prisma.bidderGuarantee.findMany({
      where: { userId: user.id },
      include: {
        asset: { select: { id: true, description: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return guarantees
      .map(serializeGuarantee)
      .filter((g): g is NonNullable<typeof g> => g !== null);
  } catch {
    return [];
  }
}

export async function getAllGuaranteesAction() {
  await getActiveUser(["ADMINISTRATIVO"]);

  return prisma.bidderGuarantee.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGuaranteeStatusAction(
  id: string,
  isPaid: boolean
): Promise<ActionResult> {
  try {
    await getActiveUser(["ADMINISTRATIVO"]);

    const guarantee = await prisma.bidderGuarantee.findUnique({ where: { id } });
    if (!guarantee) {
      return { success: false, error: "Garantía no encontrada" };
    }

    const updated = await prisma.bidderGuarantee.update({
      where: { id },
      data: {
        isPaid,
        paymentDate: isPaid ? new Date() : null,
      },
    });

    return { success: true, data: serializeGuarantee(updated) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getAssetParticipantsAction(assetId: string) {
  const user = await getActiveUser(["ADMINISTRATIVO", "MARTILLERO"]);

  if (user.role === "MARTILLERO") {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { martilleroId: true },
    });
    if (!asset || asset.martilleroId !== user.id) {
      throw new Error("No tienes permiso para ver los participantes de este lote");
    }
  }

  const [guaranteedUsers, bidders, allPostors] = await Promise.all([
    prisma.bidderGuarantee.findMany({
      where: { isPaid: true, assetId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.bid.findMany({
      where: { assetId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { amount: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "POSTOR" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const biddingUserIds = new Set(bidders.map((b) => b.user.id));
  const guaranteedUserIds = new Set(
    guaranteedUsers.map((g) => g.user.id)
  );

  const biddingUsers = bidders.reduce<
    { id: string; name: string | null; email: string; highestBid: number }[]
  >((acc, bid) => {
    const existing = acc.find((u) => u.id === bid.user.id);
    if (!existing) {
      acc.push({
        id: bid.user.id,
        name: bid.user.name,
        email: bid.user.email,
        highestBid: Number(bid.amount),
      });
    }
    return acc;
  }, []);

  const guaranteedList = guaranteedUsers
    .filter((g) => !biddingUserIds.has(g.user.id))
    .map((g) => ({
      id: g.user.id,
      name: g.user.name,
      email: g.user.email,
    }));

  const nonGuaranteedUsers = allPostors.filter(
    (u) => !guaranteedUserIds.has(u.id)
  );

  return { guaranteedUsers: guaranteedList, biddingUsers, nonGuaranteedUsers };
}
