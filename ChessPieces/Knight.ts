import { Board } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";
import { ChessPiece } from "./_ChessPiece.ts";

export class Knight extends ChessPiece {

  validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean {
    return true;
  }
  
}
