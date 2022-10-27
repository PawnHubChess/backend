//
// SOME INFORMATION ABOUT THE CHESS FIELD NAMING
// The positions are considered relative to the board, which is playing black
// This means that A1 will correspond to the top right corner: (7, 0)
// X is spanned by letters in reverse order, Y by numbers. H8 => (0, 7)
//
const xValues = ["H", "G", "F", "E", "D", "C", "B", "A"]
export class BoardPosition {
  x: number;
  y: number;

  constructor(x: number, y: number);
  constructor(str: string);

  constructor(...args: any[]) {
    if (args.length == 1) {
      // string
      const input = args[0] as string
      if (!input.match(/^\w\d$/)) throw(new Error("Malformatted Input"))

      this.x = xValues.indexOf(input.charAt(0).toUpperCase());
      this.y = +input.charAt(1) - 1;

      if (this.x < 0 || this.x > 7) throw(new Error("X out of bounds, input malformatted"))
      if (this.y < 0 || this.y > 7) throw(new Error("Y out of bounds, input malformatted"))

    } else {
      // int, int
      this.x = arguments[0];
      this.y = arguments[1];
    }
  }

  toString() {
    return `${xValues[this.x]}${this.y + 1}`;
  }

}

export function isTowardsWhite(from: BoardPosition, to: BoardPosition) {
  // White is starting low-y fields
  return from.y > to.y;
}

// Returns a list of BoardPositions between two diagonal, horizontal or vertical positions
export function getIntermediatePositions(from: BoardPosition, to: BoardPosition): BoardPosition[] {
  if (from.x != to.x && from.y != to.y && Math.abs(from.x - to.x) != Math.abs(from.y - to.y)) {
    throw(new Error("Positions not on same line"));
  }

  const positions: BoardPosition[] = [];
  const xDiff = to.x - from.x;
  const yDiff = to.y - from.y;

  const xStep = xDiff == 0 ? 0 : xDiff / Math.abs(xDiff);
  const yStep = yDiff == 0 ? 0 : yDiff / Math.abs(yDiff);

  let x = from.x + xStep;
  let y = from.y + yStep;

  while (x != to.x || y != to.y) {
    positions.push(new BoardPosition(x, y));
    x += xStep;
    y += yStep;
  }

  return positions;
}