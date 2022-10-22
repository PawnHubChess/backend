import { generateAttendeeId, generateHostId } from "./clientIds.ts";
import { checkMoveValid } from "./server.ts";
import { acceptConnectRequest, createConnectRequest, createHost, declineAttendeeRequest, findGameByHostid } from "./serverstate.ts";

function handleConnected(ws: WebSocket, ev: Event) {}

export function handleConnectHost(ws: WebSocket) {
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

export function handleConnectAttendeeRequest(
  ws: WebSocket,
  host: string,
  code: string,
) {
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

export function handleAcceptAttendeeRequest(
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
      "id": game.attendeeId,
    }));
    game.sendMatchedInfo();
  } catch (e) {
    // todo error: connection request or host did not exist
  }
}

export function handleDeclineAttendeeRequest(clientId: string) {
  const clientWs = declineAttendeeRequest(clientId);
  clientWs.send(`{"type": "request-declined"}`);
}

export function handleMakeMove(ws: WebSocket, from: string, to: string) {
  if (checkMoveValid("hostId", from, to)) {
    ws.send(JSON.stringify({
      "type": "accept-move",
      "from": from,
      "to": to,
    }));
    // Send move to other client
  }
}
