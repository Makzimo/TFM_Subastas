import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

interface GuaranteeFixture {
  id: string;
  userId: string;
  assetId: string;
  isPaid: boolean;
  paymentDate: Date | null;
  amount: { toNumber: () => number };
  paymentMethod: string;
  createdAt: Date;
}

const date = new Date("2026-11-05T12:00:00.000Z");
const state = {
  assetExists: true,
  existing: null as GuaranteeFixture | null,
  guarantee: null as GuaranteeFixture | null,
  userRole: "POSTOR",
};

function fixture(overrides: Partial<GuaranteeFixture> = {}): GuaranteeFixture {
  return {
    id: "guarantee-1",
    userId: "postor-1",
    assetId: "asset-1",
    isPaid: false,
    paymentDate: null,
    amount: { toNumber: () => 500_000 },
    paymentMethod: "WEBPAY",
    createdAt: date,
    ...overrides,
  };
}

const prismaMock = {
  asset: { findUnique: async () => state.assetExists ? { id: "asset-1" } : null },
  bidderGuarantee: {
    findFirst: async () => state.existing,
    findUnique: async () => state.guarantee,
    findMany: async () => state.guarantee ? [state.guarantee] : [],
    create: async (args: { data: { userId: string; assetId: string; paymentMethod: string } }) => {
      state.guarantee = fixture(args.data);
      return state.guarantee;
    },
    update: async (args: { data: { isPaid: boolean; paymentDate: Date | null } }) => {
      if (!state.guarantee) throw new Error("Garantía no encontrada");
      state.guarantee = { ...state.guarantee, ...args.data };
      return state.guarantee;
    },
  },
};

mock.module("@/lib/prisma", { exports: { prisma: prismaMock } });
mock.module("@/lib/current-user", {
  exports: {
    getActiveUser: async () => ({
      id: "postor-1", email: "postor@example.cl", name: "Postor",
      role: state.userRole, isActive: true,
    }),
  },
});

let createGuaranteeAction: typeof import("./guarantees").createGuaranteeAction;
let getAllGuaranteesAction: typeof import("./guarantees").getAllGuaranteesAction;
let getMyGuaranteeForAssetAction: typeof import("./guarantees").getMyGuaranteeForAssetAction;
let updateGuaranteeStatusAction: typeof import("./guarantees").updateGuaranteeStatusAction;

before(async () => {
  ({
    createGuaranteeAction,
    getAllGuaranteesAction,
    getMyGuaranteeForAssetAction,
    updateGuaranteeStatusAction,
  } = await import("./guarantees"));
});

function guaranteeForm(assetId: string, paymentMethod: string): FormData {
  const form = new FormData();
  form.set("assetId", assetId);
  form.set("paymentMethod", paymentMethod);
  return form;
}

beforeEach(() => {
  state.assetExists = true;
  state.existing = null;
  state.guarantee = null;
  state.userRole = "POSTOR";
});

test("createGuaranteeAction valida lote y método de pago", async () => {
  assert.deepEqual(await createGuaranteeAction(null, guaranteeForm("", "WEBPAY")), {
    success: false, error: "Lote no especificado",
  });
  assert.deepEqual(await createGuaranteeAction(null, guaranteeForm("asset-1", "EFECTIVO")), {
    success: false, error: "Método de pago no válido",
  });
});

test("createGuaranteeAction rechaza lote inexistente y duplicados", async () => {
  state.assetExists = false;
  assert.equal((await createGuaranteeAction(null, guaranteeForm("asset-1", "VISA"))).error, "Lote no encontrado");
  state.assetExists = true;
  state.existing = fixture({ isPaid: true });
  assert.match((await createGuaranteeAction(null, guaranteeForm("asset-1", "VISA"))).error ?? "", /aprobada/);
});

test("createGuaranteeAction crea y serializa la garantía", async () => {
  const result = await createGuaranteeAction(null, guaranteeForm("asset-1", "WEBPAY"));
  const data = result.data as { amount: number; createdAt: string; paymentDate: string | null } | undefined;
  assert.equal(result.success, true);
  assert.deepEqual(data && {
    amount: data.amount,
    createdAt: data.createdAt,
    paymentDate: data.paymentDate,
  }, { amount: 500_000, createdAt: date.toISOString(), paymentDate: null });
});

test("updateGuaranteeStatusAction maneja inexistencia y serializa aprobación", async () => {
  assert.deepEqual(await updateGuaranteeStatusAction("missing", true), {
    success: false, error: "Garantía no encontrada",
  });
  state.guarantee = fixture();
  const result = await updateGuaranteeStatusAction("guarantee-1", true);
  const data = result.data as { isPaid: boolean; paymentDate: string | null } | undefined;
  assert.equal(result.success, true);
  assert.equal(data?.isPaid, true);
  assert.equal(typeof data?.paymentDate, "string");
});

test("consultas de garantías no filtran Decimal ni Date por la frontera RSC", async () => {
  state.guarantee = fixture({ isPaid: true, paymentDate: date });
  state.existing = state.guarantee;
  const mine = await getMyGuaranteeForAssetAction("asset-1");
  const all = await getAllGuaranteesAction();
  assert.equal(mine?.amount, 500_000);
  assert.equal(mine?.paymentDate, date.toISOString());
  assert.equal(all[0]?.amount, 500_000);
  assert.equal(all[0]?.createdAt, date.toISOString());
});
