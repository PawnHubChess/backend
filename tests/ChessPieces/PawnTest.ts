import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";

function testPawnMove(
  from: string,
  to: string,
  isWhite: boolean,
  assert: boolean,
) {
  const board = new Board();
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);
  board.setPiece(fromPos, new Pawn(isWhite));
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

function testPawnCollision(
  from: string,
  to: string,
  isWhite: boolean,
  targetWhite: boolean,
  assert: boolean,
) {
  const board = new Board();
  const fromPos = new BoardPosition(from);
  const toPos = new BoardPosition(to);
  board.setPiece(fromPos, new Pawn(isWhite));
  board.setPiece(toPos, new Pawn(targetWhite));
  assertEquals(board.validateMove(fromPos, toPos), assert);
}

// Black pieces straight movements

Deno.test("positions equal", () => testPawnMove("A2", "A2", false, false));

Deno.test("black forward 1 from B7", () =>
  testPawnMove("B7", "B6", false, true));

Deno.test("black forward 2 from B7", () =>
  testPawnMove("B7", "B5", false, true));

Deno.test("black forward 3 from B7", () =>
  testPawnMove("B7", "B4", false, false));

Deno.test("black forward 1 from B6", () =>
  testPawnMove("B6", "B5", false, true));

Deno.test("black forward 2 from B6", () =>
  testPawnMove("B6", "B4", false, false));

Deno.test("black backwards 1 from B6", () =>
  testPawnMove("B6", "B7", false, false));

Deno.test("black left 1 from B6", () => testPawnMove("B6", "A6", false, false));

Deno.test("black right 1 from B6", () =>
  testPawnMove("B6", "C6", false, false));

// White pieces directions

Deno.test("white forward 1 from B2", () =>
  testPawnMove("B2", "B3", true, true));

Deno.test("white forward 2 from B2", () =>
  testPawnMove("B2", "B4", true, true));

Deno.test("white forward 2 from B3", () =>
  testPawnMove("B3", "B5", true, false));

Deno.test("white backwards 1 from B3", () =>
  testPawnMove("B3", "B2", true, false));

Deno.test("white backwards 2 from B3", () =>
  testPawnMove("B3", "B1", true, false));

// Diagonal takes

Deno.test("black diagonal take front right", () =>
  testPawnCollision("B7", "C6", false, true, true));

Deno.test("black diagonal take front left", () =>
  testPawnCollision("B7", "A6", false, true, true));

Deno.test("black diagonal take back right", () =>
  testPawnCollision("B6", "C7", false, true, false));

Deno.test("black diagonal 2 take front right", () =>
  testPawnCollision("B7", "D5", false, true, false));

Deno.test("black diagonal take front right same color", () =>
  testPawnCollision("B7", "C6", false, false, false));

Deno.test("white diagonal take front right", () =>
  testPawnCollision("B2", "C3", true, false, true));

// Collisions

Deno.test("black forward 1 collision", () =>
  testPawnCollision("B7", "B6", false, true, false));

Deno.test("black forward 2 collision same color", () =>
  testPawnCollision("B7", "B5", false, false, false));

Deno.test("white forward 1 collision", () =>
  testPawnCollision("B2", "B3", true, false, false));
