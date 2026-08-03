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
    <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-medium text-green-800">En vivo</span>
      </div>
      <div>
        <p className="text-sm text-green-700">Precio actual</p>
        <p className="text-2xl font-bold text-green-900">
          {formatCurrency(currentPrice)}
        </p>
      </div>
      <p className="text-sm text-green-700">
        {bidCount} {bidCount === 1 ? "puja" : "pujas"} realizadas
      </p>
    </div>
  );
}
