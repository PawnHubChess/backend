import {
  applyAttendeeId,
  applyHostId,
  applyReconnectCode,
  ExtendedWs,
} from "./ExtendedWs.ts";
import { createQueue, subscribe } from "./MessageBrokerInterface.ts";
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
import { connect, sendMessageToId } from "./WebSocketInterface.ts";

export function handleConnectHost(ws: ExtendedWs) {
  if (ws.id !== undefined && gameExists(ws.id!)) {
    // Error: Host is already connected and in a game
    sendMessageToId(ws.id!, {
      type: "error",
      error: "already-connected",
      message: "Host is already connected and in a game",
    });

    return;
  }

  applyHostId(ws);
  applyReconnectCode(ws);
  createHost(ws.id!, ws);

  sendMessageToId(ws.id!, {
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
      sendMessageToId(ws.id!, {
        type: "request-declined",
        details: "duplicate",
        message: "Connection request already pending",
      });
      return;
    }
    if (findGameByAttendeeId(ws.id) !== undefined) {
      sendMessageToId(ws.id!, {
        type: "request-declined",
        details: "ingame",
        message: "Already in a game",
      });
      return;
    }
  }

  if (!findGameByHostid(host)?.hostWs) {
    sendMessageToId(ws.id!, {
      type: "request-declined",
      details: "nonexistent",
      message: "Host does not exist",
    });
    return;
  }

  applyAttendeeId(ws);
  applyReconnectCode(ws);
  createConnectRequest(ws.id!, host, ws);

  sendMessageToId(host, {
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
    sendMessageToId(ws.id!, {
      type: "error",
      details: "connect-response-client-error",
      message: "Client did not request connection",
    });
    return;
  }

  try {
    let game = acceptConnectRequest(clientId);

    if (!game) {
      sendMessageToId(ws.id!, {
        type: "error",
        details: "connect-response-request-error",
        message: "Client did not request connection",
      });
    }
    game = game!;

    sendMessageToId(game.attendeeWs!.id!, {
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

  sendMessageToId(clientWs.id!, {
    type: "request-declined",
    details: "code",
    message: "Host did not approve code",
  });
}
