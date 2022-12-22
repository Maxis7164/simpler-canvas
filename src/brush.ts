import { SimplerEvent, SimplerEventMap } from "./events.js";
import { Callback, Unsubscribe } from "./events";
import { Canvas } from "./canvas.js";
import { Point } from "./point.js";
import { Path } from "./path.js";

interface BrushOpts {
  lineJoin: CanvasLineJoin;
  straightenAfter: number;
  lineCap: CanvasLineCap;
  miterLimit: number;
  straight: boolean;
  color: string;
  width: number;
}

interface BrushEventMap extends Typed {
  created: { path: Path };
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

  #parent: Canvas;

  #evs: SimplerEventMap<BrushEventMap> = new SimplerEventMap({
    created: new SimplerEvent("created"),
  });

  #str8end: boolean = false;
  #draw: boolean = false;
  #points: Point[] = [];
  #to: number = -1;

  #join: CanvasLineJoin = "miter";
  #straightenAfter: number = 0;
  #cap: CanvasLineCap = "butt";
  #miter: number = 10.0;
  #w: number = 1;

  #createPath(): void {
    if (this.#points.length === 0) return;

    const inst = Brush.smoothenPath(this.#points);

    this.#points = [];
    this.#evs.fire("created", {
      path: new Path(inst, { stroke: this.color, weight: this.#w }),
    });
  }

  #straighten(ctx: CanvasRenderingContext2D): void {
    const [p0, p1] = (this.#points = [
      this.#points[0],
      this.#points[this.#points.length - 1],
    ]);

    ctx.clearRect(0, 0, this.#parent.width, this.#parent.height);
    this.#parent.renderUpper();

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    this.#str8end = this.straight = true;
  }

  #straightDraw(p: Point, ctx: CanvasRenderingContext2D): void {
    if (this.#points.length === 0) {
      this.#points[0] = p;
      return;
    } else this.#points[1] = p;
    this.#parent.renderUpper();

    let [p0, p1] = this.#points;
    const tol: number = 5;
    // const a = p0.x - p1.x;
    // const b = p0.x - p1.x;

    const rot = Brush.#getRotationAngle(p0, p);
    if (Math.abs(rot) < tol + 90 && Math.abs(rot) > -tol + 90)
      p1 = this.#points[1] = new Point([p1.x, p0.y]);
    else if (Math.abs(rot) < tol && Math.abs(rot) > -tol)
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
  #freeDraw(p: Point, ctx: CanvasRenderingContext2D): void {
    if (
      this.#points.length < 1 ||
      !p.contains(this.#points[this.#points.length - 1], 5)
    )
      this.#points.push(p);

    const x = Brush.smoothenPath([...this.#points]);

    ctx.beginPath();
    Path.drawSvgPath(ctx, x, [0, 0]);
    ctx.stroke();

    if (this.#straightenAfter > 0)
      this.#to = setTimeout(() => this.#straighten(ctx), this.#straightenAfter);
  }

  constructor(cv: Canvas, opts?: Partial<BrushOpts>) {
    this.#parent = cv;

    if (opts) this.applyOpts(opts);
  }

  straight: boolean = false;
  color: string = "#000000";

  onUpDown(e: PointerEvent, ctx: CanvasRenderingContext2D): void {
    this.#draw = e.type === "pointerdown";

    if (this.#draw) {
      this.#points = [];

      ctx.save();
      ctx.beginPath();
    } else {
      clearTimeout(this.#to);
      this.#to = -1;

      if (this.#str8end) this.#str8end = this.straight = false;

      this.#parent.renderUpper();
      ctx.restore();
      this.#parent.renderUpper();
      this.#createPath();
    }
  }
  onMove(e: PointerEvent, ctx: CanvasRenderingContext2D): void {
    clearTimeout(this.#to);
    this.#to = -1;

    if (this.#draw) {
      const p = this.#parent.getCoords([e.x, e.y]);
      ctx.strokeStyle = this.color;

      ctx.miterLimit = this.#miter;
      ctx.lineJoin = this.#join;

      ctx.lineWidth = this.#w;
      ctx.lineCap = this.#cap;

      if (this.straight) this.#straightDraw(p, ctx);
      else this.#freeDraw(p, ctx);
    }
  }

  applyOpts(opts: Partial<BrushOpts>): void {
    if (opts.straightenAfter) this.#straightenAfter = opts.straightenAfter;
    if (opts.miterLimit) this.#miter = opts.miterLimit;
    if (opts.straight) this.straight = opts.straight;
    if (opts.lineJoin) this.#join = opts.lineJoin;
    if (opts.lineCap) this.#cap = opts.lineCap;
    if (opts.color) this.color = opts.color;
    if (opts.width) this.#w = opts.width;
  }

  on<K extends keyof BrushEventMap>(
    eventName: K,
    cb: Callback<BrushEventMap[K]>
  ): Unsubscribe {
    return this.#evs.on(eventName, cb);
  }

  set width(w: number) {
    this.#w = w > 0 ? w : this.#w;
  }
  get width(): number {
    return this.#w;
  }

  set lineCap(l: CanvasLineCap) {
    this.#cap = l;
  }
  get lineCap(): CanvasLineCap {
    return this.#cap;
  }

  set lineJoin(j: CanvasLineJoin) {
    this.#join = j;
  }
  get lineJoin(): CanvasLineJoin {
    return this.#join;
  }

  set miterLimit(lim: number) {
    this.#miter = lim;
  }
  get miterLimit(): number {
    return this.#miter;
  }

  set straightenAfter(n: number) {
    this.#straightenAfter = n;
  }
  get straightenAfter(): number {
    return this.#straightenAfter;
  }
}
