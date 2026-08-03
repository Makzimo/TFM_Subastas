import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAdminStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATIVO") {
    throw new Error("No autorizado");
  }

  const [totalAssets, activeAssets, totalBids, highestBid, totalUsers, pendingGuarantees] =
    await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "ACTIVO" } }),
      prisma.bid.count(),
      prisma.bid.findFirst({ orderBy: { amount: "desc" }, select: { amount: true } }),
      prisma.user.count(),
      prisma.bidderGuarantee.count({ where: { isPaid: false } }),
    ]);

  return {
    totalAssets,
    activeAssets,
    totalBids,
    highestBid: highestBid ? Number(highestBid.amount) : 0,
    totalUsers,
    pendingGuarantees,
  };
}

export async function getMartilleroStats(martilleroId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [
    myAssets,
    activeAssets,
    totalBidsOnMyAssets,
    assetsLast6Months,
    assetsLastMonth,
  ] = await Promise.all([
    prisma.asset.count({ where: { martilleroId } }),
    prisma.asset.count({ where: { martilleroId, status: "ACTIVO" } }),
    prisma.bid.count({ where: { asset: { martilleroId } } }),
    prisma.asset.count({
      where: { martilleroId, createdAt: { gte: sixMonthsAgo } },
    }),
    prisma.asset.count({
      where: { martilleroId, createdAt: { gte: oneMonthAgo } },
    }),
  ]);

  const top5Adjudicadores = await prisma.bid.groupBy({
    by: ["userId"],
    where: {
      asset: { martilleroId },
      isWinning: true,
    },
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const top5UserIds = top5Adjudicadores.map((r) => r.userId);
  const top5Users = await prisma.user.findMany({
    where: { id: { in: top5UserIds } },
    select: { id: true, name: true, email: true },
  });
  const top5UserMap = new Map(top5Users.map((u) => [u.id, u]));

  const top5Result = top5Adjudicadores.map((r) => ({
    userId: r.userId,
    userName: top5UserMap.get(r.userId)?.name || null,
    userEmail: top5UserMap.get(r.userId)?.email || "",
    winCount: r._count.id,
    totalAmount: Number(r._sum.amount ?? 0),
  }));

  const last5Adjudicated = await prisma.asset.findMany({
    where: { martilleroId, status: "ADJUDICADO" },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      bids: {
        where: { isWinning: true },
        take: 1,
        include: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { bids: true } },
    },
  });

  const last5 = last5Adjudicated.map((asset) => ({
    id: asset.id,
    description: asset.description,
    imageUrl: asset.imageUrl,
    currentPrice: Number(asset.currentPrice),
    winnerName: asset.bids[0]?.user.name || asset.bids[0]?.user.email || "N/A",
    bidCount: asset._count.bids,
    closedAt: asset.updatedAt,
  }));

  return {
    myAssets,
    activeAssets,
    totalBidsOnMyAssets,
    assetsLast6Months,
    assetsLastMonth,
    top5Adjudicadores: top5Result,
    last5Adjudicated: last5,
  };
}

export async function getPostorStats(userId: string) {
  const [myBids, winningBids, myGuarantee] = await Promise.all([
    prisma.bid.count({ where: { userId } }),
    prisma.bid.count({ where: { userId, isWinning: true } }),
    prisma.bidderGuarantee.findFirst({ where: { userId } }),
  ]);

  const recentBids = await prisma.bid.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      asset: { select: { description: true, status: true, currentPrice: true } },
    },
  });

  return {
    myBids,
    winningBids,
    myGuarantee,
    recentBids,
  };
}

export async function getRecentAssets(status?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATIVO") {
    throw new Error("No autorizado");
  }

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  return prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      martillero: { select: { name: true, email: true } },
      _count: { select: { bids: true } },
    },
  });
}
