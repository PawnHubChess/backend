import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";
import { Knight } from "../../ChessPieces/Knight.ts";
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
  board.set(fromPos, new Knight(isWhite));
  if (otherPos !== null && otherPiece !== null) {
    board.set(new BoardPosition(otherPos), otherPiece);
  }
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

Deno.test("king same position", () => testMove("C3", "C3", false));

// Legal moves
Deno.test("knight top left", () => testMove("E4", "D6", true));
Deno.test("knight top right", () => testMove("E4", "F6", true));
Deno.test("knight left top", () => testMove("E4", "C5", true));
Deno.test("knight left bottom", () => testMove("E4", "C3", true));
Deno.test("knight right top", () => testMove("E4", "G5", true));
Deno.test("knight right bottom", () => testMove("E4", "G3", true));
Deno.test("knight bottom left", () => testMove("E4", "D2", true));
Deno.test("knight bottom right", () => testMove("E4", "F2", true));

// Illegal moves
Deno.test("knight 1 top", () => testMove("E4", "E5", false));
Deno.test("knight 1 right", () => testMove("E4", "F4", false));
Deno.test("knight 1 bottom left", () => testMove("E4", "D3", false));
Deno.test("knight 2 bottom right", () => testMove("E4", "G2", false));
Deno.test("knight 2 top", () => testMove("E4", "E6", false));

// Takes
Deno.test("knight take top left", () =>
  testCollision("D2", "C4", false, "C4", new Pawn(true), true));
Deno.test("knight take bottom right", () =>
  testCollision("F3", "G1", true, "G1", new Pawn(false), true));

// Collisions
Deno.test("knight collision left top", () =>
  testCollision("G4", "E5", true, "E5", new Pawn(true), false));
Deno.test("knight intermediate collision left bottom", () =>
  testCollision("E4", "C3", true, "D4", new Pawn(true), true));
Deno.test("knight intermediate collision top right", () =>
  testCollision("D4", "E6", true, "E5", new Pawn(false), true));
