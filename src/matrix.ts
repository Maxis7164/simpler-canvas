import matrixInverse from "./dep.matrix-inverse.js";
import { formatMessage } from "./utils.js";

export class Matrix {
  static errors = {
    NO_ROWS: "Invalid Matrix: Cannot create a matrix with no rows!",
    NO_COLUMNS: "Invalid Matrix: Cannot create a matrix with no columns!",
    INVALID_COLUMNS:
      "Invalid Matrix: The number of columns per row does not match!",
    NO_CTX:
      "Invalid Operation: A {{d[0]}}x{{d[1]}} matrix cannot be converted to a Canvas compatible matrix format, a 2x3 matrix is required!",
    INVALID_MULTIPLY:
      "Invalid Multiplication: Cannot multiply a {{a[0]}}x{{a[1]}} matrix with a {{b[0]}}x{{b[1]}} matrix!",
    INVALID_ADD:
      "Invalid Addition: Cannot add a {{a[0]}}x{{a[1]}} matrix with a {{b[0]}}x{{b[1]}} matrix!",
    INVALID_CONVERSION:
      "Cannot convert {{t}} because it's neither a Matrix or a Point nor is it of type Coords!",
  };

  static #isValidMatrix(m: number[][]): Dimension {
    const l = m.map((c) => c.length);

    const sl = l.every((c, i) => (i === 0 ? true : c === l[0]));

    return sl ? [m.length, l[0]] : [-1, -1];
  }

  static #degreesToRadians(d: number): number {
    return (Math.PI * d) / 180;
  }

  /** @param { number } n The number of rows and columns of the identity matrix */
  static getIdentity(n: number): Matrix {
    const m: number[][] = Array(n);
    const x: number[] = Array(n);

    x.fill(0, 0, n);

    for (let i: number = 0; i < n; i++) {
      m[i] = [...x];
      m[i][i] = 1;
    }

    return new Matrix(m);
  }

  #dim: Dimension;
  #m: number[][];

  constructor(m: number[][]) {
    this.#dim = Matrix.#isValidMatrix(m);

    if (this.#dim[0] === 0 || this.#dim[1] <= 0)
      throw new Error(
        `[!] <new Matrix()> ${
          this.#dim[0] === 0
            ? Matrix.errors.NO_ROWS
            : this.#dim[0] === 0
            ? Matrix.errors.NO_COLUMNS
            : Matrix.errors.INVALID_COLUMNS
        }`
      );
    else this.#m = m;
  }

  entry(r: number, c: number): number {
    return this.#m[r][c];
  }

  multiplyWith(m: Matrix): Matrix {
    if (this.#dim[1] !== m.#dim[0])
      throw new Error(
        `[!] <Matrix.multiplyWith> ${formatMessage(
          Matrix.errors.INVALID_MULTIPLY,
          { a: this.#dim, b: m.#dim }
        )}`
      );

    const nxt: number[][] = [];

    for (let r: number = 0; r < this.#dim[0]; r++) {
      const nr: number[] = [];

      for (let c: number = 0; c < m.#dim[1]; c++) {
        for (let i: number = 0; i < this.#m[r].length; i++) {
          nr[c] = (nr[c] ?? 0) + this.#m[r][i] * m.#m[i][c];
        }
      }

      nxt.push(nr);
    }

    return new Matrix(nxt);
  }
  addWith(m: Matrix): Matrix {
    if (this.#dim[0] !== m.#dim[0] || this.#dim[1] !== m.#dim[1])
      throw new Error(
        `[!] <Matrix.addWith> ${formatMessage(Matrix.errors.INVALID_ADD, {
          a: this.#dim,
          b: m.#dim,
        })}`
      );

    const nxt: number[][] = [];

    for (let r: number = 0; r < this.#dim[0]; r++) {
      if (typeof nxt[r] === "undefined") nxt[r] = [];

      for (let c: number = 0; c < this.#dim[1]; c++) {
        nxt[r][c] = this.#m[r][c] + m.#m[r][c];
      }
    }

    return new Matrix(nxt);
  }

  getInverse(): Matrix {
    return new Matrix(matrixInverse(this.#m));
  }

  scale(v?: number, h?: number): Matrix {
    const r = [...this.#m];

    if (h && h > 0) r[0][0] = r[0][0] * h;
    if (v && v > 0) r[1][1] = r[1][1] * v;

    return new Matrix([...r]);
  }
  rotate(angle: number): Matrix {
    const og = [...this.#m];

    const r = Matrix.#degreesToRadians(angle);

    og[0][0] = og[0][0] * Math.cos(r);
    og[0][1] = og[0][1] * -Math.sin(r);
    og[1][0] = og[1][0] * Math.sin(r);
    og[1][1] = og[1][1] * Math.cos(r);

    return new Matrix([...og]);
  }

  toArray(): number[][] {
    return [...this.#m];
  }
  toCtxInterp(): Matrix2x3 {
    if ((this.#dim[0] === 2 || this.#dim[0] === 3) && this.#dim[1] === 3) {
      const r: number[] = [];
      this.#m.forEach((c, i) => (i < 2 ? r.push(...c) : null));

      return [r[0], r[3], r[1], r[4], r[2], r[5]] as Matrix2x3;
    }

    throw new Error(
      `[!] <Matrix.toCtxInterp> ${formatMessage(Matrix.errors.NO_CTX, {
        d: this.#dim,
      })}`
    );
  }

  get dimension(): Dimension {
    return [...this.#dim];
  }
}
