import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { findGameById } from "./serverstate.ts";

export function handleMakeMove(ws: ExtendedWs, from: string, to: string) {
  const game = findGameById(ws.id!)!;
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);

  if (!game.validateMove(fromPos, toPos)) {
    ws.send(JSON.stringify({
      "type": "reject-move",
      "from": from,
      "to": to,
    }));
    return;
  }
  if (!game.validateCorrectPlayerMoved(fromPos, ws.id!)) {
    ws.send(JSON.stringify({
      "type": "reject-move",
      "from": from,
      "to": to,
    }));
    return;
  }

  ws.send(JSON.stringify({
    "type": "accept-move",
    "from": from,
    "to": to,
  }));
  
  game.makeMove(ws.id!, fromPos, toPos);
  checkGameWon();
}

export function handleGetBoard(ws: ExtendedWs) {
  const game = findGameById(ws.id!)!;
  ws.send(JSON.stringify({
    "type": "board",
    "fen": game.board.toFEN() + (game.nextMoveWhite ? " w" : " b"),
  }));
}

function checkGameWon() {
}

function handleGameWon() {
}
