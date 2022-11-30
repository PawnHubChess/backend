import { generateId } from "./Utils.ts";

const clients = new Map<string, WebSocket>();

export async function connect(
  ws: WebSocket,
  isHost?: boolean,
  id?: string,
): Promise<string> {
  id = id || await generateId(ws, isHost ?? false);
  clients.set(id, ws);
  return id;
}

export function disconnect(id: string) {
  clients.delete(id);
}

export function getId(ws: WebSocket) {
  return [...clients.entries()].find(([, v]) => v === ws)?.[0];
}

export function isConnected(id: string) {
  return clients.has(id);
}

export function sendMessageToId(id: string, message: any) {
  const ws = clients.get(id);
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(message));
}

export function sendRequestMessage(ownId: string, clientId: string, code: string) {
  sendMessageToId(ownId, {
    type: "verify-attendee-request",
    clientId: clientId,
    code: code,
  })
}