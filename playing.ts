import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { sendMessage } from "./server.ts";
import {
  closeGameByHostId,
  findGameById,
  removeAttendeeFromGame,
} from "./serverstate.ts";

export function handleMakeMove(ws: ExtendedWs, from: string, to: string) {
  const game = findGameById(ws.id!)!;
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);

  if (!game.validateMove(fromPos, toPos)) {
    sendMessage(ws, {
      type: "reject-move",
      from: from,
      to: to,
      fen: game.board.toFEN() + (game.nextMoveWhite ? " w" : " b"),
    });
    return;
  }
  if (!game.validateCorrectPlayerMoved(fromPos, ws.id!)) {
    sendMessage(ws, {
      type: "reject-move",
      from: from,
      to: to,
      fen: game.board.toFEN() + (game.nextMoveWhite ? " w" : " b"),
      // todo this should be a function: fen + next move
    });
    return;
  }

  game.makeMove(ws.id!, fromPos, toPos);

  sendMessage(ws, {
    type: "accept-move",
    from: from,
    to: to,
    fen: game.board.toFEN() + (game.nextMoveWhite ? " w" : " b"),
  });

  checkGameWon();
}

export function handleGetBoard(ws: ExtendedWs) {
  const game = findGameById(ws.id!)!;
  // todo handle not in game
  sendMessage(ws, {
    type: "board",
    fen: game.board.toFEN() + (game.nextMoveWhite ? " w" : " b"),
  });
}

export function handleDisconnected(id: string) {
  const game = findGameById(id);
  if (!game) return;
  game.sendToOpponent(id, {
    "type": "opponent-disconnected",
  });
  if (game.isHost(id)) closeGameByHostId(id);
  else removeAttendeeFromGame(id);
}

function checkGameWon() {
}

function handleGameWon() {
}
