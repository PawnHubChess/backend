import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { BoardPosition } from "../BoardPosition.ts";

function parsePosition(input: string): BoardPosition {
  const fieldname = input;
  return new BoardPosition(fieldname);
}

function testParsing(input: string, assertX: number, assertY: number) {
  const pos = parsePosition(input);
  assertEquals(pos.x, assertX);
  assertEquals(pos.y, assertY);
}

Deno.test("parse top left", () => testParsing("H1", 0, 0));
Deno.test("parse bottom left", () => testParsing("H8", 0, 7));
Deno.test("parse top right", () => testParsing("A1", 7, 0));
Deno.test("parse bottom right", () => testParsing("A8", 7, 7));
Deno.test("parse middle", () => testParsing("E4", 3, 3));
Deno.test("parse lowercase", () => testParsing("e4", 3, 3));

Deno.test("out of bounds x", () => {
  assertThrows(() => parsePosition("I1"));
});
Deno.test("out of bounds y", () => {
  assertThrows(() => parsePosition("A9"));
});
Deno.test("out of bounds -y", () => {
  assertThrows(() => parsePosition("A0"));
});
Deno.test("both numbers", () => {
  assertThrows(() => parsePosition("11"));
});
Deno.test("both letters", () => {
  assertThrows(() => parsePosition("AA"));
});
Deno.test("no letter", () => {
  assertThrows(() => parsePosition("1"));
});
Deno.test("no number", () => {
  assertThrows(() => parsePosition("A"));
});
Deno.test("empty input", () => {
  assertThrows(() => parsePosition(""));
});

function testToString(inputX: number, inputY: number, assert: string) {
  const pos = new BoardPosition(inputX, inputY);
  assertEquals(pos.toString(), assert);
}

Deno.test("string top left", () => testToString(0, 0, "H1"));	
Deno.test("string bottom left", () => testToString(0, 7, "H8"));
Deno.test("string top right", () => testToString(7, 0, "A1"));
Deno.test("string bottom right", () => testToString(7, 7, "A8"));
Deno.test("string middle", () => testToString(3, 3, "E4"));