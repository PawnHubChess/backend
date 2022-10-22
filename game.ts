import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";

export class Game {
  hostId: string;
  hostWs: WebSocket;
  attendeeId: string | undefined;
  attendeeWs: WebSocket | undefined;
  board: Board = new Board();

  constructor(hostId: string, hostWs: WebSocket) {
    this.hostId = hostId;
    this.hostWs = hostWs;
  }

  sendMatchedInfo() {
    const msg = `{"type": "matched"}`;
    this.hostWs.send(msg);
    this.attendeeWs!.send(msg);
  }

  validateMove(from: BoardPosition, to: BoardPosition) {
    // todo
    return true;
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
