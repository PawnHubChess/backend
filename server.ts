import { serve, uuid } from "./deps.ts";
import {
  acceptConnectRequest,
  attendeeHostMatch,
  closeGameByHostId,
  createConnectRequest,
  createHost,
  gameExists,
  findGameByHostid,
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

function handleConnectAttendeeRequest(ws: WebSocket, host: string, code: string) {
  const attendeeId = generateAttendeeId();

  //@ts-ignore Custom property added to the websocket
  ws.id = attendeeId;
  createConnectRequest(attendeeId, host, ws);

  const hostWs = findGameByHostid(host)?.hostWs;
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

function handleAcceptAttendeeRequest(
  ws: WebSocket,
  clientId: string,
) {
  //@ts-ignore Custom property added to the websocket
  if (!attendeeHostMatch(clientId, ws.id)) {
    // todo error: attendee and host do not match
    throw new Error("Attendee and host do not match");
  }

  try {
    const game = acceptConnectRequest(clientId);
    game.attendeeWs?.send(JSON.stringify({
      "type": "connected-id",
      "id": game.attendeeId
    }))
    game.sendMatchedInfo()
  } catch (e) {
    // todo error: connection request or host did not exist
  }
}

function handleDeclineAttendeeRequest(
  ws: WebSocket,
  clientId: string,
) {
}

function generateHostId(): string {
  let id: string;
  do {
    id = Math.floor(Math.random() * 998 + 1)
      .toString().padStart(4, "0");
  } while (gameExists(id));

  return id;
}

function generateAttendeeId() : string {
  return uuid.generate() as string;
}

function handleMakeMove(ws: WebSocket, from: string, to: string) {
  if (checkMoveValid("hostId", from, to)) {
    ws.send(JSON.stringify({
      "type": "accept-move",
      "from": from,
      "to": to,
    }));
    // Send move to other client
  }
}

function checkMoveValid(hostId: string, from: string, to:string) {
  return true;
}

function checkGameWon() {
}

function handleGameWon() {
}

// WebSocket stuff

function handleConnected(ws: WebSocket, ev: Event) {
  
}

// deno-lint-ignore no-explicit-any
function handleMessage(ws: WebSocket, data: any) {
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
      handleDeclineAttendeeRequest(ws, data.clientId);
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

function handleDisconnect(ws: WebSocket) {
  //@ts-ignore Custom property added to the websocket
    const id = ws.id;
    console.log(`Disconnected from client (${id})`);

    if (!id) return;

    if (id.length == 4) handleDisconnectHost(id);
    else handleDisconnectAttendee(id);
}

function handleDisconnectHost(id: string) {
  closeGameByHostId(id);
}

function handleDisconnectAttendee(id: string) {

}


function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return Response.redirect("https://github.com/PawnHubChess/backend/wiki", 302);
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.onopen = (ev) => handleConnected(ws, ev);
  ws.onmessage = (m) => handleMessage(ws, JSON.parse(m.data));
  ws.onclose = () => handleDisconnect(ws)
  ws.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
