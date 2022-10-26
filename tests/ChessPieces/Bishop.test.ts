import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";
import { Bishop } from "../../ChessPieces/Bishop.ts";
import { ChessPiece } from "../../ChessPieces/_ChessPiece.ts";

function testMove(
  from: string,
  to: string,
  assert: boolean,
) {
  testCollision(from, to, false, null, null, assert);
}

function testCollision(
  from: string,
  to: string,
  isWhite: boolean,
  otherPos: string | null,
  otherPiece: ChessPiece | null,
  assert: boolean,
) {
  const board = new Board(initEmptyBoard());
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);
  board.set(fromPos, new Bishop(isWhite));
  if (otherPos !== null && otherPiece !== null) {
    board.set(new BoardPosition(otherPos), otherPiece);
  }
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

Deno.test("same position", () => testMove("C3", "C3", false));

// Diagonals
Deno.test("diagonal +1 +1", () => testMove("E4", "D3", true));
Deno.test("diagonl +2 -2", () => testMove("E4", "G2", true));
Deno.test("diagonal -3 +3", () => testMove("E4", "B7", true));
Deno.test("diagonl -4 -4", () => testMove("D4", "H8", true));

// Straights
Deno.test("1 front", () => testMove("E4", "E3", false));
Deno.test("4 back", () => testMove("F2", "F6", false));
Deno.test("3 left", () => testMove("A2", "D2", false));
Deno.test("2 right", () => testMove("C4", "A4", false));

// Takes
Deno.test("take 1 diagonal", () =>
  testCollision("E4", "D3", false, "D3", new Bishop(true), true));
Deno.test("take 4 diagonal", () =>
  testCollision("B2", "H8", true, "H8", new Pawn(false), true));
Deno.test("take 2 straight", () =>
  testCollision("E5", "E7", false, "E7", new Bishop(true), false));

// Collisions
Deno.test("collision direct", () =>
  testCollision("F4", "H6", true, "H6", new Pawn(true), false));
Deno.test("collision intermediate", () =>
  testCollision("E3", "H6", true, "F4", new Bishop(true), false));
Deno.test("collision intermediate opponent", () =>
  testCollision("G7", "B2", false, "E5", new Bishop(true), false));
