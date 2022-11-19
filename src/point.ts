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

  #x: number;
  #y: number;

  constructor(p: Coords) {
    [this.#x, this.#y] = p;
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
}
