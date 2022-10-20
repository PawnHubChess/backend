import { BoardPosition } from "../BoardPosition.ts";

abstract class ChessPiece {
    isWhite: boolean;
    
    constructor(isWhite: boolean) {
        this.isWhite = isWhite;
    }

    abstract validateMove(from: BoardPosition, to: BoardPosition): boolean;
}