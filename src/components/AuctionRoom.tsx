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
      // No op — el próximo evento o reconexión reintenta la sincronización
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
    <div className="space-y-4">
      {connected && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Conectado en tiempo real
        </div>
      )}

      <LiveBid currentPrice={currentPrice} bidCount={bidCount} />

      <WinnerIndicator winner={winner} bidCount={bidCount} />

      {isActive && isPostor && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-medium">Realizar puja</h3>
          {guaranteeState === "paid" ? (
            <BidControls assetId={assetId} currentPrice={currentPrice} />
          ) : guaranteeState === "pending" ? (
            <div className="space-y-1 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Solicitud de garantía enviada</p>
              <p className="text-amber-700">
                Está en revisión por el administrador. Podrá pujar cuando sea
                aprobada.
              </p>
            </div>
          ) : (
            <GuaranteePrompt assetId={assetId} />
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Últimas 5 pujas
        </h3>
        <BidHistoryList bids={bids} newBidId={newBidId} />
      </div>

      {auctionStatus === "ADJUDICADO" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-lg font-bold text-green-800">
            Remate adjudicado
          </h3>
          {winner && (
            <p className="text-green-700">
              Ganador: {winner.name || winner.email}
            </p>
          )}
        </div>
      )}

      {auctionStatus === "DESIERTO" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-lg font-bold text-yellow-800">
            Remate desierto
          </h3>
          <p className="text-yellow-700">
            No se realizaron pujas válidas.
          </p>
        </div>
      )}
    </div>
  );
}
