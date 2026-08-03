import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toNumber,
  toISO,
  serializeBid,
  serializeBids,
  serializeAsset,
  serializeGuarantee,
} from "./serialize";

const date = new Date("2026-08-03T12:00:00.000Z");
const decimal = (n: number) => ({ toNumber: () => n });

test("toNumber convierte Decimal, string y number", () => {
  assert.equal(toNumber(decimal(500000)), 500000);
  assert.equal(toNumber("1500000"), 1500000);
  assert.equal(toNumber(750000), 750000);
});

test("toISO convierte Date a ISO string", () => {
  assert.equal(toISO(date), "2026-08-03T12:00:00.000Z");
  assert.equal(toISO("2026-08-03T12:00:00.000Z"), "2026-08-03T12:00:00.000Z");
});

test("serializeBid produce objeto 100% plano (sin Decimal ni Date)", () => {
  const bid = serializeBid({
    id: "b1",
    amount: decimal(1000000),
    createdAt: date,
    isWinning: true,
    userId: "u1",
    assetId: "a1",
    user: { id: "u1", name: "Ana", email: "ana@x.cl" },
  });

  assert.equal(bid.amount, 1000000);
  assert.equal(bid.createdAt, "2026-08-03T12:00:00.000Z");
  assert.equal(typeof bid.createdAt, "string");
  assert.equal(typeof bid.amount, "number");
  assert.deepEqual(bid.user, { id: "u1", name: "Ana", email: "ana@x.cl" });
  assert.doesNotThrow(() => JSON.stringify(bid));
});

test("serializeBids maneja listas y nulls", () => {
  const list = serializeBids([
    { id: "b1", amount: decimal(1), createdAt: date, isWinning: false, userId: "u1", user: null },
    { id: "b2", amount: 2, createdAt: "2026-08-03T12:00:00.000Z", isWinning: true, userId: "u2" },
  ]);
  assert.equal(list.length, 2);
  assert.equal(list[1].user, null);
  assert.deepEqual(serializeBids(null), []);
});

test("serializeAsset aplaniza precios y fechas conservando relaciones", () => {
  const asset = serializeAsset({
    id: "a1",
    description: "Toyota Hilux 2020",
    basePrice: decimal(15000000),
    currentPrice: decimal(15200000),
    status: "ACTIVO",
    approvalStatus: "APROBADO",
    imageUrl: "https://x.cl/img.png",
    createdAt: date,
    updatedAt: date,
    martilleroId: "m1",
    approvedById: "adm1",
    martillero: { id: "m1", name: "Marcelo", email: "m@x.cl" },
    approvedBy: { id: "adm1", name: null, email: "a@x.cl" },
    _count: { bids: 3 },
    bids: [
      { id: "b1", amount: decimal(15200000), createdAt: date, isWinning: true, userId: "u1", user: { id: "u1", name: "Ana", email: "ana@x.cl" } },
    ],
  });

  assert.ok(asset);
  assert.equal(asset.basePrice, 15000000);
  assert.equal(asset.currentPrice, 15200000);
  assert.equal(asset.createdAt, "2026-08-03T12:00:00.000Z");
  assert.equal(asset._count?.bids, 3);
  assert.equal(asset.martillero?.name, "Marcelo");
  assert.equal(asset.bids?.[0]?.amount, 15200000);
  assert.doesNotThrow(() => JSON.stringify(asset));
});

test("serializeAsset devuelve null si no hay asset", () => {
  assert.equal(serializeAsset(null), null);
  assert.equal(serializeAsset(undefined), null);
});

test("serializeGuarantee aplaniza amount y paymentDate", () => {
  const g = serializeGuarantee({
    id: "g1",
    userId: "u1",
    assetId: "a1",
    isPaid: true,
    paymentDate: date,
    amount: decimal(500000),
    paymentMethod: "VISA",
    createdAt: date,
    asset: { id: "a1", description: "Lote 1", status: "ACTIVO" },
    user: { id: "u1", name: "Ana", email: "ana@x.cl" },
  });

  assert.ok(g);
  assert.equal(g.amount, 500000);
  assert.equal(g.paymentDate, "2026-08-03T12:00:00.000Z");
  assert.equal(g.paymentMethod, "VISA");
  assert.equal(g.asset?.status, "ACTIVO");
  assert.doesNotThrow(() => JSON.stringify(g));
});

test("serializeGuarantee devuelve null si no hay garantía", () => {
  assert.equal(serializeGuarantee(null), null);
});
