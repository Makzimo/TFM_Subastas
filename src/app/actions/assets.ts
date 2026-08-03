"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import {
  createAsset as engineCreateAsset,
  updateAsset as engineUpdateAsset,
  updateAssetStatus as engineUpdateAssetStatus,
  deleteAsset as engineDeleteAsset,
  getAssets as engineGetAssets,
  getAssetById as engineGetAssetById,
} from "@/lib/auction-engine";
import { logAction } from "@/lib/audit";
import { serializeAsset } from "@/lib/serialize";
import type { AuctionStatus, ApprovalStatus } from "@/generated/prisma/client";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function requireAdmin() {
  return getActiveUser(["ADMINISTRATIVO"]);
}

async function requireMartilleroOrAdmin() {
  return getActiveUser(["MARTILLERO", "ADMINISTRATIVO"]);
}

export async function createAssetAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let redirectTarget: string | undefined;

  try {
    const user = await requireMartilleroOrAdmin();
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const imageUrl = (formData.get("imageUrl") as string) || undefined;

    let martilleroId = user.id;
    if (user.role === "ADMINISTRATIVO") {
      const selected = (formData.get("martilleroId") as string) || undefined;
      if (!selected) {
        return { success: false, error: "Debe seleccionar un martillero" };
      }
      const martillero = await prisma.user.findUnique({
        where: { id: selected },
        select: { id: true, role: true },
      });
      if (!martillero || martillero.role !== "MARTILLERO") {
        return { success: false, error: "El martillero seleccionado no es válido" };
      }
      martilleroId = selected;
    }

    await engineCreateAsset({
      description,
      basePrice,
      imageUrl,
      martilleroId,
    });

    redirectTarget =
      user.role === "ADMINISTRATIVO" ? "/admin/activos" : "/martillero/activos";
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }

  redirect(redirectTarget ?? "/dashboard");

  return { success: false, error: "Error desconocido" };
}

export async function updateAssetAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireMartilleroOrAdmin();
    const id = formData.get("id") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const imageUrl = (formData.get("imageUrl") as string) || undefined;
    const selectedMartillero = (formData.get("martilleroId") as string) || undefined;

    if (user.role === "MARTILLERO") {
      const existing = await prisma.asset.findUnique({
        where: { id },
        select: { martilleroId: true },
      });
      if (!existing || existing.martilleroId !== user.id) {
        return { success: false, error: "No tienes permiso para editar este lote" };
      }
    }

    let martilleroId: string | undefined;
    if (user.role === "ADMINISTRATIVO" && selectedMartillero) {
      const martillero = await prisma.user.findUnique({
        where: { id: selectedMartillero },
        select: { id: true, role: true },
      });
      if (!martillero || martillero.role !== "MARTILLERO") {
        return { success: false, error: "El martillero seleccionado no es válido" };
      }
      martilleroId = selectedMartillero;
    }

    const asset = await engineUpdateAsset(id, {
      description,
      basePrice,
      imageUrl,
      martilleroId,
    });

    return { success: true, data: serializeAsset(asset) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function changeAssetStatusAction(
  id: string,
  status: AuctionStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const asset = await engineUpdateAssetStatus(id, status);
    return { success: true, data: serializeAsset(asset) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function approveAssetAction(
  id: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "Lote no encontrado" };
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        approvalStatus: "APROBADO",
        approvedById: admin.id,
      },
    });

    logAction({
      userId: admin.id,
      action: "ASSET_APPROVED",
      entityId: id,
      details: { description: asset.description },
    });

    return { success: true, data: serializeAsset(updated) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function rejectAssetAction(
  id: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "Lote no encontrado" };
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        approvalStatus: "RECHAZADO",
        approvedById: admin.id,
      },
    });

    logAction({
      userId: admin.id,
      action: "ASSET_REJECTED",
      entityId: id,
      details: { description: asset.description },
    });

    return { success: true, data: serializeAsset(updated) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteAssetAction(
  id: string
): Promise<ActionResult> {
  try {
    const user = await getActiveUser(["MARTILLERO", "ADMINISTRATIVO"]);

    if (user.role === "MARTILLERO") {
      const existing = await prisma.asset.findUnique({
        where: { id },
        select: { martilleroId: true },
      });
      if (!existing || existing.martilleroId !== user.id) {
        return { success: false, error: "No tienes permiso para eliminar este lote" };
      }
    }

    await engineDeleteAsset(id);

    logAction({
      userId: user.id,
      action: "ASSET_DELETED",
      entityId: id,
      details: {},
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getAssetsAction(params?: {
  status?: AuctionStatus;
  search?: string;
}) {
  return engineGetAssets(params);
}

export async function getAssetsWithApprovalAction(params?: {
  status?: AuctionStatus;
  approvalStatus?: ApprovalStatus;
  search?: string;
}) {
  await getActiveUser();
  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.approvalStatus) {
    where.approvalStatus = params.approvalStatus;
  }

  if (params?.search) {
    where.description = { contains: params.search, mode: "insensitive" };
  }

  return prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      martillero: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      _count: { select: { bids: true } },
    },
  });
}

export async function getAssetByIdAction(id: string) {
  return serializeAsset(await engineGetAssetById(id));
}
