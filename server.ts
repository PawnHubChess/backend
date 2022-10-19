import { serve } from "https://deno.land/std@0.160.0/http/mod.ts";
import {
  createConnectRequest,
  createHost,
  gameExists,
  getGameByHostid,
} from "./serverstate.ts";

function handleConnectHost(ws: WebSocket) {
  //@ts-ignore Custom property added to the websocket
  if (ws.id !== undefined && gameExists(ws.id)) {
    // Error: Host is already connected and in a game
    ws.send(JSON.stringify({
      "type": "error",
      "error": "already-connected",
      "message": "Host is already connected and in a game",
    }));

    return;
  }

  const hostId = generateHostId();
  //@ts-ignore Custom property added to the websocket
  ws.id = hostId;
  createHost(hostId, ws);

  ws.send(JSON.stringify({
    "type": "connected-id",
    "id": hostId,
  }));
}

function handleConnectAttendeeRequest(ws: WebSocket, code: string) {
  const attendeeId = generateAttendeeId();

  //@ts-ignore Custom property added to the websocket
  ws.id = attendeeId;
  createConnectRequest(attendeeId, code, ws);

  const hostWs = getGameByHostid(code)?.hostWs;
  if (!hostWs) {
    // todo error: host does not exist
    throw new Error("Host does not exist");
  }

  hostWs.send(JSON.stringify({
    "type": "verify-attendee-request",
    "clientId": attendeeId,
    "code": code,
  }));
}

function handleConnectAttendeeResponse(
  ws: WebSocket,
  clientId: string,
  accept: boolean,
) {
}

function generateHostId() {
  let id: string;
  do {
    id = Math.floor(Math.random() * 998 + 1)
      .toString().padStart(4, "0");
  } while (gameExists(id));

  return id;
}

function generateAttendeeId() {
  return "a1234";
}

function handleMakeMove(ws: WebSocket, from: String, to: String) {
  if (checkMoveValid("hostId", from, to)) {
    ws.send(JSON.stringify({
      "type": "accept-move",
      "from": from,
      "to": to,
    }));
    // Send move to other client
  }
}

function checkMoveValid(hostId, from, to) {
  return true;
}

function checkGameWon() {
}

function handleGameWon() {
}

// WebSocket stuff

function handleConnected(ev: Event) {
  console.log(ev);
}

// deno-lint-ignore no-explicit-any
function handleMessage(ws: WebSocket, data: any) {
  switch (data.type) {
    case "connect-host":
      handleConnectHost(ws);
      break;
    case "connect-attendee":
      handleConnectAttendeeRequest(ws, data.code);
      break;
    case "accept-attendee":
      handleConnectAttendeeResponse(ws, data.clientId, true);
      break;
    case "decline-attendee":
      handleConnectAttendeeResponse(ws, data.clientId, false);
      break;
    case "make-move":
      handleMakeMove(ws, data.from, data.to);
      break;
    default:
      console.log("Unknown message type: " + data.type);
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.onopen = (ev) => handleConnected(ev);
  ws.onmessage = (m) => handleMessage(ws, JSON.parse(m.data));
  ws.onclose = () => console.log("Disconnected from client ...");
  ws.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
