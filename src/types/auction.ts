export enum Role {
  MARTILLERO = "MARTILLERO",
  POSTOR = "POSTOR",
  ADMINISTRATIVO = "ADMINISTRATIVO",
}

export enum AuctionStatus {
  PENDIENTE = "PENDIENTE",
  ACTIVO = "ACTIVO",
  ADJUDICADO = "ADJUDICADO",
  DESIERTO = "DESIERTO",
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  status: AuctionStatus;
  imageUrl: string | null;
  martilleroId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  amount: number;
  isWinning: boolean;
  userId: string;
  assetId: string;
  createdAt: Date;
}

export interface BidderGuarantee {
  id: string;
  userId: string;
  isPaid: boolean;
  paymentDate: Date | null;
  amount: number;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface BidInput {
  assetId: string;
  amount: number;
}

export interface AssetInput {
  description: string;
  basePrice: number;
  imageUrl?: string;
  martilleroId: string;
}
