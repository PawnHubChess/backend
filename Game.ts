import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";

export class Game {
  hostId: string;
  hostWs: ExtendedWs;
  attendeeId: string | undefined;
  attendeeWs: ExtendedWs | undefined;
  board: Board = new Board();
  nextMoveWhite: boolean;

  constructor(hostId: string, hostWs: ExtendedWs) {
    this.hostId = hostId;
    this.hostWs = hostWs;
    this.nextMoveWhite = true;
  }

  sendMatchedInfo() {
    const msg = JSON.stringify({
      "type": "matched",
      "fen": this.board.toFEN() + (this.nextMoveWhite ? " w" : " b"),
    });
    this.hostWs.send(msg);
    this.attendeeWs!.send(msg);
  }

  validateCorrectPlayerMoved(from: BoardPosition, id: string): boolean {
    // Host is always black
    const shouldBeWhite = id === this.attendeeId;
    // Check if this player is allowed to make the next move
    if (shouldBeWhite !== this.nextMoveWhite) return false;
    // Check if the piece is the correct color
    return shouldBeWhite === this.board.get(from)?.isWhite;
  }

  validateMove(from: BoardPosition, to: BoardPosition) {
    return this.board.validateMove(from, to);
  }

  makeMove(playerId: string, from: BoardPosition, to: BoardPosition) {
    // Apply change locally
    this.board.move(from, to);
    // Toggle next player
    this.nextMoveWhite = !this.nextMoveWhite;
    // Relay move to other player
    this.sendToOpponent(playerId, {
      "type": "receive-move",
      "from": from.toString(),
      "to": to.toString(),
    });
  }

  sendToOpponent(id: string, data: any) {
    const otherPlayerWs = this.isHost(id) ? this.attendeeWs : this.hostWs;
    if (!otherPlayerWs || otherPlayerWs.readyState !== WebSocket.OPEN) {
      console.warn(`No other player found for ${id} and ${data}`);
      // ws queue messages if opponent ws is not ready. Will be implemented when switching to cloud native
      return;
    }
    otherPlayerWs.send(JSON.stringify(data));
  }

  isHost(id: string) {
    return this.hostId === id;
  }
}
