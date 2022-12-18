export class Point {
  static #coordsToPoints(...coords: (Point | Coords)[]): Point[] {
    return coords.map((p) => {
      if (typeof p === "undefined")
        throw new Error(
          '[!] <Simpler Canvas> Invalid Coordinates: "undefined" is not a valid coordinate array or Point!'
        );

      return p instanceof Point ? p : new Point(p);
    });
  }

  static getPointOnBezier(
    p0: Point | Coords,
    p1: Point | Coords,
    p2: Point | Coords,
    p3: Point | Coords,
    t: number
  ): Point {
    [p0, p1, p2, p3] = this.#coordsToPoints(p0, p1, p2, p3);

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

  constructor(p: Coords, invalid: boolean = false) {
    [this.#x, this.#y] = p;

    this.#isInvalid = invalid;
  }

  eq(p: Point | Coords): boolean {
    [p] = Point.#coordsToPoints(p);
    return this.#x === p.x && this.#y === p.y;
  }
  gt(p: Point | Coords): boolean {
    [p] = Point.#coordsToPoints(p);
    return this.#x > p.x && this.#y > p.y;
  }
  lt(p: Point | Coords): boolean {
    [p] = Point.#coordsToPoints(p);
    return this.#x < p.x && this.#y < p.y;
  }

  lerp(p: Point | Coords, t: number = 0.5): Point {
    [p] = Point.#coordsToPoints(p);
    return new Point([
      this.#x + (p.#x - this.#x) * t,
      this.#y + (p.#y - this.#y) * t,
    ]);
  }

  clone(): Point {
    return new Point(this.coords);
  }

  contains(p: Point | Coords, range: number): boolean {
    if (range < 1) {
      console.error(
        "[!] <Simpler Canvas> Invalid Range: A range of a point cannot be less then 1!"
      );
      return false;
    }
    [p] = Point.#coordsToPoints(p);

    return (
      this.#x - range / 2 < p.#x &&
      this.#x + range / 2 > p.#x &&
      this.#y - range / 2 < p.#y &&
      this.#y + range / 2 > p.#y
    );
  }

  toString(): string {
    return `${this.#x}, ${this.#y}`;
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
