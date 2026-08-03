import { prisma } from "@/lib/prisma";
import { broadcastToAsset } from "@/lib/sse-server";
import { logAction } from "@/lib/audit";
import type { Asset, AuctionStatus, Bid } from "@/generated/prisma/client";

const MIN_BID_INCREMENT = 50000;

interface AssetLockRow {
  id: string;
  status: AuctionStatus;
  currentPrice: string;
}

const VALID_TRANSITIONS: Record<AuctionStatus, AuctionStatus[]> = {
  PENDIENTE: ["ACTIVO", "DESIERTO"],
  ACTIVO: ["ADJUDICADO", "DESIERTO"],
  ADJUDICADO: [],
  DESIERTO: [],
};

export function canTransition(from: AuctionStatus, to: AuctionStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function placeBid(
  assetId: string,
  userId: string,
  amount: number
): Promise<Bid> {
  if (amount <= 0) {
    throw new Error("El monto de la puja debe ser mayor a 0");
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    throw new Error("Lote no encontrado");
  }

  if (asset.status !== "ACTIVO") {
    throw new Error("El remate no está activo");
  }

  const { bid, bidCount } = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<AssetLockRow[]>`
      SELECT id, status, "currentPrice"
      FROM "Asset"
      WHERE id = ${assetId}
      FOR UPDATE
    `;

    const locked = rows[0];
    if (!locked) {
      throw new Error("Lote no encontrado");
    }

    if (locked.status !== "ACTIVO") {
      throw new Error("El remate no está activo");
    }

    const guarantee = await tx.bidderGuarantee.findFirst({
      where: { userId, assetId, isPaid: true },
    });
    if (!guarantee) {
      throw new Error("No tiene garantía de seriedad pagada para este lote");
    }

    const currentPrice = Number(locked.currentPrice);
    if (amount <= currentPrice) {
      throw new Error(
        `El monto debe ser mayor al precio actual: $${currentPrice.toLocaleString("es-CL")}`
      );
    }

    if (amount - currentPrice < MIN_BID_INCREMENT) {
      throw new Error(
        `El incremento mínimo es de $${MIN_BID_INCREMENT.toLocaleString("es-CL")}`
      );
    }

    const previousWinner = await tx.bid.findFirst({
      where: { assetId, isWinning: true },
    });

    if (previousWinner) {
      await tx.bid.update({
        where: { id: previousWinner.id },
        data: { isWinning: false },
      });
    }

    const bid = await tx.bid.create({
      data: {
        amount,
        userId,
        assetId,
        isWinning: true,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    await tx.asset.update({
      where: { id: assetId },
      data: { currentPrice: amount },
    });

    const bidCount = await tx.bid.count({ where: { assetId } });

    return { bid, bidCount };
  });

  const bidderName = bid.user.name || bid.user.email;

  broadcastToAsset(assetId, {
    event: "bid",
    data: {
      assetId,
      eventId: bid.id,
      bid: {
        id: bid.id,
        amount,
        bidderName,
        bidderEmail: bid.user.email,
        createdAt: bid.createdAt.toISOString(),
        userId: bid.userId,
      },
      currentPrice: amount,
      bidCount,
      winnerId: bid.userId,
      winnerName: bidderName,
    },
  });

  logAction({
    userId,
    action: "BID_PLACED",
    entityId: assetId,
    details: { amount, bidderId: userId },
  });

  return bid;
}

export async function closeAuction(
  assetId: string,
  userId: string,
  userRole: string
): Promise<Asset> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      bids: {
        where: { isWinning: true },
        take: 1,
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!asset) {
    throw new Error("Lote no encontrado");
  }

  if (userRole !== "ADMINISTRATIVO" && asset.martilleroId !== userId) {
    throw new Error("No tienes permiso para cerrar este remate");
  }

  if (asset.status !== "ACTIVO") {
    throw new Error("El remate no está activo");
  }

  const hasBids = asset.bids.length > 0;

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { status: hasBids ? "ADJUDICADO" : "DESIERTO" },
  });

  const winner = hasBids ? asset.bids[0] : null;
  const bidCount = await prisma.bid.count({ where: { assetId } });

  broadcastToAsset(assetId, {
    event: "auction-closed",
    data: {
      assetId,
      eventId: `closed-${updated.updatedAt.toISOString()}`,
      status: updated.status,
      winnerId: winner?.userId ?? null,
      winnerName: winner
        ? winner.user.name || winner.user.email
        : null,
      bidderEmail: winner?.user.email ?? null,
      bidCount,
    },
  });

  logAction({
    userId,
    action: "AUCTION_CLOSED",
    entityId: assetId,
    details: {
      status: updated.status,
      winnerId: winner?.userId ?? null,
      totalBids: bidCount,
      closedBy: userRole,
    },
  });

  return updated;
}

