import {
  applyAttendeeId,
  applyHostId,
  applyReconnectCode,
  ExtendedWs,
} from "./ExtendedWs.ts";
import { sendMessage } from "./server.ts";
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
    sendMessage(ws, {
      type: "error",
      error: "already-connected",
      message: "Host is already connected and in a game",
    });

    return;
  }

  applyHostId(ws);
  applyReconnectCode(ws);
  createHost(ws.id!, ws);

  sendMessage(ws, {
    type: "connected-id",
    id: ws.id,
    "reconnect-code": ws.reconnectCode,
  });
}

export function handleConnectAttendeeRequest(
  ws: ExtendedWs,
  host: string,
  code: string,
) {
  if (ws.id !== undefined) {
    if (findConnectRequestByAttendeeId(ws.id!) !== undefined) {
      sendMessage(ws, {
        type: "request-declined",
        details: "duplicate",
        message: "Connection request already pending",
      });
      return;
    }
    if (findGameByAttendeeId(ws.id) !== undefined) {
      sendMessage(ws, {
        type: "request-declined",
        details: "ingame",
        message: "Already in a game",
      });
      return;
    }
  }

  if (!findGameByHostid(host)?.hostWs) {
    sendMessage(ws, {
      type: "request-declined",
      details: "nonexistent",
      message: "Host does not exist",
    });
    return;
  }

  applyAttendeeId(ws);
  applyReconnectCode(ws);
  createConnectRequest(ws.id!, host, ws);

  sendMessage(findGameByHostid(host)?.hostWs!, {
    type: "verify-attendee-request",
    clientId: ws.id!,
    code: code,
  });
}

export function handleAcceptAttendeeRequest(
  ws: ExtendedWs,
  clientId: string,
) {
  if (!attendeeHostMatch(clientId, ws.id!)) {
    sendMessage(ws, {
      type: "error",
      details: "connect-response-client-error",
      message: "Client did not request connection",
    });
    return;
  }

  try {
    let game = acceptConnectRequest(clientId);

    if (!game) {
      sendMessage(ws, {
        type: "error",
        details: "connect-response-request-error",
        message: "Client did not request connection",
      });
    }
    game = game!;

    sendMessage(game.attendeeWs, {
      type: "connected-id",
      id: game.attendeeId,
      "reconnect-code": game.attendeeWs?.reconnectCode!,
    });

    game.sendMatchedInfo();
  } catch (e) {
    // todo error: connection request or host did not exist
  }
}

export function handleDeclineAttendeeRequest(clientId: string) {
  const clientWs = declineAttendeeRequest(clientId);
  if (!clientWs) return;

  sendMessage(clientWs, {
    type: "request-declined",
    details: "code",
    message: "Host did not approve code",
  });
}
