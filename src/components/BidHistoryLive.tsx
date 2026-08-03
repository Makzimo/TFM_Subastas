"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LiveBidEventData } from "@/types/realtime";

interface BidItem {
  id: string;
  amount: number;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
  isWinning: boolean;
}

interface BidHistoryLiveProps {
  initialBids: BidItem[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 5) return "ahora";
  if (diffSec < 60) return `hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr}h`;
  return new Date(dateString).toLocaleDateString("es-CL");
}

export function BidHistoryLive({ initialBids }: BidHistoryLiveProps) {
  const [bids, setBids] = useState<BidItem[]>(initialBids);
  const [newBidId, setNewBidId] = useState<string | null>(null);
  const highlightTimeout = useRef<NodeJS.Timeout | null>(null);

  const addBid = useCallback((event: LiveBidEventData) => {
    const newBid: BidItem = {
      id: event.bid.id,
      amount: event.bid.amount,
      user: {
        id: event.bid.userId,
        name: event.bid.bidderName,
        email: event.bid.bidderEmail,
      },
      createdAt: event.bid.createdAt,
      isWinning: true,
    };

    setBids((prev) => {
      if (prev.some((b) => b.id === newBid.id)) return prev;
      const updated = [newBid, ...prev];
      return updated.slice(0, 5);
    });

    setNewBidId(newBid.id);
    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }
    highlightTimeout.current = setTimeout(() => {
      setNewBidId(null);
    }, 3000);
  }, []);

  const resetBids = useCallback((items: BidItem[]) => {
    setBids(items);
    setNewBidId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
    };
  }, []);

  return { bids, addBid, resetBids, newBidId };
}

export function BidHistoryList({
  bids,
  newBidId,
}: {
  bids: BidItem[];
  newBidId: string | null;
}) {
  if (bids.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Esperando primeras pujas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bids.map((bid, index) => (
        <div
          key={bid.id}
          className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
            bid.id === newBidId
              ? "border-green-300 bg-green-50"
              : index === 0
                ? "border-green-200 bg-green-50/50"
                : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                index === 0
                  ? "bg-green-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium">
                {bid.user.name || bid.user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeAgo(bid.createdAt)}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-bold ${
              index === 0 ? "text-green-600" : "text-slate-700"
            }`}
          >
            {formatCurrency(bid.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
