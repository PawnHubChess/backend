import { BoardPosition } from "../BoardPosition.ts";
import { ChessPiece } from "./ChessPiece.ts";

export class Knight extends ChessPiece {

  validateMove(from: BoardPosition, to: BoardPosition): boolean {
    return true;
  }
  
}
