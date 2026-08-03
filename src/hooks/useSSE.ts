"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  LiveBidEventData,
  AuctionClosedEventData,
  ConnectedEventData,
} from "@/types/realtime";

interface UseSSEOptions {
  assetId: string;
  onBid?: (data: LiveBidEventData) => void;
  onAuctionClosed?: (data: AuctionClosedEventData) => void;
  onConnected?: (data: ConnectedEventData) => void;
}

export function useSSE({ assetId, onBid, onAuctionClosed, onConnected }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connected, setConnected] = useState(false);
  const retryCount = useRef(0);
  const callbacksRef = useRef({ onBid, onAuctionClosed, onConnected });

  callbacksRef.current = { onBid, onAuctionClosed, onConnected };

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/sse/auctions/${assetId}`);
    eventSourceRef.current = es;

    es.addEventListener("connected", ((e: MessageEvent) => {
      setConnected(true);
      retryCount.current = 0;
      callbacksRef.current.onConnected?.(JSON.parse(e.data) as ConnectedEventData);
    }) as EventListener);

    es.addEventListener("bid", ((e: MessageEvent) => {
      callbacksRef.current.onBid?.(JSON.parse(e.data) as LiveBidEventData);
    }) as EventListener);

    es.addEventListener("auction-closed", ((e: MessageEvent) => {
      callbacksRef.current.onAuctionClosed?.(JSON.parse(e.data) as AuctionClosedEventData);
    }) as EventListener);

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;

      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current += 1;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [assetId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return { connected };
}
