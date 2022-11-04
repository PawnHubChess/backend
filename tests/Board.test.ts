import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";
import { Bishop } from "../ChessPieces/Bishop.ts";
import { King } from "../ChessPieces/King.ts";
import { Knight } from "../ChessPieces/Knight.ts";
import { Pawn } from "../ChessPieces/Pawn.ts";
import { Queen } from "../ChessPieces/Queen.ts";
import { Rook } from "../ChessPieces/Rook.ts";

Deno.test("board set and get at position", () => {
  const board = new Board(initEmptyBoard());
  const piece = new Pawn(true);
  const position = new BoardPosition("D4");
  board.set(position, piece);
  assertEquals(board.get(position), piece);
});

Deno.test("board set piece does not spread", () => {
  const board = new Board(initEmptyBoard());
  const piece = new Pawn(true);
  board.set(new BoardPosition("D4"), piece);
  assertEquals(board.get(new BoardPosition("D5")), null);
  assertEquals(board.get(new BoardPosition("D3")), null);
  assertEquals(board.get(new BoardPosition("C4")), null);
  assertEquals(board.get(new BoardPosition("E4")), null);
});

Deno.test("board setup white pawns", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("A2")) instanceof Pawn);
  assert(board.get(new BoardPosition("B2")) instanceof Pawn);
  assert(board.get(new BoardPosition("C2")) instanceof Pawn);
  assert(board.get(new BoardPosition("D2")) instanceof Pawn);
  assert(board.get(new BoardPosition("E2")) instanceof Pawn);
  assert(board.get(new BoardPosition("F2")) instanceof Pawn);
  assert(board.get(new BoardPosition("G2")) instanceof Pawn);
  assert(board.get(new BoardPosition("H2")) instanceof Pawn);
});

Deno.test("board setup black pawns", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("A7")) instanceof Pawn);
  assert(board.get(new BoardPosition("B7")) instanceof Pawn);
  assert(board.get(new BoardPosition("C7")) instanceof Pawn);
  assert(board.get(new BoardPosition("D7")) instanceof Pawn);
  assert(board.get(new BoardPosition("E7")) instanceof Pawn);
  assert(board.get(new BoardPosition("F7")) instanceof Pawn);
  assert(board.get(new BoardPosition("G7")) instanceof Pawn);
  assert(board.get(new BoardPosition("H7")) instanceof Pawn);
});

Deno.test("board setup rooks", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("A1")) instanceof Rook);
  assert(board.get(new BoardPosition("H1")) instanceof Rook);
  assert(board.get(new BoardPosition("A8")) instanceof Rook);
  assert(board.get(new BoardPosition("H8")) instanceof Rook);
});

Deno.test("board setup knights", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("B1")) instanceof Knight);
  assert(board.get(new BoardPosition("G1")) instanceof Knight);
  assert(board.get(new BoardPosition("B8")) instanceof Knight);
  assert(board.get(new BoardPosition("G8")) instanceof Knight);
});

Deno.test("board setup bishops", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("C1")) instanceof Bishop);
  assert(board.get(new BoardPosition("F1")) instanceof Bishop);
  assert(board.get(new BoardPosition("C8")) instanceof Bishop);
  assert(board.get(new BoardPosition("F8")) instanceof Bishop);
});

Deno.test("board setup queens", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("D1")) instanceof Queen);
  assert(board.get(new BoardPosition("D8")) instanceof Queen);
});

Deno.test("board setup kings", () => {
  const board = new Board();

  assert(board.get(new BoardPosition("E1")) instanceof King);
  assert(board.get(new BoardPosition("E8")) instanceof King);
});

Deno.test("board setup empty fields", () => {
  const board = new Board();

  assertEquals(board.get(new BoardPosition("A3")), null);
  assertEquals(board.get(new BoardPosition("B4")), null);
  assertEquals(board.get(new BoardPosition("C5")), null);
  assertEquals(board.get(new BoardPosition("D6")), null);
  assertEquals(board.get(new BoardPosition("E5")), null);
  assertEquals(board.get(new BoardPosition("F4")), null);
  assertEquals(board.get(new BoardPosition("G3")), null);
  assertEquals(board.get(new BoardPosition("H4")), null);
})

Deno.test("toFEN D4", () => {
  const board = new Board(initEmptyBoard());
  const position = new BoardPosition("D4");
  board.set(position, new Pawn(true));
  assertEquals(board.toFEN(), "8/8/8/8/3P4/8/8/8");
})

Deno.test("black pawn from D4 to D5", () => {
  const board = new Board(initEmptyBoard());
  const position = new BoardPosition("D4");
  board.set(position, new Pawn(true));
  const valid = board.validateMove(position, new BoardPosition("D5"));
  assertEquals(valid, true);
  assertEquals(board.toFEN(), "8/8/8/3P4/8/8/8/8");
})