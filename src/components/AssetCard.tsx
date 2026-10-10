"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

const STATUS_STYLES: Record<AuctionStatus, string> = {
  PENDIENTE: "border-neutral-700 text-neutral-400",
  ACTIVO: "border-emerald-500/30 text-emerald-400",
  ADJUDICADO: "border-blue-500/30 text-blue-400",
  DESIERTO: "border-red-500/30 text-red-400",
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  PENDIENTE: "Pendiente aprobación",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

const APPROVAL_COLORS: Record<ApprovalStatus, string> = {
  PENDIENTE: "border-yellow-500/30 text-yellow-400",
  APROBADO: "border-emerald-500/30 text-emerald-400",
  RECHAZADO: "border-red-500/30 text-red-400",
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
  martilleroName: _martilleroName,
  href,
  showLiveButton,
}: AssetCardProps) {
  const router = useRouter();
  const cardHref = href ?? `/remates/${id}`;
  const hasBids = currentPrice !== basePrice;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 cursor-pointer"
      onClick={() => router.push(cardHref)}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={description}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        {status === "ACTIVO" && (
          <div className="absolute top-3 right-3">
            <span className="flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3">
          {description}
        </h3>

        {approvalStatus && (
          <span
            className={`mb-3 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${APPROVAL_COLORS[approvalStatus]}`}
          >
            {APPROVAL_LABELS[approvalStatus]}
          </span>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {hasBids ? "Puja actual" : "Precio base"}
              </p>
              <p className="text-lg font-bold text-white tabular-nums">
                {formatCurrency(hasBids ? currentPrice : basePrice)}
              </p>
            </div>
            {hasBids && (
              <div className="text-right">
                <p className="text-xs text-neutral-600">Base</p>
                <p className="text-sm text-neutral-500 line-through tabular-nums">
                  {formatCurrency(basePrice)}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
            <span className="text-xs text-neutral-500">
              {bidCount} {bidCount === 1 ? "puja" : "pujas"}
            </span>
            {showLiveButton && status === "ACTIVO" ? (
              <Link
                href={cardHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                Ver en vivo
              </Link>
            ) : (
              <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-300 transition-colors">
                Ver detalle →
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
