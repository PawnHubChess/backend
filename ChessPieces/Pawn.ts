import { Board } from "../Board.ts";
import { BoardPosition, isTowardsWhite } from "../BoardPosition.ts";
import { ChessPiece } from "./_ChessPiece.ts";

export class Pawn extends ChessPiece {
  validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean {
    // Moving backwards not allowed
    if (
      (this.isWhite && isTowardsWhite(from, to)) ||
      (!this.isWhite && !isTowardsWhite(from, to))
    ) return false;

    // Horizonzal takes
    if (
      (this.isOneStepDiagonal(from, to) &&
        board.get(to) !== null &&
        board.get(to)!.isWhite !== this.isWhite)
    ) return true;

    // Only along y axis
    if (from.x !== to.x) return false;

    // Collisions not allowed
    if (board.get(to) !== null) return false;

    // 2 steps from home row
    // BoardPosition cannot be out of bounds, thus a move from row 7 to 9 is impossible
    if ((from.y === 1 || from.y === 6) && Math.abs(from.y - to.y) === 2) {
      const intermediate = board.get(
        new BoardPosition(from.x, from.y + (this.isWhite ? 1 : -1)),
      );
      if (intermediate === null) return true;
    }

    // 1 step
    if (Math.abs(from.y - to.y) === 1) return true;

    return false;
  }

  isOneStepDiagonal(from: BoardPosition, to: BoardPosition) {
    return (Math.abs(from.x - to.x) === 1 && Math.abs(from.y - to.y) === 1);
  }

  toFEN(): string {
    return this.isWhite ? "P" : "p";
  }
}
