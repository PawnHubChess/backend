import { generateAttendeeId, generateHostId } from "./clientIds.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
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

  const hostId = generateHostId();
  ws.id = hostId;
  createHost(hostId, ws);

  ws.send(JSON.stringify({
    "type": "connected-id",
    "id": hostId,
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

  const attendeeId = generateAttendeeId();

  if (ws.id === undefined) ws.id = attendeeId;
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
  ws: ExtendedWs,
  clientId: string,
) {
  if (!attendeeHostMatch(clientId, ws.id!)) {
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
  clientWs.send(JSON.stringify({
    "type": "request-declined",
    "details": "code",
    "message": "Host did not approve code",
  }));
}
