import { Canvas } from "./canvas.js";
import { Matrix } from "./matrix.js";
import { Point } from "./point.js";
import { Box } from "./box.js";

export abstract class SObject<E extends {} = {}> {
  #box: Box;

  #isSelected: boolean = false;
  #getsDeleted: boolean = false;

  #m: Matrix = Matrix.getIdentity(3);
  #mi: Matrix = Matrix.getIdentity(3);

  #applyInverseOnPoint(p: Point | Coords): Point {
    if (p instanceof Point) p = p.coords;

    const v = new Matrix([[p[0]], [p[1]], [0]]);

    return new Point(this.#mi.multiplyWith(v));
  }
  #applyMatrixOnPoint(p: Point | Coords): Point {
    if (p instanceof Point) p = p.coords;

    const v = new Matrix([[p[0]], [p[1]], [0]]);

    return new Point(this.#m.multiplyWith(v));
  }

  constructor(pos: Point | Coords, size: Point | Coords) {
    [pos, size] = Point.convert(true, pos, size);
    this.#box = new Box(pos.x, pos.y, size.x, size.y);
  }

  abstract render(ctx: CanvasRenderingContext2D): void;
  renderBox(ctx: CanvasRenderingContext2D, clr: string): void {
    ctx.save();
    ctx.beginPath();
    ctx.transform(...this.#m.toCtxInterp());

    const p = this.#applyInverseOnPoint(this.position);

    ctx.strokeStyle = clr;
    ctx.strokeRect(p.x, p.y, this.#box.w, this.#box.h);

    ctx.restore();
  }

  protected setBox(box: Box): void {
    this.#box = box;
  }

  move(dp: Point | Coords, boundings: Empty<BoxArr>): void {
    this.#box.move(dp, boundings);
  }
  setPosition(p: Point | Coords): void {
    this.#box.setPosition(p);
  }

  remove(from: Canvas): void {
    from.remove(this);
    this.getsDeleted = false;
  }

  contains(p: Point | Coords): boolean {
    return this.#box.contains(p);
  }
  containedIn(b: Box): boolean {
    return this.#box.containedIn(b);
  }

  abstract toObject(): E;

  set isSelected(state: boolean) {
    this.#isSelected = state;
  }
  get isSelected(): boolean {
    return this.#isSelected;
  }

  set getsDeleted(state: boolean) {
    this.#getsDeleted = state;
  }
  get getsDeleted(): boolean {
    return this.#getsDeleted;
  }

  get position(): Point {
    return this.#box.position;
  }
  get x(): number {
    return this.#box.x;
  }
  get y(): number {
    return this.#box.y;
  }
  get w(): number {
    return this.#box.w;
  }
  get h(): number {
    return this.#box.h;
  }
}
