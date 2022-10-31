import { coordsToPoints } from "./utils.js";

export class Point {
  #x: number;
  #y: number;

  constructor(p: Coords) {
    [this.#x, this.#y] = p;
  }

  eq(p: Point | Coords): boolean {
    [p] = coordsToPoints(p);
    return this.#x === p.x && this.#y === p.y;
  }
  gt(p: Point | Coords): boolean {
    [p] = coordsToPoints(p);
    return this.#x > p.x && this.#y > p.y;
  }
  lt(p: Point | Coords): boolean {
    [p] = coordsToPoints(p);
    return this.#x < p.x && this.#y < p.y;
  }

  lerp(p: Point | Coords, t: number = 0.5): Point {
    [p] = coordsToPoints(p);
    return new Point([
      this.#x + (p.#x - this.#x) * t,
      this.#x + (p.#y - this.#y) * t,
    ]);
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
