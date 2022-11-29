import { v4, v5 } from "https://deno.land/std@0.160.0/uuid/mod.ts";
import { findWsById } from "./serverstate.ts";

const clients = new Map<string, WebSocket>();

export async function connect(ws: WebSocket, isHost: boolean) {
    let id;
    if (isHost) id = 
    const id = await v5.generate(
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    new TextEncoder().encode(JSON.stringify(ws)),
  );
  clients.set(id, ws);
  return id;
}
export function disconnect(id: string) {
  clients.delete(id);
}

export function sendMessageToId(id: string, message: any) {
  const ws = clients.get(id);
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(message));
}
