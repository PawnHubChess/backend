import { BoardPosition } from "./BoardPosition.ts";
import { ChessPiece } from "./ChessPieces/_ChessPiece.ts";

export class Board {
  state: (ChessPiece | null)[][];

  constructor(board?: (ChessPiece | null)[][]) {
    this.state = board || initBoard();
  }

  get(pos: BoardPosition): ChessPiece | null {
    return this.state[pos.y][pos.x];
  }

  set(pos: BoardPosition, piece: ChessPiece | null) {
    this.state[pos.y][pos.x] = piece;
  }

  validateMove(from: BoardPosition, to: BoardPosition): boolean {
    const pieceAtPos = this.get(from);
    if (pieceAtPos === null) return false;
    return pieceAtPos.validateMove(from, to, this);
  }
}

const initBoard = () => new Array(8).fill(null).map(() => new Array(8).fill(null));

export const initEmptyBoard = () => new Array(8).fill(null).map(() => new Array(8).fill(null));
