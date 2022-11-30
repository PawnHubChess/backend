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
