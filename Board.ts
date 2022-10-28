import { BoardPosition } from "./BoardPosition.ts";
import { ChessPiece } from "./ChessPieces/_ChessPiece.ts";
import { Pawn } from "./ChessPieces/Pawn.ts";
import { Rook } from "./ChessPieces/Rook.ts";
import { Knight } from "./ChessPieces/Knight.ts";
import { Bishop } from "./ChessPieces/Bishop.ts";
import { King } from "./ChessPieces/King.ts";
import { Queen } from "./ChessPieces/Queen.ts";

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

function initBoard(): (ChessPiece | null)[][] {
  return new Array(8)
    .fill(null)
    .map((_, row) => {
      switch (row) {
        case 0:
          return initFirstRow(true);
        case 1:
          return initPawnRow(true);
        case 7:
          return initFirstRow(false);
        case 6:
          return initPawnRow(false);
        default:
          return initEmptyRow();
      }
    });
}

const initPawnRow = (isWhite: boolean): Pawn[] => {
  return new Array(8)
    .fill(null)
    .map(() => new Pawn(isWhite));
};

const initFirstRow = (isWhite: boolean): (ChessPiece | null)[] => {
  // Columns are counted H->A, thus King is on 3 (E) and Queen is on 4 (D)
  return new Array(8)
    .fill(null)
    .map((_, column) => {
      switch (column) {
        case 0:
        case 7:
          return new Rook(isWhite);
        case 1:
        case 6:
          return new Knight(isWhite);
        case 2:
        case 5:
          return new Bishop(isWhite);
        case 3:
          return new King(isWhite);
        case 4:
          return new Queen(isWhite);
        default:
          return null;
      }
    });
};

const initEmptyRow = (): null[] => {
  return new Array(8).fill(null);
};

export const initEmptyBoard = (): null[][] =>
  new Array(8).fill(null).map(() => new Array(8).fill(null));
