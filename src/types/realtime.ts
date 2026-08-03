export interface LiveBidEventData {
  assetId: string;
  eventId: string;
  bid: {
    id: string;
    amount: number;
    bidderName: string;
    bidderEmail: string;
    createdAt: string;
    userId: string;
  };
  currentPrice: number;
  bidCount: number;
  winnerId: string;
  winnerName: string;
}

export interface AuctionClosedEventData {
  assetId: string;
  eventId: string;
  status: "ADJUDICADO" | "DESIERTO";
  winnerId: string | null;
  winnerName: string | null;
  bidderEmail: string | null;
  bidCount: number;
}

export interface ConnectedEventData {
  clientId: string;
}
