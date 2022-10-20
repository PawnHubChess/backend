import { ChessPiece } from "./ChessPieces/_ChessPiece.ts"

export class Board {

    state: (ChessPiece | null)[][] = new Array(8).fill(new Array(8).fill(null));

    constructor() {
        this.state = [[]]
    }

}