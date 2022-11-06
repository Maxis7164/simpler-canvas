import { Point } from "./point.js";

export class Selection {
  #s: Point;
  #e?: Point;

  constructor(s: Coords | Point) {
    this.#s = !(s instanceof Point) ? new Point(s) : s;
  }

  setEnd(e: Coords | Point) {
    this.#e = !(e instanceof Point) ? new Point(e) : e;
  }

  getBox(): Box | null {
    return this.#e
      ? this.#s.lt(this.#e)
        ? [...this.#s.coords, this.#e.x - this.#s.x, this.#e.y - this.#s.y]
        : [...this.#e.coords, this.#s.x - this.#e.x, this.#s.y - this.#e.y]
      : null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.#e) return;

    ctx.save();
    ctx.beginPath();

    ctx.rect(...this.getBox()!);
    ctx.strokeStyle = "#22ffbb";
    ctx.stroke();

    ctx.fillStyle = "#22ffbb";
    ctx.globalAlpha = 0.4;
    ctx.fill();

    ctx.restore();
  }
}
