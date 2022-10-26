import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board, initEmptyBoard } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";
import { ChessPiece } from "../../ChessPieces/_ChessPiece.ts";

function testMove(
  from: string,
  to: string,
  isWhite: boolean,
  assert: boolean,
) {
  testCollision(from, to, isWhite, null, null, assert);
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
  board.set(fromPos, new Pawn(isWhite));
  if (otherPos !== null && otherPiece !== null) {
    board.set(new BoardPosition(otherPos), otherPiece);
  }
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

// Black pieces straight movements

Deno.test("positions equal", () => testMove("A2", "A2", false, false));

Deno.test("black forward 1 from B7", () => testMove("B7", "B6", false, true));

Deno.test("black forward 2 from B7", () => testMove("B7", "B5", false, true));

Deno.test("black forward 3 from B7", () => testMove("B7", "B4", false, false));

Deno.test("black forward 1 from B6", () => testMove("B6", "B5", false, true));

Deno.test("black forward 2 from B6", () => testMove("B6", "B4", false, false));

Deno.test("black backwards 1 from B6", () =>
  testMove("B6", "B7", false, false));

Deno.test("black left 1 from B6", () => testMove("B6", "A6", false, false));

Deno.test("black right 1 from B6", () => testMove("B6", "C6", false, false));

// White pieces directions

Deno.test("white forward 1 from B2", () => testMove("B2", "B3", true, true));

Deno.test("white forward 2 from B2", () => testMove("B2", "B4", true, true));

Deno.test("white forward 2 from B3", () => testMove("B3", "B5", true, false));

Deno.test("white backwards 1 from B3", () => testMove("B3", "B2", true, false));

Deno.test("white backwards 2 from B3", () => testMove("B3", "B1", true, false));

// Diagonal takes

Deno.test("black diagonal take front right", () =>
  testCollision("B7", "C6", false, "C6", new Pawn(true), true));

Deno.test("black diagonal take front left", () =>
  testCollision("B7", "A6", false, "A6", new Pawn(true), true));

Deno.test("black diagonal take back right", () =>
  testCollision("B6", "C7", false, "C7", new Pawn(true), false));

Deno.test("black diagonal 2 take front right", () =>
  testCollision("B7", "D5", false, "D5", new Pawn(true), false));

Deno.test("black diagonal take front right same color", () =>
  testCollision("B7", "C6", false, "C6", new Pawn(false), false));

Deno.test("white diagonal take front right", () =>
  testCollision("B2", "C3", true, "C3", new Pawn(false), true));

// Collisions

Deno.test("black forward 1 collision", () =>
  testCollision("B7", "B6", false, "B6", new Pawn(true), false));

Deno.test("black forward 2 collision same color", () =>
  testCollision("B7", "B5", false, "B5", new Pawn(false), false));

Deno.test("white forward 1 collision", () =>
  testCollision("B2", "B3", true, "B3", new Pawn(false), false));

Deno.test("black forward 2 intermediate collison", () =>
  testCollision("C7", "C5", false, "B6", new Pawn(false), false));

Deno.test("white forward 2 intermediate collison opponent", () =>
  testCollision("C2", "C4", true, "C3", new Pawn(false), false));
