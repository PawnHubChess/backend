import { Board } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";

export abstract class ChessPiece {
    isWhite: boolean;
    
    constructor(isWhite: boolean) {
        this.isWhite = isWhite;
    }

    abstract validateMove(from: BoardPosition, to: BoardPosition, board: Board): boolean;
}

export { Pawn } from "./Pawn.ts"
export { Bishop } from "./Bishop.ts"
export { Knight } from "./Knight.ts"
export { Rook } from "./Rook.ts"
export { Queen } from "./Queen.ts"
export { King } from "./King.ts"