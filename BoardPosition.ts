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
