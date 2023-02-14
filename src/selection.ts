import { SObject } from "./sobject.js";
import { Point } from "./point.js";
import { Box } from "./box.js";

export class Sel {
  static color: string = "#22ffbb";

  #box: Box = new Box(0, 0, 0, 0);

  #curMemb: SObject[] = [];

  #p1: Point | null = null;
  #p2: Point | null = null;

  constructor(p1?: Point, p2?: Point) {
    if (p1) this.#p1 = p1;
    if (p2) this.#p2 = p2;
  }

  setPoint(p: Point | Coords): void {
    [p] = Point.convert(true, p);

    if (!this.#p1) this.#p1 = p;
    this.#p2 = p;

    this.#box = this.#p1.gt(this.#p2)
      ? new Box(
          ...this.#p2.coords,
          this.#p1.x - this.#p2.x,
          this.#p1.y - this.#p2.y
        )
      : new Box(
          ...this.#p1.coords,
          this.#p2.x - this.#p1.x,
          this.#p2.y - this.#p1.y
        );
  }
  clear(): void {
    [this.#p1, this.#p2] = [null, null];
    this.#curMemb = [];
  }

  addMember(memb: SObject): void {
    this.#curMemb.push(memb);
  }

  contains(p: Point): boolean {
    return this.#box.contains(p);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.#p1 || !this.#p2) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = ctx.fillStyle = Sel.color;

    ctx.moveTo(this.#box.x, this.#box.y);
    ctx.rect(...this.#box.toArray());

    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.fill();

    ctx.closePath();
    ctx.restore();
  }

  get box(): Box {
    return this.#box;
  }
  get isComplete(): boolean {
    return !!this.#p1 && !!this.#p2;
  }
}
