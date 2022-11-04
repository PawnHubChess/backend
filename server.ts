import { serve } from "./deps.ts";
import { applyReconnectCode, ExtendedWs } from "./ExtendedWs.ts";
import {
  handleAcceptAttendeeRequest,
  handleConnectAttendeeRequest,
  handleConnected,
  handleConnectHost,
  handleDeclineAttendeeRequest,
} from "./matchmaking.ts";
import { handleMakeMove } from "./playing.ts";
import {
  closeGameByHostId,
  findGameById,
  removeAttendeeFromGame,
} from "./serverstate.ts";

// WebSocket stuff

// deno-lint-ignore no-explicit-any
function handleMessage(ws: ExtendedWs, data: any) {
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
    default:
      console.log("Unknown message type: " + data.type);
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function handleDisconnect(ws: ExtendedWs) {
  //@ts-ignore Custom property added to the websocket
  const id = ws.id;
  console.log(`Disconnected from client (${id})`);

  if (!id) return;

  if (id.length == 4) handleDisconnectHost(id);
  else handleDisconnectAttendee(id);
}

function handleDisconnectHost(id: string) {
  // todo notify attendee
  // Close game after reconnect timeout
  //closeGameByHostId(id);
}

function handleDisconnectAttendee(id: string) {
  // Remove from game after reconnect timeout
  //removeAttendeeFromGame(id);
  // todo notify host
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
    ws.send(JSON.stringify({
      "type": "error",
      "error": "aready-connected",
    }));
    return;
  }

  // todo old ip should match new ip
  if (oldWs.reconnectCode === reconnectCode) {
    ws.id = id;
    applyReconnectCode(ws);

    if (isHost) game.hostWs = ws;
    else game.attendeeWs = ws;

    ws.send(JSON.stringify({
      type: "reconnected",
      "reconnect-code": ws.reconnectCode,
    }));
  } else {
    ws.send(JSON.stringify({
      "type": "error",
      "error": "wrong-code",
    }));
    return;
  }
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
  const ipaddress = req.headers.get("x-forwarded-for") || req.headers.get("host");

  ews.onopen = (ev) => handleConnected(ews, ev);
  ews.onmessage = (m) => handleMessage(ews, JSON.parse(m.data));
  ews.onclose = () => handleDisconnect(ews);
  ews.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
