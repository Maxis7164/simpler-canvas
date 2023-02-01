import { Matrix } from "./matrix.js";
import { formatMessage } from "./utils.js";

export class Point {
  static readonly errors: Typed<string> = {
    UNEXPECTED_TYPE:
      "Unexpected Type: Expected type was {{t}}, got {{i}} instead!",
    INVALID_RADIUS: "Invalid Radius: The radius of a point cannot be 0!",
  };

  static convert(coordsToPoints: true, ...poc: (Point | Coords)[]): Point[];
  static convert(coordsToPoints: false, ...poc: (Point | Coords)[]): Coords[];
  static convert(
    coordsToPoints: boolean,
    ...poc: (Point | Coords)[]
  ): (Point | Coords)[] {
    return poc.map((p) => {
      if (!(p instanceof Point) && !Array.isArray(p))
        throw new Error(
          `[!] <Point.pointsToCoords> ${formatMessage(
            Point.errors.UNEXPECTED_TYPE,
            { t: "Point", i: typeof p }
          )}`
        );

      return coordsToPoints
        ? p instanceof Point
          ? p
          : new Point(p)
        : p instanceof Point
        ? p.coords
        : p;
    });
  }

  static getPointOnCubic(
    p0: Point | Coords,
    p1: Point | Coords,
    p2: Point | Coords,
    p3: Point | Coords,
    t: number
  ): Point {
    [p0, p1, p2, p3] = this.convert(true, p0, p1, p2, p3);

    const a = p0.lerp(p1, t);
    const b = p1.lerp(p2, t);
    const c = p2.lerp(p3, t);

    const ab = a.lerp(b, t);
    const bc = b.lerp(c, t);

    return ab.lerp(bc, t);
  }

  static readonly INVALID: Point = new Point([-999, -999], true);

  #isInvalid: boolean = false;
  #x: number;
  #y: number;

  constructor(p: Coords | Matrix, invalid: boolean = false) {
    [this.#x, this.#y] =
      p instanceof Matrix ? [p.entry(0, 0), p.entry(1, 0)] : p;

    this.#isInvalid = invalid;
  }

  eq(p: Point | Coords): boolean {
    [p] = Point.convert(true, p);
    return this.#x === p.x && this.#y === p.y;
  }
  gt(p: Point | Coords): boolean {
    [p] = Point.convert(true, p);
    return this.#x > p.x && this.#y > p.y;
  }
  lt(p: Point | Coords): boolean {
    [p] = Point.convert(true, p);
    return this.#x < p.x && this.#y < p.y;
  }

  add(p: Point): Point;
  add(dp: Coords): Point;
  add(dp: Point | Coords): Point {
    return new Point([
      this.#x + (dp instanceof Point ? dp.x : dp[0]),
      this.#y + (dp instanceof Point ? dp.y : dp[1]),
    ]);
  }

  lerp(p: Point | Coords, t: number = 0.5): Point {
    [p] = Point.convert(true, p);
    return new Point([
      this.#x + (p.#x - this.#x) * t,
      this.#y + (p.#y - this.#y) * t,
    ]);
  }

  clone(): Point {
    return new Point(this.coords);
  }

  contains(p: Point | Coords, radius: number): boolean {
    if (radius < 1) {
      console.error(`[!] <Point.contains> ${Point.errors.INVALID_RADIUS}`);
      return false;
    }
    [p] = Point.convert(true, p);

    return (
      this.#x - radius / 2 < p.#x &&
      this.#x + radius / 2 > p.#x &&
      this.#y - radius / 2 < p.#y &&
      this.#y + radius / 2 > p.#y
    );
  }

  moveTo(ctx: CanvasRenderingContext2D): void {
    ctx.moveTo(this.#x, this.#y);
  }
  lineTo(ctx: CanvasRenderingContext2D): void {
    ctx.lineTo(this.#x, this.#y);
  }

  get x(): number {
    return this.#x;
  }
  get y(): number {
    return this.#y;
  }
  get coords(): Coords {
    return [this.#x, this.#y];
  }
  get isInvalid(): boolean {
    return this.#isInvalid;
  }
}
