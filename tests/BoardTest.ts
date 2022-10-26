import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board } from "../Board.ts";
import { BoardPosition } from "../BoardPosition.ts";
import { Pawn } from "../ChessPieces/Pawn.ts";

const empty8x8array = () => new Array(8).fill(new Array(8).fill(null));

Deno.test("set and get at position", () => {
  const board = new Board(empty8x8array());
  const piece = new Pawn(true);
  const position = new BoardPosition("D4");
  board.set(position, piece);
  assertEquals(board.get(position), piece);
});
