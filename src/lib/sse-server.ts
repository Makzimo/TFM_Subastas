import { prisma } from "@/lib/prisma";
import {
  buildNotifyPayload,
  startRealtimeListener,
  type RealtimeEventEnvelope,
} from "@/lib/realtime";

const CHANNEL = "auction_events";

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

type SSEEvent = RealtimeEventEnvelope;

interface SSEServerState {
  assetConnections: Map<string, Set<SSEClient>>;
  clientCounter: number;
  listenerStarted: boolean;
}

// Singleton a nivel de proceso (globalThis): en dev, Next.js puede compilar
// route handlers y server actions en "module graphs" separados, creando
// múltiples instancias de este módulo. Compartir el estado via globalThis
// garantiza que todos operan sobre el MISMO registro de conexiones.
const globalForSSE = globalThis as unknown as {
  sseServer?: SSEServerState;
};

function getState(): SSEServerState {
  if (!globalForSSE.sseServer) {
    globalForSSE.sseServer = {
      assetConnections: new Map(),
      clientCounter: 0,
      listenerStarted: false,
    };
  }
  return globalForSSE.sseServer;
}

function startListener(): void {
  const state = getState();
  if (state.listenerStarted) return;
  state.listenerStarted = true;
  startRealtimeListener((assetId, event) => {
    broadcastLocal(assetId, event);
  });
}

export function addClient(
  assetId: string,
  controller: ReadableStreamDefaultController
): string {
  startListener();

  const state = getState();
  const id = String(++state.clientCounter);

  if (!state.assetConnections.has(assetId)) {
    state.assetConnections.set(assetId, new Set());
  }

  state.assetConnections.get(assetId)!.add({ id, controller });

  return id;
}

export function removeClient(assetId: string, clientId: string): void {
  const state = getState();
  const clients = state.assetConnections.get(assetId);
  if (!clients) return;

  for (const client of clients) {
    if (client.id === clientId) {
      clients.delete(client);
      break;
    }
  }

  if (clients.size === 0) {
    state.assetConnections.delete(assetId);
  }
}

function broadcastLocal(assetId: string, event: SSEEvent): void {
  const state = getState();
  const clients = state.assetConnections.get(assetId);
  if (!clients || clients.size === 0) return;

  const message = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  const deadClients: SSEClient[] = [];

  for (const client of clients) {
    try {
      client.controller.enqueue(encoded);
    } catch {
      deadClients.push(client);
    }
  }

  for (const dead of deadClients) {
    clients.delete(dead);
  }

  if (clients.size === 0) {
    state.assetConnections.delete(assetId);
  }
}

export function broadcastToAsset(assetId: string, event: SSEEvent): void {
  broadcastLocal(assetId, event);

  void prisma
    .$executeRaw`SELECT pg_notify(${CHANNEL}, ${buildNotifyPayload(assetId, event)})`
    .catch((err: unknown) => {
      console.error(
        "[realtime] error publicando evento:",
        err instanceof Error ? err.message : String(err)
      );
    });
}

export function getClientCount(assetId: string): number {
  return getState().assetConnections.get(assetId)?.size ?? 0;
}
