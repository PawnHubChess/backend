import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { sendMessageToId } from "./WebSocketInterface.ts";

export class Game {
  hostId: string;
  attendeeId: string;
  board: Board = new Board();
  nextMoveWhite: boolean;

  constructor(hostId: string, attendeeId: string) {
    this.hostId = hostId;
    this.attendeeId = attendeeId;
    this.nextMoveWhite = true;
  }

  sendMatchedInfo() {
    const msg = {
      "type": "matched",
      "fen": this.board.toFEN() + (this.nextMoveWhite ? " w" : " b"),
    };
    sendMessageToId(this.hostId, msg);
    sendMessageToId(this.attendeeId!, msg);
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
      type: "receive-move",
      from: from.toString(),
      to: to.toString(),
      fen: this.board.toFEN() + (this.nextMoveWhite ? " w" : " b"),
    });
  }

  sendToOpponent(id: string, data: any) {
    const otherPlayerWs = this.isHost(id) ? this.attendeeWs : this.hostWs;
    if (!otherPlayerWs || otherPlayerWs.readyState !== WebSocket.OPEN) {
      // ws queue messages if opponent ws is not ready. Will be implemented when switching to cloud native
      return;
    }
    sendMessageToId(otherPlayerWs.id!, data);
  }

  isHost(id: string) {
    return this.hostId === id;
  }
}
