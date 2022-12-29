import type { Canvas } from "./canvas.js";
import { Point } from "./point.js";
import { Matrix } from "./matrix.js";

export class SObject {
  static #applyInverseOnPoint(m: Matrix, p: Point | Coords): Point {
    if (p instanceof Point) p = p.coords;

    const v = new Matrix([[p[0]], [p[1]], [0]]);

    const i = m.getInverse();
    return new Point(i.multiplyWith(v));
  }

  static applyOpts(obj: SObject, opts: Partial<SObjectOpts>): void {
    if (opts.selectable) obj.selectable = opts.selectable;
    if (opts.stroke) obj.stroke = opts.stroke;
    if (opts.weight) obj.weight = opts.weight;
    if (opts.fill) obj.fill = opts.fill;
  }
  static getOpts(obj: SObject): SObjectOpts {
    return {
      selectable: obj.selectable,
      stroke: obj.stroke,
      weight: obj.weight,
      fill: obj.fill,
    };
  }
  static toObject(obj: SObject): SObjectExport {
    return {
      ...SObject.getOpts(obj),
      type: "sobject",
      x: obj.#x,
      y: obj.#y,
    };
  }

  #selected: boolean = false;

  #m: Matrix = Matrix.getIdentity(3);
  #x: number = -1;
  #y: number = -1;
  #w: number = -1;
  #h: number = -1;

  #scaleX: number = 1;
  #scaleY: number = 1;

  constructor(opts?: Partial<SObjectOpts>) {
    if (opts) SObject.applyOpts(this, opts);
  }

  selectable: boolean = true;
  stroke: string = "#000000";
  weight: number = 1;
  fill: string = "";

  setBox(b: Box) {
    [this.#x, this.#y, this.#w, this.#h] = b;
  }
  move(dx: number, dy: number): void {
    [dx, dy] = SObject.#applyInverseOnPoint(this.#m, [dx, dy]).coords;

    this.#x += dx;
    this.#y += dy;
  }
  setPosition(p: Coords | Point): void {
    if (p instanceof Point) p = p.coords;

    [this.#x, this.#y] = p;
  }

  scale(v?: number, h?: number): void {
    if (h && h > 0) {
      this.#x = this.#x * (this.#scaleX / h);
      this.#scaleX = h;
    }
    if (v && v > 0) {
      this.#y = this.#y * (this.#scaleY / v);
      this.#scaleY = v;
    }

    this.#m = this.#m.scale(v, h);
  }

  setSelected(isSelected?: boolean): void {
    if (this.selectable) this.#selected = isSelected ?? !this.#selected;
  }

  contains(p: Point | Coords): boolean {
    [p] = Point.convert(true, p);
    p = SObject.#applyInverseOnPoint(this.#m, p.coords);

    return (
      p.gt([this.#x - 0.5 * this.weight, this.#y - 0.5 * this.weight]) &&
      p.lt([this.#x + this.#w + this.weight, this.#y + this.#h + this.weight])
    );
  }
  containedIn(box: Box): boolean {
    return (
      this.#x - 0.5 * this.weight > box[0] &&
      this.#x + this.#w + this.weight < box[0] + box[2] &&
      this.#y + 0.5 * this.weight > box[1] &&
      this.#y + this.#h + this.weight < box[1] + box[3]
    );
  }

  render(ctx: CanvasRenderingContext2D): void {}

  renderBox(ctx: CanvasRenderingContext2D, clr: string): void {
    ctx.save();
    ctx.beginPath();
    ctx.transform(...this.#m.toCtxInterp());

    ctx.strokeStyle = clr;
    ctx.strokeRect(...this.box);

    ctx.restore();
  }

  remove(from: Canvas): void {
    from.remove(this);
  }

  toObject(): SObjectExport {
    return SObject.toObject(this);
  }

  get selected(): boolean {
    return this.#selected;
  }
  get x(): number {
    return this.#x;
  }
  get y(): number {
    return this.#y;
  }
  get width(): number {
    return this.#w;
  }
  get height(): number {
    return this.#h;
  }
  get coords(): Coords {
    return [this.#x, this.#y];
  }
  get box(): Box {
    return [
      this.#x - 0.5 * this.weight,
      this.#y - 0.5 * this.weight,
      this.#w + this.weight,
      this.#h + this.weight,
    ];
  }
  get boundings(): Boundings {
    return [
      new Point([this.#x, this.#y]),
      new Point([this.#x + this.#w, this.#y]),
      new Point([this.#x + this.#w, this.#y + this.#w]),
      new Point([this.#x, this.#y + this.#w]),
    ];
  }
  get matrix(): Matrix {
    return this.#m;
  }
}
