import { Board } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";
import { ChessPiece } from "./_ChessPiece.ts";

export class King extends ChessPiece {
  validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean {
    // Maximum 1 step
    if (
      Math.abs(from.x - to.x) > 1 ||
      Math.abs(from.y - to.y) > 1
    ) return false;

    // No collisions with same color
    if (board.get(to)?.isWhite === this.isWhite) return false;

    return true;
  }
}
