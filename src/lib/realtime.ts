import pg from "pg";
import crypto from "crypto";

const CHANNEL = "auction_events";

export interface RealtimeEventEnvelope {
  event: string;
  data: unknown;
}

interface NotifyPayload {
  instanceId: string;
  assetId: string;
  event: RealtimeEventEnvelope;
}

type LocalHandler = (assetId: string, event: RealtimeEventEnvelope) => void;

interface RealtimeState {
  instanceId: string;
  client: pg.Client | null;
  handler: LocalHandler | null;
}

const globalForRealtime = globalThis as unknown as {
  realtime?: RealtimeState;
};

function getState(): RealtimeState {
  if (!globalForRealtime.realtime) {
    globalForRealtime.realtime = {
      instanceId: crypto.randomUUID(),
      client: null,
      handler: null,
    };
  }
  return globalForRealtime.realtime;
}

export function getInstanceId(): string {
  return getState().instanceId;
}

export function startRealtimeListener(handler: LocalHandler): void {
  const state = getState();
  state.handler = handler;
  void ensureConnected(state);
}

async function ensureConnected(state: RealtimeState): Promise<void> {
  if (state.client) return;

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  client.on("error", (err) => {
    console.error("[realtime] error del listener:", err.message);
    state.client = null;
    void scheduleReconnect(state);
  });

  try {
    await client.connect();
    await client.query(`LISTEN ${CHANNEL}`);

    client.on("notification", (msg) => {
      if (!msg.payload) return;
      try {
        const parsed = JSON.parse(msg.payload) as NotifyPayload;
        if (parsed.instanceId === state.instanceId) return;
        state.handler?.(parsed.assetId, parsed.event);
      } catch (err) {
        console.error("[realtime] payload inválido:", err);
      }
    });

    state.client = client;
    console.log(`[realtime] listener LISTEN ${CHANNEL} activo (instancia ${state.instanceId.slice(0, 8)})`);
  } catch (err) {
    console.error("[realtime] no se pudo iniciar el listener:", err);
    state.client = null;
    void scheduleReconnect(state);
  }
}

function scheduleReconnect(state: RealtimeState): void {
  setTimeout(() => void ensureConnected(state), 3000);
}

export function buildNotifyPayload(
  assetId: string,
  event: RealtimeEventEnvelope
): string {
  const payload: NotifyPayload = {
    instanceId: getState().instanceId,
    assetId,
    event,
  };
  return JSON.stringify(payload);
}
