import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";

export class Game {
  hostId: string;
  hostWs: ExtendedWs;
  attendeeId: string | undefined;
  attendeeWs: ExtendedWs | undefined;
  board: Board = new Board();

  constructor(hostId: string, hostWs: ExtendedWs) {
    this.hostId = hostId;
    this.hostWs = hostWs;
  }

  sendMatchedInfo() {
    const msg = `{"type": "matched"}`;
    this.hostWs.send(msg);
    this.attendeeWs!.send(msg);
  }

  validateMove(from: BoardPosition, to: BoardPosition) {
    return this.board.validateMove(from, to);
  }

  relayMove(playerId: string, from: BoardPosition, to: BoardPosition) {
    const otherPlayerWs = this.hostId === playerId
      ? this.attendeeWs
      : this.hostWs;
    otherPlayerWs!.send(JSON.stringify({
      "type": "receive-move",
      "from": from.toString(),
      "to": to.toString(),
    }));
  }
}
