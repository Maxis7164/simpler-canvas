import { Point } from "./point.js";
import { coordsToPoints } from "./utils.js";

export interface SObjectOpts {
  stroke: string;
  weight: number;
  fill: string;
}

export class SObject {
  static selectionColor: string = "#54bdff";

  static applyOpts(obj: SObject, opts: Partial<SObjectOpts>) {
    if (opts.stroke) obj.stroke = opts.stroke;
    if (opts.weight) obj.weight = opts.weight;
    if (opts.fill) obj.fill = opts.fill;
  }

  #selectable: boolean = true;

  #x: number = -1;
  #y: number = -1;
  #w: number = -1;
  #h: number = -1;

  constructor(opts?: Partial<SObjectOpts>) {
    if (opts) SObject.applyOpts(this, opts);
  }

  weight: number = 1;
  stroke: string = "";
  fill: string = "";

  setBox(b: Box) {
    [this.#x, this.#y, this.#w, this.#h] = b;
  }
  move(dx: number, dy: number): void {
    this.#x += dx;
    this.#y += dy;
  }

  contains(p: Point | Coords): boolean {
    [p] = coordsToPoints(p);
    return (
      p.gt([this.#x, this.#y]) && p.lt([this.#x + this.#w, this.#y + this.#h])
    );
  }

  render(ctx: CanvasRenderingContext2D): void {}

  get isSelectable(): boolean {
    return this.#selectable;
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
