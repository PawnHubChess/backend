import { v5 } from "https://deno.land/std@0.160.0/uuid/mod.ts";
import { flags } from "./server.ts";
import { isConnected } from "./WebSocketInterface.ts";

export async function generateId(ws: WebSocket, isHost: boolean): Promise<string> {
  if (isHost) {
    return generateHostId();
  } else {
    return await v5.generate(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      new TextEncoder().encode(JSON.stringify(ws)),
    );
  }
}

function generateHostId(): string {
  if (flags.debug) return "0000";

  let id: string;
  do {
    id = Math.floor(Math.random() * 998 + 1)
      .toString().padStart(4, "0");
  } while (isConnected(id));

  return id;
}
