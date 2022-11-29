import { isPortAvailableSync, parse, serve } from "./deps.ts";
import { applyReconnectCode, ExtendedWs } from "./ExtendedWs.ts";
import {
  handleAcceptAttendeeRequest,
  handleConnectAttendeeRequest,
  handleConnectHost,
  handleDeclineAttendeeRequest,
} from "./matchmaking.ts";
import {
  handleDisconnected,
  handleGetBoard,
  handleMakeMove,
} from "./playing.ts";
import {
  completeReconnectTransation,
  generateReconnectCode,
  startReconnectTransaction,
  verifyReconnectCode,
} from "./ReconnectHandler.ts";
import { findGameById, findWsById } from "./serverstate.ts";
import { connect, getId, sendMessageToId } from "./WebSocketInterface.ts";

// CLI options
export const flags = parse(Deno.args, {
  boolean: ["debug"],
});
if (flags.debug) console.warn("Running in debug mode");

const reconnectTimeouts = new Map<string, number>();

// WebSocket stuff

// Rewire is not yet available for Deno; export for testing
// deno-lint-ignore no-explicit-any
export function handleMessage(ws: ExtendedWs, data: any) {
  switch (data.type) {
    case "connect-host":
      handleConnectHost(ws);
      break;
    case "connect-attendee":
      handleConnectAttendeeRequest(ws, data.host, data.code);
      break;
    case "accept-attendee-request":
      handleAcceptAttendeeRequest(ws, data.clientId);
      break;
    case "decline-attendee-request":
      handleDeclineAttendeeRequest(data.clientId);
      break;
    case "send-move":
      handleMakeMove(ws, data.from, data.to);
      break;
    case "get-board":
      handleGetBoard(ws);
      break;
    case "disconnect":
      handleDisconnected(ws.id!);
      break;
    default:
      console.log("Unknown message type: " + data.type);
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function handleDisconnect(ws: ExtendedWs) {
  const id = getId(ws);
  if (!id) return;
  startReconnectTransaction(id);
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return Response.redirect(
      "https://github.com/PawnHubChess/backend/wiki",
      302,
    );
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  const ews = ws as ExtendedWs;

  const url = new URL(req.url);

  if (url.pathname === "/host") {
    ws.onopen = () => handleHostConnected(ws);
  } else if (url.pathname === "/reconnect") {
    ws.onopen = () =>
      handleReconnect(
        ws,
        url.searchParams.get("id")!,
        url.searchParams.get("reconnectCode")!,
      );
  } else {
    ws.onopen = () => handleConnected(ws);
  }

  ews.onmessage = (m) => handleMessage(ews, JSON.parse(m.data));
  ews.onclose = () => handleDisconnect(ews);
  ews.onerror = (e) => handleError(e);
  return response;
}

async function handleConnected(ws: WebSocket) {
  const id = await connect(ws, false);
  const reconnectCode = await generateReconnectCode(id);
  sendMessageToId(id, {
    type: "connected",
    host: false,
    id: id,
    reconnectCode: reconnectCode,
  });
}

async function handleHostConnected(ws: WebSocket) {
  const id = await connect(ws, true);
  const reconnectCode = await generateReconnectCode(id);
  sendMessageToId(id, {
    type: "connected",
    host: true,
    id: id,
    reconnectCode: reconnectCode,
  });
}

async function handleReconnect(
  ws: WebSocket,
  id: string,
  reconnectCode: string,
) {
  if (verifyReconnectCode(id, reconnectCode)) {
    const newCode = await completeReconnectTransation(id);
    connect(ws, false, id);
    sendMessageToId(id, {
      type: "reconnected",
      reconnectCode: newCode,
    });
  } else {
    ws.send(JSON.stringify({
      type: "error",
      error: "wrong-code",
    }));
    ws.close();
  }
}

if (isPortAvailableSync({ port: 3000 })) {
  serve(reqHandler, { port: 3000 });
}
