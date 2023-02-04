// import { SObject } from "./sobject.js";
import { Point } from "./point.js";
import { Path } from "./path.js";

export class Selection {
  static color: string = "#22ffbb";

  #member: Path[] = [];
  #finalized: boolean = false;

  #s: Point;
  #e?: Point;
  #box: Box | null = null;

  #calcBox(): void {
    if (this.#finalized && this.#e) {
      const BASE = this.#member[0]?.coords ?? [-99, -99];

      const low: number[] = [...BASE];
      const high: number[] = [...BASE];

      this.#member.forEach((obj) => {
        if (low[0] > obj.x) low[0] = obj.x - obj.weight / 2;
        if (low[1] > obj.y) low[1] = obj.y - obj.weight / 2;
        if (high[0] < obj.x + obj.width)
          high[0] = obj.x + obj.width + obj.weight / 2;
        if (high[1] < obj.y + obj.height)
          high[1] = obj.y + obj.height + obj.weight / 2;
      });

      this.#box = [...low, high[0] - low[0], high[1] - low[1]] as Box;
    } else {
      this.#box = this.#e
        ? this.#s.lt(this.#e)
          ? [...this.#s.coords, this.#e.x - this.#s.x, this.#e.y - this.#s.y]
          : [...this.#e.coords, this.#s.x - this.#e.x, this.#s.y - this.#e.y]
        : null;
    }
  }

  constructor(s: Coords | Point, e?: Coords | Point) {
    this.#s = !(s instanceof Point) ? new Point(s) : s;
    if (e) this.#e = !(e instanceof Point) ? new Point(e) : e;

    this.#calcBox();
  }

  finalize(...memb: Path[]): void {
    if (this.#finalized) return;

    this.#member.push(...memb);
    this.#finalized = true;
    this.#calcBox();
  }

  setEnd(e: Coords | Point): void {
    if (this.#finalized) return;
    this.#e = !(e instanceof Point) ? new Point(e) : e;
  }

  move(dx: number, dy: number): void {
    if (!this.#finalized) return;

    this.#member.forEach((obj) => obj.move(dx, dy));
    this.#calcBox();
  }

  isMember(obj: Path): boolean {
    return this.#member.includes(obj);
  }
  contains(p: Point | Coords): boolean {
    if (!this.#finalized) return false;

    [p] = Point.convert(true, p);

    return (
      this.#box![0] < p.x &&
      this.#box![0] + this.#box![2] > p.x &&
      this.#box![1] < p.y &&
      this.#box![1] + this.#box![3] > p.y
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.#e) return;

    this.#calcBox();

    ctx.save();
    ctx.beginPath();

    ctx.rect(...this.box!);
    ctx.strokeStyle = Selection.color;
    ctx.stroke();

    if (!this.#finalized) {
      ctx.fillStyle = Selection.color;
      ctx.globalAlpha = 0.4;
      ctx.fill();
    }

    ctx.restore();
  }

  get members(): Path[] {
    return [...this.#member];
  }
  get box(): Box | null {
    return this.#box ? [...this.#box] : null;
  }
  get isFinalized(): boolean {
    return this.#finalized;
  }
}
