"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/current-user";
import {
  placeBid as enginePlaceBid,
  closeAuction as engineCloseAuction,
  getBidsByAsset as engineGetBidsByAsset,
  getLatestBids as engineGetLatestBids,
  getWinningBid as engineGetWinningBid,
} from "@/lib/auction-engine";
import { checkRateLimit } from "@/lib/rate-limit";
import { serializeBid, serializeBids } from "@/lib/serialize";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function placeBidAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getActiveUser(["POSTOR"]);

    const assetId = formData.get("assetId") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (!assetId) {
      return { success: false, error: "Lote no especificado" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Monto inválido" };
    }

    const rateLimitKey = `bid:${user.id}`;
    const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, 10, 60000);
    if (!allowed) {
      return {
        success: false,
        error: `Demasiadas pujas. Intenta en ${Math.ceil(retryAfterMs / 1000)} segundos`,
      };
    }

    const bid = await enginePlaceBid(assetId, user.id, amount);
    return { success: true, data: serializeBid(bid) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function closeAuctionAction(
  assetId: string
): Promise<ActionResult> {
  try {
    const user = await getActiveUser(["MARTILLERO", "ADMINISTRATIVO"]);

    const role = user.role;

    if (role === "MARTILLERO") {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { martilleroId: true },
      });

      if (!asset) {
        return { success: false, error: "Lote no encontrado" };
      }

      if (asset.martilleroId !== user.id) {
        return { success: false, error: "No tienes permiso para cerrar este remate" };
      }
    }

    const result = await engineCloseAuction(assetId, user.id, role);
    return {
      success: true,
      data: { assetId: result.id, status: result.status },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getBidsByAssetAction(assetId: string) {
  return engineGetBidsByAsset(assetId);
}

export async function getLatestBidsAction(assetId: string, limit = 5) {
  return serializeBids(await engineGetLatestBids(assetId, limit));
}

export async function getWinningBidAction(assetId: string) {
  return engineGetWinningBid(assetId);
}
