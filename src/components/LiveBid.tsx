"use client";

interface LiveBidProps {
  currentPrice: number;
  bidCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LiveBid({ currentPrice, bidCount }: LiveBidProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-400">
            En vivo
          </span>
        </div>
        <span className="text-xs tabular-nums text-neutral-500">
          {bidCount} {bidCount === 1 ? "puja" : "pujas"}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Precio actual
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-white">
          {formatCurrency(currentPrice)}
        </p>
      </div>
    </div>
  );
}
