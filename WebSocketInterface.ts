import { Game } from "./Game.ts";
import { handleFinalDisconnect } from "./server.ts";
import { generateId } from "./Utils.ts";

const clients = new Map<string, WebSocket>();

export async function connected(
  ws: WebSocket,
  isHost?: boolean,
  id?: string,
): Promise<string> {
  id = id || await generateId(ws, isHost ?? false);
  clients.set(id, ws);
  return id;
}

export function disconnected(id: string) {
  clients.delete(id);
}

export function close(id: string) {
  const ws = clients.get(id);
  handleFinalDisconnect(id);
  ws?.close();
}

export function getId(ws: WebSocket): string | undefined {
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

export function sendMatchedMessage(id: string, game: Game) {
  sendMessageToId(id, {
    type: "matched",
    fen: game.getFEN(),
  });
}