export async function getBidsByAsset(assetId: string) {
  return prisma.bid.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getLatestBids(assetId: string, limit = 5) {
  return prisma.bid.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getWinningBid(assetId: string) {
  return prisma.bid.findFirst({
    where: { assetId, isWinning: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      bids: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      martillero: { select: { id: true, name: true, email: true } },
      _count: { select: { bids: true } },
    },
  });
  return asset;
}

export async function getAssets(params?: {
  status?: AuctionStatus;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.search) {
    where.description = { contains: params.search, mode: "insensitive" };
  }

  return prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      martillero: { select: { id: true, name: true, email: true } },
      _count: { select: { bids: true } },
    },
  });
}

export async function createAsset(data: {
  description: string;
  basePrice: number;
  imageUrl?: string;
  martilleroId: string;
}): Promise<Asset> {
  if (data.basePrice <= 0) {
    throw new Error("El precio base debe ser mayor a 0");
  }

  if (!data.description.trim()) {
    throw new Error("La descripción es requerida");
  }

  return prisma.asset.create({
    data: {
      description: data.description.trim(),
      basePrice: data.basePrice,
      currentPrice: data.basePrice,
      imageUrl: data.imageUrl || null,
      martilleroId: data.martilleroId,
      status: "PENDIENTE",
    },
  }).then((asset) => {
    logAction({
      userId: data.martilleroId,
      action: "ASSET_CREATED",
      entityId: asset.id,
      details: { description: data.description, basePrice: data.basePrice },
    });
    return asset;
  });
}

export async function updateAsset(
  id: string,
  data: {
    description?: string;
    basePrice?: number;
    imageUrl?: string;
    martilleroId?: string;
  }
): Promise<Asset> {
  const asset = await prisma.asset.findUnique({ where: { id } });

  if (!asset) {
    throw new Error("Lote no encontrado");
  }

  if (asset.status !== "PENDIENTE") {
    throw new Error("Solo se pueden editar lotes en estado PENDIENTE");
  }

  if (data.basePrice !== undefined && data.basePrice <= 0) {
    throw new Error("El precio base debe ser mayor a 0");
  }

  return prisma.asset.update({
    where: { id },
    data: {
      ...(data.description !== undefined && {
        description: data.description.trim(),
      }),
      ...(data.basePrice !== undefined && {
        basePrice: data.basePrice,
        currentPrice: data.basePrice,
      }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.martilleroId !== undefined && {
        martilleroId: data.martilleroId,
      }),
    },
  });
}

export async function updateAssetStatus(
  id: string,
  newStatus: AuctionStatus
): Promise<Asset> {
  const asset = await prisma.asset.findUnique({ where: { id } });

  if (!asset) {
    throw new Error("Lote no encontrado");
  }

  if (!canTransition(asset.status, newStatus)) {
    throw new Error(
      `No se puede transicionar de ${asset.status} a ${newStatus}`
    );
  }

  if (newStatus === "ACTIVO" && asset.approvalStatus !== "APROBADO") {
    throw new Error("El lote debe estar aprobado por un administrador antes de abrir el remate");
  }

  return prisma.asset.update({
    where: { id },
    data: { status: newStatus },
  });
}

export async function deleteAsset(id: string): Promise<void> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { _count: { select: { bids: true } } },
  });

  if (!asset) {
    throw new Error("Lote no encontrado");
  }

  if (asset._count.bids > 0) {
    throw new Error("No se puede eliminar un lote con pujas registradas");
  }

  if (asset.status === "ACTIVO") {
    throw new Error("No se puede eliminar un lote con remate abierto");
  }

  await prisma.asset.delete({ where: { id } });
}
