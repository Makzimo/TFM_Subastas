import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type TestRole = "POSTOR" | "MARTILLERO" | "ADMINISTRATIVO";

const date = new Date("2026-11-05T12:00:00.000Z");
const state = {
  user: { id: "postor-1", role: "POSTOR" as TestRole },
  rateAllowed: true,
  assetOwner: "martillero-1" as string | null,
  placeError: null as Error | null,
  closeError: null as Error | null,
  placedArgs: null as { assetId: string; userId: string; amount: number } | null,
};

mock.module("@/lib/current-user", {
  exports: {
    getActiveUser: async () => ({
      id: state.user.id,
      role: state.user.role,
      email: "user@example.cl",
      name: "Usuario",
      isActive: true,
    }),
  },
});
mock.module("@/lib/rate-limit", {
  exports: {
    checkRateLimit: () => ({ allowed: state.rateAllowed, retryAfterMs: 2_000 }),
  },
});
mock.module("@/lib/prisma", {
  exports: {
    prisma: {
      asset: {
        findUnique: async () => state.assetOwner === null ? null : { martilleroId: state.assetOwner },
      },
    },
  },
});
mock.module("@/lib/auction-engine", {
  exports: {
    placeBid: async (assetId: string, userId: string, amount: number) => {
      if (state.placeError) throw state.placeError;
      state.placedArgs = { assetId, userId, amount };
      return {
        id: "bid-1", amount: { toNumber: () => amount }, createdAt: date,
        isWinning: true, userId, assetId,
        user: { id: userId, name: "Postor", email: "postor@example.cl" },
      };
    },
    closeAuction: async (assetId: string) => {
      if (state.closeError) throw state.closeError;
      return { id: assetId, status: "ADJUDICADO" };
    },
    getBidsByAsset: async () => [],
    getLatestBids: async () => [],
    getWinningBid: async () => null,
  },
});

let closeAuctionAction: typeof import("./bids").closeAuctionAction;
let placeBidAction: typeof import("./bids").placeBidAction;

before(async () => {
  ({ closeAuctionAction, placeBidAction } = await import("./bids"));
});

function bidForm(assetId: string, amount: string): FormData {
  const form = new FormData();
  form.set("assetId", assetId);
  form.set("amount", amount);
  return form;
}

beforeEach(() => {
  state.user = { id: "postor-1", role: "POSTOR" };
  state.rateAllowed = true;
  state.assetOwner = "martillero-1";
  state.placeError = null;
  state.closeError = null;
  state.placedArgs = null;
});

test("placeBidAction valida lote y monto antes de invocar el motor", async () => {
  const missingAsset = await placeBidAction(null, bidForm("", "1050000"));
  const invalidAmount = await placeBidAction(null, bidForm("asset-1", "NaN"));
  assert.deepEqual(missingAsset, { success: false, error: "Lote no especificado" });
  assert.deepEqual(invalidAmount, { success: false, error: "Monto inválido" });
  assert.equal(state.placedArgs, null);
});

test("placeBidAction aplica rate limit", async () => {
  state.rateAllowed = false;
  const result = await placeBidAction(null, bidForm("asset-1", "1050000"));
  assert.equal(result.success, false);
  assert.match(result.error ?? "", /2 segundos/);
});

test("placeBidAction delega al motor y serializa Decimal y Date", async () => {
  const result = await placeBidAction(null, bidForm("asset-1", "1050000"));
  const data = result.data as { amount: number; createdAt: string } | undefined;
  assert.deepEqual(state.placedArgs, { assetId: "asset-1", userId: "postor-1", amount: 1_050_000 });
  assert.equal(result.success, true);
  assert.deepEqual(data && { amount: data.amount, createdAt: data.createdAt }, {
    amount: 1_050_000,
    createdAt: "2026-11-05T12:00:00.000Z",
  });
});

test("placeBidAction convierte errores del motor en ActionResult", async () => {
  state.placeError = new Error("puja rechazada");
  assert.deepEqual(await placeBidAction(null, bidForm("asset-1", "1050000")), {
    success: false,
    error: "puja rechazada",
  });
});

test("closeAuctionAction impide a un martillero cerrar lotes ajenos", async () => {
  state.user = { id: "martillero-2", role: "MARTILLERO" };
  const result = await closeAuctionAction("asset-1");
  assert.deepEqual(result, { success: false, error: "No tienes permiso para cerrar este remate" });
});

test("closeAuctionAction retorna un contrato plano al cerrar", async () => {
  state.user = { id: "admin-1", role: "ADMINISTRATIVO" };
  assert.deepEqual(await closeAuctionAction("asset-1"), {
    success: true,
    data: { assetId: "asset-1", status: "ADJUDICADO" },
  });
});
