"use client";

import { useState, useEffect } from "react";

interface AuctionTimerProps {
  endsAt: string | Date;
  onEnd?: () => void;
}

export function AuctionTimer({ endsAt, onEnd }: AuctionTimerProps) {
  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    const target = new Date(endsAt).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setRemaining("Finalizado");
        onEnd?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setRemaining(parts.join(" "));
    }

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onEnd]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        Tiempo restante
      </h3>
      <p className="text-2xl font-bold tabular-nums">{remaining}</p>
    </div>
  );
}
