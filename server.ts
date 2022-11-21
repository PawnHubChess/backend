import { serve } from "./deps.ts";
import { applyReconnectCode, ExtendedWs } from "./ExtendedWs.ts";
import {
  handleAcceptAttendeeRequest,
  handleConnectAttendeeRequest,
  handleConnected,
  handleConnectHost,
  handleDeclineAttendeeRequest,
} from "./matchmaking.ts";
import {
  handleDisconnected,
  handleGetBoard,
  handleMakeMove,
} from "./playing.ts";
import {
  closeGameByHostId,
  findGameById,
  findWsById,
  removeAttendeeFromGame,
} from "./serverstate.ts";

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
    case "reconnect":
      handleReconnect(ws, data.id, data["reconnect-code"]);
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
  const id = ws.id!;
  const reconCode = ws.reconnectCode!;
  // Only continue if the player was in a game
  if (!findGameById(id)) return;
  setTimeout(() => {
    // If reconnectCode is the same after 20 seconds, i.e. no reconnect happened, notify opponent
    const wsAssociatedWithId = findWsById(id);
    if (wsAssociatedWithId?.reconnectCode === reconCode) {
      handleDisconnected(id);
    }
  }, 20 * 1000);
}

function handleReconnect(ws: ExtendedWs, id: string, reconnectCode: string) {
  const game = findGameById(id);
  let oldWs: ExtendedWs | undefined;
  let isHost: boolean | undefined;

  if (game?.hostWs.id === id) {
    oldWs = game.hostWs;
    isHost = true;
  } else if (game?.attendeeWs?.id === id) {
    oldWs = game.attendeeWs;
    isHost = false;
  } else return;

  if (oldWs.readyState === 1) {
    sendMessage(ws, {
      type: "error",
      error: "aready-connected",
    });
    return;
  }

  // todo old ip should match new ip
  if (oldWs.reconnectCode === reconnectCode) {
    ws.id = id;
    applyReconnectCode(ws);

    if (isHost) game.hostWs = ws;
    else game.attendeeWs = ws;

    sendMessage(ws, {
      type: "reconnected",
      "reconnect-code": ws.reconnectCode,
    });
  } else {
    sendMessage(ws, {
      type: "error",
      error: "wrong-code",
    });
    return;
  }
}

// deno-lint-ignore no-explicit-any
export function sendMessage(ws: ExtendedWs | undefined, msg: any) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(msg));
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
  const ipaddress = req.headers.get("x-forwarded-for") ||
    req.headers.get("host");

  ews.onopen = (ev) => handleConnected(ews, ev);
  ews.onmessage = (m) => handleMessage(ews, JSON.parse(m.data));
  ews.onclose = () => handleDisconnect(ews);
  ews.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
