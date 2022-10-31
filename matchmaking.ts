import {
  applyAttendeeId,
  applyHostId,
  applyReconnectCode,
  ExtendedWs,
} from "./ExtendedWs.ts";
import {
  acceptConnectRequest,
  attendeeHostMatch,
  createConnectRequest,
  createHost,
  declineAttendeeRequest,
  findConnectRequestByAttendeeId,
  findGameByAttendeeId,
  findGameByHostid,
  gameExists,
} from "./serverstate.ts";

export function handleConnected(ws: ExtendedWs, ev: Event) {}

export function handleConnectHost(ws: ExtendedWs) {
  if (ws.id !== undefined && gameExists(ws.id!)) {
    // Error: Host is already connected and in a game
    ws.send(JSON.stringify({
      "type": "error",
      "error": "already-connected",
      "message": "Host is already connected and in a game",
    }));

    return;
  }

  applyHostId(ws);
  applyReconnectCode(ws);
  console.log(ws.reconnectCode);
  createHost(ws.id!, ws);

  ws.send(JSON.stringify({
    "type": "connected-id",
    "id": ws.id,
    "reconnect-code": ws.reconnectCode,
  }));
}

export function handleConnectAttendeeRequest(
  ws: ExtendedWs,
  host: string,
  code: string,
) {
  if (ws.id !== undefined) {
    if (findConnectRequestByAttendeeId(ws.id!) !== undefined) {
      ws.send(JSON.stringify({
        "type": "request-declined",
        "details": "duplicate",
        "message": "Connection request already pending",
      }));
      return;
    }
    if (findGameByAttendeeId(ws.id) !== undefined) {
      ws.send(JSON.stringify({
        "type": "request-declined",
        "details": "ingame",
        "message": "Already in a game",
      }));
      return;
    }
  }

  if (!findGameByHostid(host)?.hostWs) {
    ws.send(JSON.stringify({
      "type": "request-declined",
      "details": "nonexistent",
      "message": "Host does not exist",
    }));
    return;
  }

  applyAttendeeId(ws);
  applyReconnectCode(ws);
  createConnectRequest(ws.id!, host, ws);

  findGameByHostid(host)?.hostWs!.send(JSON.stringify({
    "type": "verify-attendee-request",
    "clientId": ws.id!,
    "code": code,
  }));
}

export function handleAcceptAttendeeRequest(
  ws: ExtendedWs,
  clientId: string,
) {
  if (!attendeeHostMatch(clientId, ws.id!)) {
    ws.send(JSON.stringify({
      "type": "error",
      "details": "connect-response-client-error",
      "message": "Client did not request connection",
    }));
    return;
  }

  try {
    let game = acceptConnectRequest(clientId);

    if (!game) {
      ws.send(JSON.stringify({
        "type": "error",
        "details": "connect-response-request-error",
        "message": "Client did not request connection",
      }));
    }
    game = game!;

    game.attendeeWs?.send(JSON.stringify({
      "type": "connected-id",
      "id": game.attendeeId,
      "reconnectCode": game.attendeeWs.reconnectCode!,
    }));
    game.sendMatchedInfo();
  } catch (e) {
    // todo error: connection request or host did not exist
  }
}

export function handleDeclineAttendeeRequest(clientId: string) {
  const clientWs = declineAttendeeRequest(clientId);
  if (!clientWs) return;
  
  clientWs!.send(JSON.stringify({
    "type": "request-declined",
    "details": "code",
    "message": "Host did not approve code",
  }));
}
