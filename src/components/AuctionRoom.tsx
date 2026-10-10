"use client";

import { useCallback, useRef, useState } from "react";
import { useSSE } from "@/hooks/useSSE";
import { LiveBid } from "@/components/LiveBid";
import { BidControls } from "@/components/BidControls";
import { WinnerIndicator } from "@/components/WinnerIndicator";
import { GuaranteePrompt } from "@/components/GuaranteePrompt";
import { BidHistoryLive, BidHistoryList } from "@/components/BidHistoryLive";
import { getAssetByIdAction } from "@/app/actions/assets";
import { getLatestBidsAction } from "@/app/actions/bids";
import type {
  LiveBidEventData,
  AuctionClosedEventData,
} from "@/types/realtime";

interface BidItem {
  id: string;
  amount: number;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
  isWinning: boolean;
}

interface WinnerInfo {
  name: string | null;
  email: string;
}

interface AuctionRoomProps {
  assetId: string;
  initialPrice: number;
  initialBidCount: number;
  initialWinner: {
    name: string | null;
    email: string;
  } | null;
  status: string;
  userRole: string | null;
  guaranteeState: "none" | "pending" | "paid";
  initialBids: BidItem[];
}

export function AuctionRoom({
  assetId,
  initialPrice,
  initialBidCount,
  initialWinner,
  status,
  userRole,
  guaranteeState,
  initialBids,
}: AuctionRoomProps) {
  const { bids, addBid, resetBids, newBidId } = BidHistoryLive({ initialBids });

  const [auctionStatus, setAuctionStatus] = useState(status);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);
  const [winner, setWinner] = useState<WinnerInfo | null>(initialWinner);
  const hasConnectedOnce = useRef(false);

  const handleBid = useCallback(
    (data: LiveBidEventData) => {
      if (data.assetId !== assetId) return;
      addBid(data);
      setCurrentPrice(data.currentPrice);
      setBidCount(data.bidCount);
      setWinner({ name: data.winnerName, email: data.bid.bidderEmail });
    },
    [assetId, addBid]
  );

  const handleAuctionClosed = useCallback(
    (data: AuctionClosedEventData) => {
      if (data.assetId !== assetId) return;
      setAuctionStatus(data.status);
      if (data.winnerName) {
        setWinner({ name: data.winnerName, email: data.bidderEmail ?? "" });
      }
      if (data.bidCount !== undefined) {
        setBidCount(data.bidCount);
      }
    },
    [assetId]
  );

  const syncState = useCallback(async () => {
    try {
      const [asset, latestBids] = await Promise.all([
        getAssetByIdAction(assetId),
        getLatestBidsAction(assetId, 5),
      ]);

      if (asset) {
        setCurrentPrice(Number(asset.currentPrice));
        setBidCount(asset._count?.bids ?? 0);
        setAuctionStatus(asset.status);
        const latest = asset.bids?.[0];
        if (latest?.user) {
          setWinner({ name: latest.user.name, email: latest.user.email });
        }
      }

      resetBids(
        latestBids.map((b) => ({
          id: b.id,
          amount: Number(b.amount),
          user: b.user
            ? { id: b.user.id ?? "", name: b.user.name, email: b.user.email }
            : { id: "", name: null, email: "" },
          createdAt: b.createdAt,
          isWinning: b.isWinning,
        }))
      );
    } catch {
      // No op
    }
  }, [assetId, resetBids]);

  const handleConnected = useCallback(() => {
    if (hasConnectedOnce.current) {
      void syncState();
    }
    hasConnectedOnce.current = true;
  }, [syncState]);

  const { connected } = useSSE({
    assetId,
    onBid: handleBid,
    onAuctionClosed: handleAuctionClosed,
    onConnected: handleConnected,
  });

  const isPostor = userRole === "POSTOR";
  const isActive = auctionStatus === "ACTIVO";

  return (
    <>
      {/* Centro — LiveBid + puja/garantía */}
      <div className="col-span-12 lg:col-span-5 lg:col-start-5 space-y-4">
        {connected && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            En tiempo real
          </div>
        )}

        <LiveBid currentPrice={currentPrice} bidCount={bidCount} />

        {isActive && isPostor && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Realizar puja
            </p>
            {guaranteeState === "paid" ? (
              <BidControls assetId={assetId} currentPrice={currentPrice} />
            ) : guaranteeState === "pending" ? (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-400">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Solicitud en revisión</p>
                  <p className="mt-0.5 text-neutral-500">
                    Podrá pujar cuando la garantía sea aprobada.
                  </p>
                </div>
              </div>
            ) : (
              <GuaranteePrompt assetId={assetId} />
            )}
          </div>
        )}

        {auctionStatus === "ADJUDICADO" && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.244-1.764.894-1.764 1.821 0 .927.768 1.577 1.764 1.821M18.75 4.236c.996.244 1.764.894 1.764 1.821 0 .927-.768 1.577-1.764 1.821M4.5 12h15"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-400">
                  Remate adjudicado
                </p>
                {winner && (
                  <p className="text-sm text-neutral-400">
                    Ganador: {winner.name || winner.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {auctionStatus === "DESIERTO" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-neutral-300">
                  Remate desierto
                </p>
                <p className="text-sm text-neutral-500">
                  No se realizaron pujas válidas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Derecha — Ganador + historial sticky */}
      <div className="col-span-12 lg:col-span-3 lg:col-start-10 space-y-4">
        <WinnerIndicator winner={winner} bidCount={bidCount} />
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Últimas pujas
          </p>
          <BidHistoryList bids={bids} newBidId={newBidId} />
        </div>
      </div>
    </>
  );
}
