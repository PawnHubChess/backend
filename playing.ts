import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { findGameById } from "./serverstate.ts";

export function handleMakeMove(ws: ExtendedWs, from: string, to: string) {
  const game = findGameById(ws.id!)!;
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);

  // todo parse board position
  if (!game.validateMove(fromPos, toPos)) {
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
  
  game.relayMove(ws.id, fromPos, toPos);
  checkGameWon();
}

function checkGameWon() {
}

function handleGameWon() {
}
