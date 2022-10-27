import { Board } from "../Board.ts";
import { BoardPosition, getIntermediatePositions } from "../BoardPosition.ts";
import { ChessPiece } from "./_ChessPiece.ts";

export class Queen extends ChessPiece {
  validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean {
    // Only horizontal, vertical or diagonal moves
    if (
      Math.abs(from.x - to.x) !== Math.abs(from.y - to.y) &&
      from.x !== to.x && from.y !== to.y
    ) return false;

    // No intermediate collisions
    for (const pos of getIntermediatePositions(from, to)) {
      if (board.get(pos)) return false;
    }

    // No collisions with same color
    if (board.get(to)?.isWhite === this.isWhite) return false;

    return true;
  }
}
