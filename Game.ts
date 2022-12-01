import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { sendMessageToId } from "./WebSocketInterface.ts";

export class Game {
  selfId: string;
  opponentId: string;
  board: Board = new Board();
  nextMoveWhite: boolean;

  constructor(selfId: string, opponentId: string) {
    this.selfId = selfId;
    this.opponentId = opponentId;
    this.nextMoveWhite = true;
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

  makeMove(from: BoardPosition, to: BoardPosition) {
    // Apply change locally
    this.board.move(from, to);
    // Toggle next player
    this.nextMoveWhite = !this.nextMoveWhite;
  }

  sendToOpponent(id: string, data: any) {
    const otherPlayerId = this.isHost(id) ? this.attendeeId : this.hostId;
    sendMessageToId(otherPlayerId, data);
  }

  isHost(id: string) {
    return this.hostId === id;
  }

  getFEN() {
    return this.board.toFEN() + (this.nextMoveWhite ? " w" : " b");
  }
}
