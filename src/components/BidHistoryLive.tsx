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
      <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 p-6 text-center">
        <svg
          className="mx-auto h-8 w-8 text-neutral-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-2 text-sm text-neutral-500">
          Esperando primeras pujas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {bids.map((bid, index) => {
        const isWinner = index === 0;
        const isNew = bid.id === newBidId;

        return (
          <div
            key={bid.id}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
              isNew
                ? "border-orange-500/30 bg-orange-500/5"
                : isWinner
                  ? "border-neutral-700 bg-neutral-800/50"
                  : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                  isWinner
                    ? "bg-orange-500 text-white"
                    : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm ${isWinner ? "font-semibold text-white" : "text-neutral-400"}`}
                >
                  {bid.user.name || bid.user.email}
                </p>
                <p className="text-xs text-neutral-600">
                  {timeAgo(bid.createdAt)}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 text-sm tabular-nums ${isWinner ? "font-bold text-white" : "font-medium text-neutral-500"}`}
            >
              {formatCurrency(bid.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
