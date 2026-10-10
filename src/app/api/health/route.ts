import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_VERSION = `v${pkg.version}`;

export async function GET(): Promise<NextResponse> {
  const startedAt = Date.now();
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    console.error("[health] DB check failed", error);
  }

  const body = {
    status: dbOk ? "ok" : "error",
    version: APP_VERSION,
    checks: { db: dbOk ? "ok" : "fail" },
    latencyMs: Date.now() - startedAt,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
