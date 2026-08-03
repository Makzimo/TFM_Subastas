import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuctionStatus, ApprovalStatus } from "@/generated/prisma/client";

interface AssetCardProps {
  id: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  status: AuctionStatus;
  imageUrl: string | null;
  bidCount: number;
  approvalStatus?: ApprovalStatus;
  martilleroName?: string;
  href?: string;
  showLiveButton?: boolean;
}

const STATUS_LABELS: Record<AuctionStatus, string> = {
  PENDIENTE: "Pendiente",
  ACTIVO: "Activo",
  ADJUDICADO: "Adjudicado",
  DESIERTO: "Desierto",
};

const STATUS_VARIANTS: Record<
  AuctionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDIENTE: "outline",
  ACTIVO: "default",
  ADJUDICADO: "secondary",
  DESIERTO: "destructive",
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  PENDIENTE: "Pendiente aprobación",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

const APPROVAL_COLORS: Record<ApprovalStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
  RECHAZADO: "bg-red-100 text-red-800",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AssetCard({
  id,
  description,
  basePrice,
  currentPrice,
  status,
  imageUrl,
  bidCount,
  approvalStatus,
  martilleroName,
  href,
  showLiveButton,
}: AssetCardProps) {
  return (
    <Link href={href ?? `/remates/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">
              {description}
            </CardTitle>
            <Badge variant={STATUS_VARIANTS[status]} className="shrink-0">
              {STATUS_LABELS[status]}
            </Badge>
          </div>
          {approvalStatus && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${APPROVAL_COLORS[approvalStatus]}`}
            >
              {APPROVAL_LABELS[approvalStatus]}
            </span>
          )}
        </CardHeader>
        <CardContent className="pb-3">
          {imageUrl ? (
            <div className="relative mb-3 aspect-video overflow-hidden rounded-md">
              <Image
                src={imageUrl}
                alt={description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="mb-3 flex aspect-video items-center justify-center rounded-md bg-muted">
              <span className="text-sm text-muted-foreground">
                Sin imagen
              </span>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Precio base</p>
            <p className="text-lg font-semibold">
              {formatCurrency(basePrice)}
            </p>
            {currentPrice !== basePrice && (
              <>
                <p className="text-sm text-muted-foreground">Precio actual</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(currentPrice)}
                </p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0 text-sm text-muted-foreground">
          <span>{bidCount} {bidCount === 1 ? "puja" : "pujas"}</span>
          <div className="flex items-center gap-2">
            {martilleroName && (
              <span className="text-xs">{martilleroName}</span>
            )}
            {showLiveButton && status === "ACTIVO" && (
              <Link
                href={`/remates/${id}`}
                className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
              >
                Ver en vivo
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
