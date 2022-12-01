import { Board } from "./Board.ts";
import { BoardPosition } from "./BoardPosition.ts";
import { isHostId } from "./Utils.ts";
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
    const selfIsWhite = !isHostId(this.selfId);
    if (selfIsWhite !== this.nextMoveWhite) return false;
    // Check if the piece is the correct color
    if (selfIsWhite !== this.board.get(from)?.isWhite) return false;
    return true;
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
    return this.selfId === id;
  }

  getFEN() {
    return this.board.toFEN() + (this.nextMoveWhite ? " w" : " b");
  }
}
