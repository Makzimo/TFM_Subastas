import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type AssetStatus = "PENDIENTE" | "ACTIVO" | "ADJUDICADO" | "DESIERTO";

interface TestBid {
  id: string;
  amount: number;
  userId: string;
  assetId: string;
  isWinning: boolean;
  createdAt: Date;
  user: { name: string | null; email: string };
}

interface TestAsset {
  id: string;
  status: AssetStatus;
  martilleroId: string;
  currentPrice: number;
  updatedAt: Date;
  bids: TestBid[];
}

const state = {
  asset: null as TestAsset | null,
  guaranteeAssetId: "asset-1" as string | null,
  previousWinner: null as TestBid | null,
  createdBid: null as TestBid | null,
  transactionCalls: 0,
  lockQueries: 0,
  lockSql: "",
  assetUpdates: [] as Array<{ status?: AssetStatus; currentPrice?: number }>,
  failOnCreate: false,
  broadcasts: [] as Array<{ assetId: string; event: string }>,
};

const tx = {
  $queryRaw: async (strings: TemplateStringsArray): Promise<Array<{ id: string; status: AssetStatus; currentPrice: string }>> => {
    state.lockQueries += 1;
    state.lockSql = strings.join("?");
    if (!state.asset) return [];
    return [{ id: state.asset.id, status: state.asset.status, currentPrice: String(state.asset.currentPrice) }];
  },
  bidderGuarantee: {
    findFirst: async (args: { where: { assetId: string; isPaid: boolean } }) =>
      args.where.isPaid && args.where.assetId === state.guaranteeAssetId ? { id: "guarantee-1" } : null,
  },
  bid: {
    findFirst: async () => state.previousWinner,
    update: async () => state.previousWinner,
    create: async (args: { data: { amount: number; userId: string; assetId: string } }) => {
      if (state.failOnCreate) throw new Error("fallo de escritura");
      const bid: TestBid = {
        id: "bid-new",
        ...args.data,
        isWinning: true,
        createdAt: new Date("2026-11-05T12:00:00.000Z"),
        user: { name: "Postor", email: "postor@example.cl" },
      };
      state.createdBid = bid;
      return bid;
    },
    count: async () => 1,
  },
  asset: {
    update: async (args: { data: { currentPrice: number } }) => {
      state.assetUpdates.push(args.data);
      return state.asset;
    },
  },
};

const prismaMock = {
  asset: {
    findUnique: async () => state.asset,
    update: async (args: { data: { status: AssetStatus } }) => {
      state.assetUpdates.push(args.data);
      if (!state.asset) throw new Error("Lote no encontrado");
      return { ...state.asset, status: args.data.status };
    },
  },
  bid: { count: async () => state.asset?.bids.length ?? 0 },
  $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>): Promise<T> => {
    state.transactionCalls += 1;
    const snapshot = [...state.assetUpdates];
    try {
      return await callback(tx);
    } catch (error) {
      state.assetUpdates = snapshot;
      throw error;
    }
  },
};

mock.module("@/lib/prisma", { exports: { prisma: prismaMock } });
mock.module("@/lib/sse-server", {
  exports: {
    broadcastToAsset: (assetId: string, payload: { event: string }) => {
      state.broadcasts.push({ assetId, event: payload.event });
    },
  },
});
mock.module("@/lib/audit", { exports: { logAction: () => Promise.resolve() } });

let closeAuction: typeof import("./auction-engine").closeAuction;
let placeBid: typeof import("./auction-engine").placeBid;

before(async () => {
  ({ closeAuction, placeBid } = await import("./auction-engine"));
});

function activeAsset(overrides: Partial<TestAsset> = {}): TestAsset {
  return {
    id: "asset-1",
    status: "ACTIVO",
    martilleroId: "martillero-1",
    currentPrice: 1_000_000,
    updatedAt: new Date("2026-11-05T12:00:00.000Z"),
    bids: [],
    ...overrides,
  };
}

beforeEach(() => {
  state.asset = activeAsset();
  state.guaranteeAssetId = "asset-1";
  state.previousWinner = null;
  state.createdBid = null;
  state.transactionCalls = 0;
  state.lockQueries = 0;
  state.lockSql = "";
  state.assetUpdates = [];
  state.failOnCreate = false;
  state.broadcasts = [];
});

test("placeBid exige garantía pagada para el lote específico", async () => {
  state.guaranteeAssetId = "otro-lote";
  await assert.rejects(placeBid("asset-1", "postor-1", 1_050_000), /garantía de seriedad pagada/);
  assert.equal(state.createdBid, null);
});

test("placeBid rechaza monto igual o inferior al precio bloqueado", async () => {
  await assert.rejects(placeBid("asset-1", "postor-1", 1_000_000), /mayor al precio actual/);
});

test("placeBid aplica incremento mínimo de $50.000", async () => {
  await assert.rejects(placeBid("asset-1", "postor-1", 1_049_999), /incremento mínimo/);
  const bid = await placeBid("asset-1", "postor-1", 1_050_000);
  assert.equal(Number(bid.amount), 1_050_000);
});

test("placeBid revierte la transacción cuando falla la creación", async () => {
  state.previousWinner = {
    id: "bid-old", amount: 1_000_000, userId: "postor-old", assetId: "asset-1",
    isWinning: true, createdAt: new Date(), user: { name: null, email: "old@example.cl" },
  };
  state.failOnCreate = true;
  await assert.rejects(placeBid("asset-1", "postor-1", 1_050_000), /fallo de escritura/);
  assert.deepEqual(state.assetUpdates, []);
  assert.deepEqual(state.broadcasts, []);
});

test("placeBid bloquea el lote con FOR UPDATE dentro de la transacción", async () => {
  await placeBid("asset-1", "postor-1", 1_050_000);
  assert.equal(state.transactionCalls, 1);
  assert.equal(state.lockQueries, 1);
  assert.match(state.lockSql, /FOR UPDATE/);
  assert.deepEqual(state.assetUpdates, [{ currentPrice: 1_050_000 }]);
});

test("closeAuction valida permisos e idempotencia", async () => {
  await assert.rejects(closeAuction("asset-1", "otro-martillero", "MARTILLERO"), /permiso/);
  state.asset = activeAsset({ status: "ADJUDICADO" });
  await assert.rejects(closeAuction("asset-1", "martillero-1", "MARTILLERO"), /no está activo/);
});

test("closeAuction adjudica al ganador cuando existen pujas", async () => {
  const winner: TestBid = {
    id: "bid-win", amount: 1_100_000, userId: "postor-win", assetId: "asset-1",
    isWinning: true, createdAt: new Date(), user: { name: "Ganador", email: "winner@example.cl" },
  };
  state.asset = activeAsset({ bids: [winner] });
  const closed = await closeAuction("asset-1", "martillero-1", "MARTILLERO");
  assert.equal(closed.status, "ADJUDICADO");
  assert.deepEqual(state.broadcasts, [{ assetId: "asset-1", event: "auction-closed" }]);
});

test("closeAuction declara DESIERTO un lote sin pujas y permite cierre administrativo", async () => {
  const closed = await closeAuction("asset-1", "admin-1", "ADMINISTRATIVO");
  assert.equal(closed.status, "DESIERTO");
});
