import { uuid } from "./deps.ts";
import { flags } from "./server.ts";
import { gameExists } from "./serverstate.ts";

export class ExtendedWs extends WebSocket {
  id: string | undefined;
  reconnectCode: string | undefined;

  constructor(ws: WebSocket) {
    super(ws.url);
  }
}

export function applyHostId(ws: ExtendedWs) {
  if (ws.id) return;
  let id: string;
  do {
    id = Math.floor(Math.random() * 998 + 1)
      .toString().padStart(4, "0");
  } while (gameExists(id));

  // Override host id to 0000 if in debug mode
  if (flags.debug) id = "0000";

  ws.id = id;
}

export function applyAttendeeId(ws: ExtendedWs) {
  if (ws.id) return;
  ws.id = uuid.generate() as string;
}

export function applyReconnectCode(ws: ExtendedWs) {
  if (ws.reconnectCode) return;
  ws.reconnectCode = uuid.generate() as string;
}
