import { findWsById } from "./serverstate.ts";

export function sendMessageToId(id: string, message: any) {
  const ws = findWsById(id);
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(message));
}