import { handleGameClosedMessage } from "./AmqpHandlers.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { King } from "./ChessPieces/King.ts";
import { amqp, amqpHandlers, wsi } from "./deps.ts";
import { Game } from "./Game.ts";
import { createGame, getGameById, selfInGame } from "./serverstate.ts";
import { safeParseJson } from "./Utils.ts";
import { sendMessageToId } from "./WebSocketInterface.ts";

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
    case "send-move":
      handleReceiveMoveMessage(id, message);
      break;
    case "disconnect":
      handleReceiveDisconnect(id);
      break;
    default:
      console.log("Unexpected WS message: " + message);
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

  const opponentId = data.clientId;
  if (!await amqp.queueExists(opponentId)) {
    sendMessageToId(ownId, {
      type: "error",
      error: "Opponent not found",
    });
    return;
  }

  let accepted: boolean;
  if (data.type === "accept-attendee-request") {
    accepted = true;
  } else if (data.type === "decline-attendee-request") {
    accepted = false;
  } else return;

  await amqpHandlers.handleSendConnectResponse(ownId, opponentId, accepted);
}

function handleAlreadyInGameError(id: string) {
  wsi.sendMessageToId(id, {
    type: "error",
    error: "Already in game",
  });
}

export function handleConnectRequestOpponentNotFoundError(ws: WebSocket) {
  ws.send(JSON.stringify({
    type: "error",
    error: "Opponent not found",
  }));
  ws.close();
}

export function handleGetBoard(id: string) {
  const game = getGameById(id)!;
  if (!game) return;

  sendMessageToId(id, {
    type: "board",
    fen: game.getFEN(),
  });
}

export function handleSendMoveMessage(
  id: string,
  from: BoardPosition,
  to: BoardPosition,
  game: Game,
) {
  sendMessageToId(id, {
    type: "receive-move",
    from: from,
    to: to,
    fen: game.getFEN(),
  });
}

function handleReceiveMoveMessage(id: string, message: any) {
  const parsed = parseMoveMessage(id, message);
  if (!parsed) return;
  const { from, to, game } = parsed;

  if (
    !game.validateMove(from, to) ||
    !game.validateCorrectPlayerMoved(from, id)
  ) {
    handleRejectMove(id, message, game);
    return;
  }

  handleAcceptMove(id, from, to, game);
}

function parseMoveMessage(id: string, message: any) {
  let game;
  try {
    const from = new BoardPosition(message.from);
    const to = new BoardPosition(message.to);
    const game = getGameById(id)!;
    if (!game || !from || !to) return;
    return { from, to, game };
  } catch {
    handleRejectMove(id, message, game);
    return;
  }
}

function handleRejectMove(id: string, message: any, game: Game | undefined) {
  sendMessageToId(id, {
    type: "reject-move",
    from: message.from,
    to: message.to,
    fen: game?.getFEN(),
  });
}

function handleAcceptMove(
  id: string,
  from: BoardPosition,
  to: BoardPosition,
  game: Game,
) {
  game.makeMove(from, to);
  amqpHandlers.handleSendMoveMessage(from, to, game);

  sendMessageToId(id, {
    type: "accept-move",
    from: from,
    to: to,
    fen: game.getFEN(),
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
