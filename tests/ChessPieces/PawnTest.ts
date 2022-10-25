import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Board } from "../../Board.ts";
import { BoardPosition } from "../../BoardPosition.ts";
import { Pawn } from "../../ChessPieces/Pawn.ts";

// Black pieces straight movements

Deno.test("positions equal", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("A2");
  const to = new BoardPosition("A2");
  board.setPiece(from, pawn);
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black forward 1 from B7", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("B6");
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("black forward 2 from B7", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("B5");
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("black forward 3 from B7", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("B4");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black forward 1 from B6", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("B5");
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("black forward 2 from B6", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("B4");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black backwards 1 from B6", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("B7");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black left 1 from B6", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("A6");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black right 1 from B6", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("C6");
  assertEquals(pawn.validateMove(from, to, board), false);
});

// White pieces directions

Deno.test("white forward 1 from B2", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B2");
  const to = new BoardPosition("B3");
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("white forward 2 from B2", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B2");
  const to = new BoardPosition("B4");
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("white forward 2 from B3", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B3");
  const to = new BoardPosition("B5");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("white backwards 1 from B3", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B3");
  const to = new BoardPosition("B2");
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("white backwards 2 from B3", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B3");
  const to = new BoardPosition("B1");
  assertEquals(pawn.validateMove(from, to, board), false);
});

// Diagonal takes

Deno.test("black diagonal take front right", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("C6");
  board.setPiece(to, new Pawn(true));
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("black diagonal take front left", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("A6");
  board.setPiece(to, new Pawn(true));
  assertEquals(pawn.validateMove(from, to, board), true);
});

Deno.test("black diagonal take back right", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B6");
  const to = new BoardPosition("C7");
  board.setPiece(to, new Pawn(true));
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black diagonal 2 take front right", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("D5");
  board.setPiece(to, new Pawn(true));
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black diagonal take front right same color", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("C6");
  board.setPiece(to, new Pawn(false));
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("white diagonal take front right", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B2");
  const to = new BoardPosition("C3");
  board.setPiece(to, new Pawn(false));
  assertEquals(pawn.validateMove(from, to, board), true);
});

// Collisions

Deno.test("black forward 1 collision", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("B6");
  board.setPiece(to, new Pawn(true));
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("black forward 2 collision same color", () => {
  const pawn = new Pawn(false);
  const board = new Board();
  const from = new BoardPosition("B7");
  const to = new BoardPosition("B5");
  board.setPiece(to, new Pawn(false));
  assertEquals(pawn.validateMove(from, to, board), false);
});

Deno.test("white forward 1 collision", () => {
  const pawn = new Pawn(true);
  const board = new Board();
  const from = new BoardPosition("B2");
  const to = new BoardPosition("B3");
  board.setPiece(to, new Pawn(false));
  assertEquals(pawn.validateMove(from, to, board), false);
});