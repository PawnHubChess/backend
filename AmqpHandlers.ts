import { queueExists } from "./AmqpInterface.ts";
import { amqp, wsHandlers, wsi } from "./deps.ts";
import { Game } from "./Game.ts";
import {
  connectRequestMatches,
  createGame,
  getGameById,
  removeConnectRequest,
  selfInGame,
} from "./serverstate.ts";

export function handleMessage(id: string, message: any) {
  switch (message.type) {
    case "connect-request":
      handleReceiveConnectRequest(id, message);
      break;
    case "connect-response":
      handleReceiveConnectResponse(id, message);
      break;
    case "match-confirmed":
      handleReceiveMatchConfirmedMessage(id, message);
      break;
    case "game-closed":
      handleReceiveGameClosed(id);
      break;
  }
}

export async function handleSendConnectRequest(
  ownId: string,
  recipientId: string,
  code: string,
) {
  if (!amqp.queueExists(recipientId)) return;
  await amqp.publish(recipientId, {
    type: "connect-request",
    id: ownId,
    code: code,
  });
}

function handleReceiveConnectRequest(ownId: string, message: any) {
  if (selfInGame(ownId)) {
    console.error("Received connect request while in game");
    handleSendConnectResponse(ownId, message.id, false);
  }
  const opponentId = message.id;
  const code = message.code;
  wsHandlers.handleSendConnectRequest(ownId, opponentId, code);
}

export async function handleSendConnectResponse(
  ownId: string,
  recipientId: string,
  accepted: boolean,
) {
  if (!amqp.queueExists(recipientId)) return;
  await amqp.publish(recipientId, {
    type: "connect-response",
    id: ownId,
    accept: accepted,
  });
}

function handleReceiveConnectResponse(ownId: string, message: any) {
  if (selfInGame(ownId)) {
    console.error("Received connect response while in game");
    return;
  }
  const opponentId = message.id;
  const accepted = message.accept;

  if (!connectRequestMatches(ownId, opponentId)) {
    console.warn("Received connect response from unexpected client");
    return;
  }
  removeConnectRequest(ownId);

  if (!accepted) {
    wsi.sendMessageToId(ownId, {
      type: "request-declined",
      details: "declined",
      message: "Host declined request",
    });
    wsi.close(ownId);
    return;
  }

  const game = createGame(ownId, opponentId);
  wsi.sendMatchedMessage(ownId, game);
  handleSendMatchConfirmedMessage(ownId, opponentId);
}

function handleSendMatchConfirmedMessage(ownId: string, opponentId: string) {
  amqp.publish(opponentId, {
    type: "match-confirmed",
    id: ownId,
  });
}

function handleReceiveMatchConfirmedMessage(ownId: string, message: any) {
  const opponentId = message.id;
  const game = createGame(ownId, opponentId);
  wsi.sendMatchedMessage(ownId, game);
}

export function handleGameClosedMessage(ownId: string) {
  const game = getGameById(ownId);
  if (!game) return;
  amqp.publish(game.opponentId, {
    type: "game-closed",
    id: ownId,
  });
}

function handleReceiveGameClosed(id: string) {
  wsHandlers.handleSendGameClosedMessage(id);
}
