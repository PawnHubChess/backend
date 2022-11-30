import { handleGameClosedMessage } from "./AmqpHandlers.ts";
import { King } from "./ChessPieces/King.ts";
import { amqp, amqpHandlers, wsi } from "./deps.ts";
import { createGame, selfInGame } from "./serverstate.ts";
import { safeParseJson } from "./Utils.ts";

export function handleMessage(ws: WebSocket, data: any) {
  const message = safeParseJson(data);
  if (!message) return;

  const id = wsi.getId(ws);
  if (!id) {
    console.error("Received message from unregistered client");
    return;
  }

  switch (message.type) {
    case "accept-attendee-request":
    case "decline-attendee-request":
      handleReceiveConnectResponse(id, message);
      break;
    case "disconnect":
      handleReceiveDisconnect(id);
      break;
  }
}

export function handleSendConnectRequest(
  ownId: string,
  clientId: string,
  code: string,
) {
  wsi.sendMessageToId(ownId, {
    type: "verify-attendee-request",
    clientId: clientId,
    code: code,
  });
}

export async function handleReceiveConnectResponse(ownId: string, data: any) {
  if (selfInGame(ownId)) {
    console.error("Received connect response while in game");
    handleAlreadyInGameError(ownId);
    return;
  }

  let accepted: boolean;
  if (data.type === "accept-attendee-request") {
    accepted = true;
  } else if (data.type === "decline-attendee-request") {
    accepted = false;
  } else return;

  const opponentId = data.clientId;
  await amqpHandlers.handleSendConnectResponse(ownId, opponentId, accepted);
}

function handleAlreadyInGameError(id: string) {
  wsi.sendMessageToId(id, {
    type: "error",
    error: "Already in game",
  });
}

function handleReceiveDisconnect(id: string) {
  handleGameClosedMessage(id);
  wsi.close(id);
}

export function handleSendGameClosedMessage(id: string) {
  wsi.sendMessageToId(id, {
    type: "opponent-disconnected",
  });
}

export function handleSendTimeoutMessage(id: string) {
  wsi.sendMessageToId(id, {
    type: "timeout",
  });
}
