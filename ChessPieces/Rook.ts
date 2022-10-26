import { Board } from "../Board.ts";
import { BoardPosition, getIntermediatePositions } from "../BoardPosition.ts";
import { ChessPiece } from "./_ChessPiece.ts";

export class Rook extends ChessPiece {
  validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean {
    // No diagonal moves
    if (from.x !== to.x && from.y !== to.y) return false;

    // No intermediate collisions
    for (const pos of getIntermediatePositions(from, to)) {
      if (board.get(pos)) return false;
    }

    // No collisions with same color
    if (board.get(to)?.isWhite === this.isWhite) return false;

    console.log("RETURNS TRUE");
    return true;
  }
}
