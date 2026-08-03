/**
 * Serializadores de salida de datos Prisma.
 *
 * REGLA: Ninguna Server Action ni prop de Server Component a Client Component
 * puede transportar objetos Prisma crudos (Decimal, Date). Todo lo que cruce
 * el borde RSC debe pasar por estas funciones: Decimal -> number, Date -> ISO.
 */

export type DecimalLike = number | string | { toNumber: () => unknown };

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return Number((value as { toNumber: () => unknown }).toNumber());
  }
  return Number(value as never);
}

export function toISO(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(value as never).toISOString();
}

export interface SerializedUserRef {
  id?: string;
  name: string | null;
  email: string;
}

export interface SerializedBid {
  id: string;
  amount: number;
  createdAt: string;
  isWinning: boolean;
  userId: string;
  assetId: string | null;
  user: SerializedUserRef | null;
}

export interface SerializedAsset {
  id: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  status: string;
  approvalStatus: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  martilleroId: string;
  approvedById: string | null;
  martillero: SerializedUserRef | null;
  approvedBy: SerializedUserRef | null;
  _count: { bids: number } | null;
  bids: SerializedBid[];
}

export interface SerializedGuarantee {
  id: string;
  userId: string;
  assetId: string | null;
  isPaid: boolean;
  paymentDate: string | null;
  amount: number;
  paymentMethod: string | null;
  createdAt: string;
  asset: { id: string; description: string; status?: string } | null;
  user: SerializedUserRef | null;
}

interface RawUserRef {
  id?: string | null;
  name?: string | null;
  email?: string | null;
}

interface RawBid {
  id: string;
  amount: DecimalLike;
  createdAt: Date | string;
  isWinning: boolean;
  userId: string;
  assetId?: string | null;
  user?: RawUserRef | null;
}

interface RawAsset {
  id: string;
  description: string;
  basePrice: DecimalLike;
  currentPrice: DecimalLike;
  status: string;
  approvalStatus: string;
  imageUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  martilleroId: string;
  approvedById?: string | null;
  martillero?: RawUserRef | null;
  approvedBy?: RawUserRef | null;
  _count?: { bids?: number } | null;
  bids?: RawBid[] | null;
}

interface RawGuarantee {
  id: string;
  userId: string;
  assetId?: string | null;
  isPaid: boolean;
  paymentDate?: Date | string | null;
  amount: DecimalLike;
  paymentMethod?: string | null;
  createdAt: Date | string;
  asset?: { id: string; description: string; status?: string } | null;
  user?: RawUserRef | null;
}

export function serializeUserRef(user: RawUserRef | null | undefined): SerializedUserRef | null {
  if (!user) return null;
  return {
    id: user.id ?? undefined,
    name: user.name ?? null,
    email: user.email ?? "",
  };
}

export function serializeBid(bid: RawBid): SerializedBid {
  return {
    id: bid.id,
    amount: toNumber(bid.amount),
    createdAt: toISO(bid.createdAt),
    isWinning: bid.isWinning,
    userId: bid.userId,
    assetId: bid.assetId ?? null,
    user: serializeUserRef(bid.user),
  };
}

export function serializeBids(bids: RawBid[] | null | undefined): SerializedBid[] {
  if (!bids) return [];
  return bids.map(serializeBid);
}

export function serializeAsset(asset: RawAsset | null | undefined): SerializedAsset | null {
  if (!asset) return null;
  return {
    id: asset.id,
    description: asset.description,
    basePrice: toNumber(asset.basePrice),
    currentPrice: toNumber(asset.currentPrice),
    status: asset.status,
    approvalStatus: asset.approvalStatus,
    imageUrl: asset.imageUrl ?? null,
    createdAt: toISO(asset.createdAt),
    updatedAt: toISO(asset.updatedAt),
    martilleroId: asset.martilleroId,
    approvedById: asset.approvedById ?? null,
    martillero: serializeUserRef(asset.martillero),
    approvedBy: serializeUserRef(asset.approvedBy),
    _count: asset._count ? { bids: asset._count.bids ?? 0 } : null,
    bids: serializeBids(asset.bids),
  };
}

export function serializeGuarantee(
  guarantee: RawGuarantee | null | undefined
): SerializedGuarantee | null {
  if (!guarantee) return null;
  return {
    id: guarantee.id,
    userId: guarantee.userId,
    assetId: guarantee.assetId ?? null,
    isPaid: guarantee.isPaid,
    paymentDate: guarantee.paymentDate ? toISO(guarantee.paymentDate) : null,
    amount: toNumber(guarantee.amount),
    paymentMethod: guarantee.paymentMethod ?? null,
    createdAt: toISO(guarantee.createdAt),
    asset: guarantee.asset ?? null,
    user: serializeUserRef(guarantee.user),
  };
}
