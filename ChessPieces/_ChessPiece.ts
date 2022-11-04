import { Board } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";

export abstract class ChessPiece {
  isWhite: boolean;

  constructor(isWhite: boolean) {
    this.isWhite = isWhite;
  }

  abstract validateMove(
    from: BoardPosition,
    to: BoardPosition,
    board: Board,
  ): boolean;

  abstract toFEN(): string;

  toJSON() {
    return {
      "type": this.constructor.name,
      "white": this.isWhite,
    };
  }
}
