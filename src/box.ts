import { Point } from "./point.js";

export class Box {
  #x: number;
  #y: number;
  #w: number;
  #h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.#x = x;
    this.#y = y;
    this.#w = w;
    this.#h = h;
  }

  move(dp: Point | Coords, boundings: Empty<BoxArr>): void {
    [dp] = Point.convert(true, dp);

    if (boundings.length > 0) {
      const x = this.#x + dp.x;
      const y = this.#y + dp.y;

      const b = boundings as BoxArr;

      if (x > b[0] && x + this.#w < b[0] + b[2]) this.#x = x;
      if (y > b[1] && y + this.#h < b[1] + b[3]) this.#y = y;
    } else {
      this.#x += dp.x;
      this.#y += dp.y;
    }
  }
  setPosition(p: Point | Coords): void {
    [p] = Point.convert(true, p);

    this.#x = p.x;
    this.#y = p.y;
  }

  contains(b: Box): boolean;
  contains(p: Point | Coords): boolean;
  contains(p: Point | Coords | Box): boolean {
    const bx = p instanceof Box;

    if (!bx) [p] = Point.convert(true, p as Point | Coords);
    else p = p as Box; //? TypeScript avoid type error

    return (
      p.x > this.#x &&
      p.x < this.#x + this.#w &&
      p.y > this.#y &&
      p.y < this.#y + this.#h
    );
  }
  containedIn(b: Box): boolean {
    return b.contains(this);
  }

  toArray(): BoxArr {
    return [this.#x, this.#y, this.#w, this.#h];
  }

  get points(): Point[] {
    return [
      new Point([this.#x, this.#y]),
      new Point([this.#x + this.#w, this.#y]),
      new Point([this.#x + this.#w, this.#y + this.#h]),
      new Point([this.#x, this.#y + this.#h]),
    ];
  }
  get position(): Point {
    return new Point([this.#x, this.#y]);
  }
  get x(): number {
    return this.#x;
  }
  get y(): number {
    return this.#y;
  }
  get w(): number {
    return this.#w;
  }
  get h(): number {
    return this.#h;
  }
}
