import { Point } from "./point.js";
import { coordsToPoints } from "./utils.js";

export class SObject {
  static selectionColor: string = "#54bdff";

  static applyOpts(obj: SObject, opts: Partial<SObjectOpts>) {
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

  #x: number = -1;
  #y: number = -1;
  #w: number = -1;
  #h: number = -1;

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
    this.#x += dx;
    this.#y += dy;
  }
  setPosition(p: Coords | Point): void {
    if (p instanceof Point) p = p.coords;

    [this.#x, this.#y] = p;
  }

  setSelected(isSelected?: boolean): void {
    if (this.selectable) this.#selected = isSelected ?? !this.#selected;
  }

  contains(p: Point | Coords): boolean {
    [p] = coordsToPoints(p);
    return (
      p.gt([this.#x, this.#y]) && p.lt([this.#x + this.#w, this.#y + this.#h])
    );
  }
  containedIn(box: Box): boolean {
    console.log(
      this.#x > box[0],
      this.#x + this.#w < box[0] + box[2],
      this.#y > box[1],
      this.#y + this.#h < box[1] + box[3]
    );

    return (
      this.#x > box[0] &&
      this.#x + this.#w < box[0] + box[2] &&
      this.#y > box[1] &&
      this.#y + this.#h < box[1] + box[3]
    );
  }

  render(ctx: CanvasRenderingContext2D): void {}

  renderBox(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = "#22ffbb";
    ctx.strokeRect(...this.box);

    ctx.restore();
  }

  toObject(): SObjectExport {
    return SObject.toObject(this);
  }

  get selected(): boolean {
    return this.#selected;
  }
  get coords(): Point {
    return new Point([this.#x, this.#y]);
  }
  get box(): Box {
    return [this.#x, this.#y, this.#w, this.#h];
  }
  get boundings(): Boundings {
    return [
      new Point([this.#x, this.#y]),
      new Point([this.#x + this.#w, this.#y]),
      new Point([this.#x + this.#w, this.#y + this.#w]),
      new Point([this.#x, this.#y + this.#w]),
    ];
  }
}
