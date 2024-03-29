import { BoardPosition } from "./BoardPosition.ts";
import { amqp, wsHandlers, wsi } from "./deps_int.ts";
import { Game } from "./Game.ts";
import { handleFinalDisconnect } from "./server.ts";
import {
  connectRequestMatches,
  createGame,
  getGameById,
  removeConnectRequest,
  removeGame,
  selfInGame,
} from "./serverstate.ts";
import { isHostId } from "./Utils.ts";

export function handleMessage(id: string, message: any) {
  console.log(`[DEBUG] Received AMQP for id ${id}: ${JSON.stringify(message)}`);
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
    case "move":
      handleReceiveMoveMessage(id, message);
      break;
    case "game-closed":
      handleReceiveGameClosed(id);
      break;
    case "sanityCheck":
      console.log(`Received sanityCheck for ${id}`)
      break;
    default:
      console.log("Unexpected AMQP message: " + JSON.stringify(message));
  }
}

export async function handleSendConnectRequest(
  ownId: string,
  recipientId: string,
  code: string,
) {
  if (!await amqp.queueExists(recipientId)) return;
  console.log("Sending connect request to", recipientId);
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
  await amqp.publish(recipientId, {
    type: "connect-response",
    id: ownId,
    accept: accepted,
  });
}

function handleReceiveConnectResponse(ownId: string, message: any) {
  if (selfInGame(ownId)) {
    console.error("Received connect response while in game");
    console.log(JSON.stringify(message));
    return;
  }
  const opponentId = message.id;
  const accepted = message.accept;

  if (!connectRequestMatches(ownId, opponentId)) {
    console.warn("Received connect response from unexpected client");
    console.log(JSON.stringify(message));
    return;
  }
  removeConnectRequest(ownId);

  if (!accepted) {
    wsi.sendMessageToId(ownId, {
      type: "error",
      error: "Host declined request",
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

export function handleSendMoveMessage(
  from: BoardPosition,
  to: BoardPosition,
  game: Game,
) {
  amqp.publish(game.opponentId, {
    type: "move",
    id: game.selfId,
    from: from.toString(),
    to: to.toString(),
    fen: game.getFEN(),
  });
}

function handleReceiveMoveMessage(ownId: string, message: any) {
  const game = getGameById(ownId);
  if (!game) {
    console.error("Received move message while not in game");
    return;
  }
  if (message.id !== game.opponentId) {
    console.error("Received move message from unexpected client");
    return;
  }
  const from = new BoardPosition(message.from);
  const to = new BoardPosition(message.to);
  game.makeMove(from, to);
  wsHandlers.handleSendMoveMessage(ownId, from, to, game);
}

export function handleSendGameClosedMessage(ownId: string) {
  const game = getGameById(ownId);
  if (!game) return;
  amqp.publish(game.opponentId, {
    type: "game-closed",
    id: ownId,
  });
}

function handleReceiveGameClosed(id: string) {
  wsHandlers.handleSendGameClosedMessage(id);
  removeGame(id);
  if (isHostId(id)) {
    handleFinalDisconnect(id);
  }
}
