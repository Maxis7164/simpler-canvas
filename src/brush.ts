import { SimplerEvent, SimplerEventMap } from "./events.js";
import { Callback, Unsubscribe } from "./events";
import type { CanvasBrushEvent } from "./canvas";
import { Point } from "./point.js";
import { Path } from "./path.js";

interface BrushOpts {
  lineJoin: CanvasLineJoin;
  straightenAfter: number;
  angleTolerance: number;
  lineCap: CanvasLineCap;
  miterLimit: number;
  straight: boolean;
  color: string;
  width: number;
}

interface BrushMoveEvent {
  points: Point[];
  pointer: Point;
}
interface BrushEventMap extends Typed {
  created: { path: Path };
  "before:move": BrushMoveEvent;
  move: BrushMoveEvent;
}

export class Brush {
  static #getRotationAngle(p0: Point, p1: Point): number {
    const a = p1.x - p0.x;
    const b = p1.y - p0.y;

    const angle = Math.atan(a / b);

    return Math.round((((angle * 180) / Math.PI) * 1000) / 1000);
  }

  static smoothenPath(p: Point[], corr: number = 0): SVGInstruction[] {
    if (p.length < 2) return [];

    const path: SVGInstruction[] = [];
    const many: boolean = p.length > 2;

    let i: number;
    let p1 = p[0].clone();
    let p2 = p[1].clone();
    let multX: number = 1;
    let multY: number = 0;

    if (many) {
      multX = p[2].x < p2.x ? -1 : p[2].x === p2.x ? 0 : 1;
      multY = p[2].y < p2.y ? -1 : p[2].y === p2.y ? 0 : 1;
    }

    path.push(["M", p1.x - multX * corr, p1.y - multY * corr]);

    for (i = 1; i < p.length; i++) {
      if (!p1.eq(p2)) {
        const mid = p1.lerp(p2, 0.5);
        path.push(["Q", ...p1.coords, ...mid.coords]);
      }

      p1 = p[i];
      if (i + 1 < p.length) p2 = p[i + 1];
    }

    if (many) {
      multX = p1.x > p[i - 2].x ? 1 : p1.x === p[i - 2].x ? 0 : -1;
      multY = p1.y > p[i - 2].y ? 1 : p1.y === p[i - 2].y ? 0 : -1;
    }

    path.push(["L", p1.x + multX * corr, p1.y + multY * corr]);
    path.push(path[0]);

    return path;
  }

  #evs: SimplerEventMap<BrushEventMap> = new SimplerEventMap({
    created: new SimplerEvent("created"),
    "before:move": new SimplerEvent("before:move"),
    move: new SimplerEvent("move"),
  });

  #straight: boolean = false;
  #points: Point[] = [];
  #to: number = -1;

  #createPath(): Path | void {
    if (this.#points.length === 0) return;

    const inst = Brush.smoothenPath(this.#points);
    const path = new Path(inst, { stroke: this.color, weight: this.width });

    this.#points = [];
    this.#evs.fire("created", { path });

    if (this.straightenAfter > 0) this.#straight = false;
    if (this.#to > -1) {
      clearTimeout(this.#to);
      this.#to = -1;
    }

    return path;
  }

  #straighten({ ctx, render }: CanvasBrushEvent): void {
    this.#straight = true;

    if (this.#points.length < 2) return;

    const [p0, p1] = (this.#points = [
      this.#points[0],
      this.#points[this.#points.length - 1],
    ]);

    render();

    ctx.beginPath();
    p0.moveTo(ctx);
    p1.lineTo(ctx);
    ctx.stroke();
  }

  #straightDraw({ ctx, pointer, render }: CanvasBrushEvent): void {
    if (this.#points.length === 0) {
      this.#points[0] = pointer;
      return;
    } else this.#points[1] = pointer;
    render();

    let [p0, p1] = this.#points;
    // const a = p0.x - p1.x;
    // const b = p0.x - p1.x;

    const rot = Brush.#getRotationAngle(p0, pointer);
    if (
      Math.abs(rot) < this.angleTolerance + 90 &&
      Math.abs(rot) > -this.angleTolerance + 90
    )
      p1 = this.#points[1] = new Point([p1.x, p0.y]);
    else if (
      Math.abs(rot) < this.angleTolerance &&
      Math.abs(rot) > -this.angleTolerance
    )
      p1 = this.#points[1] = new Point([p0.x, p1.y]);
    // else if (rot < tol + 45 && rot > -tol + 45)
    //   p1 = this.#points[1] = new Point([
    //     p0.x + -a * 0.7071067811865, //? Math.cos(Math.PI / 4)
    //     p0.y + -b * 0.7071067811865, //? Math.sin(Math.PI / 4)
    //   ]);
    // else if (rot < tol - 45 && rot > -tol - 45)
    //   p1 = this.#points[1] = new Point([
    //     p0.x - a * 0.7071067811865,
    //     p0.y + b * 0.7071067811865,
    //   ]);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  #freeDraw(e: CanvasBrushEvent): void {
    if (
      this.#points.length < 1 ||
      !e.pointer.contains(this.#points[this.#points.length - 1], 5)
    )
      this.#points.push(e.pointer);

    const x = Brush.smoothenPath([...this.#points]);

    e.ctx.beginPath();
    Path.drawSvgPath(e.ctx, x, [0, 0]);
    e.ctx.stroke();

    if (this.straightenAfter > 0)
      this.#to = setTimeout(() => this.#straighten(e), this.straightenAfter);
  }

  constructor(opts?: Partial<BrushOpts>) {
    if (opts) this.applyOpts(opts);
  }

  //? angle tolerance for snapping straight line feature; !(>= 45)
  angleTolerance: number = 5;

  lineJoin: CanvasLineJoin = "miter";
  lineCap: CanvasLineCap = "butt";
  straightenAfter: number = 0;
  color: string = "#000000";
  miter: number = 10.0;
  width: number = 1;

  move(e: CanvasBrushEvent): void {
    clearTimeout(this.#to);

    e.ctx.strokeStyle = this.color;
    e.ctx.lineJoin = this.lineJoin;
    e.ctx.miterLimit = this.miter;
    e.ctx.lineWidth = this.width;
    e.ctx.lineCap = this.lineCap;

    this.#evs.fire("before:move", {
      pointer: e.pointer,
      points: [...this.#points],
    });

    if (this.straight) this.#straightDraw(e);
    else this.#freeDraw(e);

    this.#evs.fire("move", {
      pointer: e.pointer,
      points: [...this.#points],
    });
  }

  finishPath(): Path | void {
    return this.#createPath();
  }

  applyOpts(opts: Partial<BrushOpts>): void {
    if (opts.straightenAfter) this.straightenAfter = opts.straightenAfter;
    if (opts.angleTolerance) this.angleTolerance = opts.angleTolerance;
    if (opts.miterLimit) this.miter = opts.miterLimit;
    if (opts.straight) this.#straight = opts.straight;
    if (opts.lineJoin) this.lineJoin = opts.lineJoin;
    if (opts.lineCap) this.lineCap = opts.lineCap;
    if (opts.color) this.color = opts.color;
    if (opts.width) this.width = opts.width;
  }

  on<K extends keyof BrushEventMap>(
    eventName: K,
    cb: Callback<BrushEventMap[K]>
  ): Unsubscribe {
    return this.#evs.on(eventName, cb);
  }

  get straight(): boolean {
    return this.#straight;
  }
}
