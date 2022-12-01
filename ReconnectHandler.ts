import { v5 } from "https://deno.land/std@0.160.0/uuid/mod.ts";
import { QUEUES } from "./AmqpInterface.ts";
import { amqp, amqpHandlers } from "./deps.ts";
import { handleFinalDisconnect } from "./server.ts";
import { selfInGame } from "./serverstate.ts";

const reconnectCodesLocal = new Map<string, string>(); // Map<id, reconnectCode>
const pendingReconnectsSynced = new Map<string, string>(); // Map<id, reconnectCode>

export async function generateReconnectCode(id: string): Promise<string> {
  let code = await v5.generate(
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    new TextEncoder().encode(JSON.stringify(id + Date.now() + Math.random())),
  );
  code = code.replaceAll("-", "");
  reconnectCodesLocal.set(id, code);
  return code;
}

export function verifyReconnectCode(id: string, code: string): boolean {
  return pendingReconnectsSynced.get(id) === code;
}

export async function startReconnectTransaction(id: string) {
  await amqp.publish(QUEUES.reconnect, {
    id: id,
    code: reconnectCodesLocal.get(id),
  });
}

export async function completeReconnectTransaction(
  id: string,
): Promise<string> {
  await amqp.publish(QUEUES.reconnectComplete, { id: id });
  // Regenerate reconnect code
  const newCode = await generateReconnectCode(id);
  return newCode;
}

async function subscribeToReconnects() {
  await amqp.subscribe(QUEUES.reconnect, (message: any) => {
    pendingReconnectsSynced.set(message.id, message.code);
    // Timeout reconnects after 20 seconds
    setTimeout(() => {
      if (pendingReconnectsSynced.get(message.id) === message.code) {
        pendingReconnectsSynced.delete(message.id);
        amqpHandlers.handleSendGameClosedMessage(message.id);
        handleFinalDisconnect(message.id);
      }
    }, 60_000);
  });
}
subscribeToReconnects();

async function subscribeToReconnectComplete() {
  await amqp.subscribe(QUEUES.reconnectComplete, (message: any) => {
    pendingReconnectsSynced.delete(message.id);
  });
}
subscribeToReconnectComplete();
