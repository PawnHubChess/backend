import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";
import { Rook } from "../../ChessPieces/Rook.ts";
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
  board.set(fromPos, new Rook(isWhite));
  if (otherPos !== null && otherPiece !== null) {
    board.set(new BoardPosition(otherPos), otherPiece);
  }
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

Deno.test("same position", () => testMove("C3", "C3", false));

// Straights
Deno.test("1 front", () => testMove("E4", "E3", true));
Deno.test("4 back", () => testMove("F2", "F6", true));
Deno.test("3 left", () => testMove("A2", "D2", true));
Deno.test("2 right", () => testMove("C4", "A4", true));

// Diagonals
Deno.test("diagonal +1 +1", () => testMove("E4", "D3", false));
Deno.test("diagonl +1 -1", () => testMove("E4", "F3", false));
Deno.test("diagonal -1 +1", () => testMove("E4", "D5", false));
Deno.test("diagonl -1 -1", () => testMove("E4", "F5", false));

// Takes
Deno.test("take 1 front", () =>
  testCollision("E4", "E3", false, "E3", new Rook(true), true));
Deno.test("take 4 back", () =>
  testCollision("F2", "F6", true, "F6", new Pawn(false), true));
Deno.test("take 2 diagonal", () =>
  testCollision("E5", "C3", false, "C3", new Rook(true), false));

// Collisions
Deno.test("collision direct", () =>
  testCollision("G4", "G6", true, "G6", new Pawn(true), false));
Deno.test("collision intermediate", () =>
  testCollision("E3", "E6", true, "E4", new Rook(true), false));
Deno.test("collision intermediate opponent", () =>
  testCollision("E7", "E2", false, "E4", new Rook(true), false));
