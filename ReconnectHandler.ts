import { v5 } from "https://deno.land/std@0.160.0/uuid/mod.ts";
import {
  createQueue,
  publish,
  QUEUES,
  subscribe,
} from "./MessageBrokerInterface.ts";

const reconnectCodesLocal = new Map<string, string>(); // Map<id, reconnectCode>
const pendingReconnectsSynced = new Map<string, string>(); // Map<id, reconnectCode>

export async function generateReconnectCode(id: string): Promise<string> {
  const code = await v5.generate(
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    new TextEncoder().encode(JSON.stringify(id + Date.now() + Math.random())),
  );
  reconnectCodesLocal.set(id, code);
  return code;
}

export async function allowReconnectForId(id: string) {
  await publish(QUEUES.reconnect, {
    id: id,
    code: reconnectCodesLocal.get(id),
  });
}

async function subscribeToReconnects() {
  await subscribe(QUEUES.reconnect, (message: any) => {
    pendingReconnectsSynced.set(message.id, message.code);
    // Timeout reconnects after 20 seconds
    setTimeout(() => {
      if (pendingReconnectsSynced.get(message.id) === message.code) {
        pendingReconnectsSynced.delete(message.id);
      }
    }, 20_000);
  });
}
subscribeToReconnects();
