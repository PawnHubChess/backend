import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";
import { King } from "../../ChessPieces/King.ts";
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
  board.set(fromPos, new King(isWhite));
  if (otherPos !== null && otherPiece !== null) {
    board.set(new BoardPosition(otherPos), otherPiece);
  }
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

Deno.test("same position", () => testMove("C3", "C3", false));

// Legal moves
Deno.test("top left", () => testMove("E4", "D5", true));
Deno.test("top", () => testMove("E4", "E5", true));
Deno.test("top right", () => testMove("E4", "F5", true));
Deno.test("left", () => testMove("E4", "D4", true));
Deno.test("right", () => testMove("E4", "F4", true));
Deno.test("bottom left", () => testMove("E4", "D3", true));
Deno.test("bottom", () => testMove("E4", "E3", true));
Deno.test("bottom right", () => testMove("E4", "F3", true));

// Illegal moves
Deno.test("top left 2", () => testMove("E4", "C6", false));
Deno.test("top 2", () => testMove("E4", "E6", false));
Deno.test("top right 2", () => testMove("E4", "G6", false));
Deno.test("left 2", () => testMove("E4", "C4", false));
Deno.test("right 2", () => testMove("E4", "G4", false));
Deno.test("bottom left 2", () => testMove("E4", "C2", false));
Deno.test("bottom 2", () => testMove("E4", "E2", false));
Deno.test("bottom right 2", () => testMove("E4", "G2", false));

// Takes
Deno.test("take top", () =>
  testCollision("D2", "D3", false, "E3", new Pawn(true), true));
Deno.test("take bottom left", () =>
  testCollision("F2", "E1", true, "F6", new Pawn(false), true));

// Collisions
Deno.test("collision right", () =>
  testCollision("G4", "G5", true, "G5", new Pawn(true), false));
