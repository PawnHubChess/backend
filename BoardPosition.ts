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
      this.x = xValues.indexOf(input.charAt(0).toUpperCase());
      this.y = +input.charAt(1) - 1;
    } else {
      // int, int
      this.x = arguments[0];
      this.y = arguments[1];
    }
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  // todo parse from string
  // todo toString
}
