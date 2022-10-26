import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";
import { Pawn } from "../ChessPieces/Pawn.ts";

Deno.test("set and get at position", () => {
  const board = new Board(initEmptyBoard());
  const piece = new Pawn(true);
  const position = new BoardPosition("D4");
  board.set(position, piece);
  assertEquals(board.get(position), piece);
});

Deno.test("set piece does not spread", () => {
    const board = new Board(initEmptyBoard());
    const piece = new Pawn(true);
    board.set(new BoardPosition("D4"), piece);
    assertEquals(board.get(new BoardPosition("D5")), null);
    assertEquals(board.get(new BoardPosition("D3")), null);
    assertEquals(board.get(new BoardPosition("C4")), null);
    assertEquals(board.get(new BoardPosition("E4")), null);
})