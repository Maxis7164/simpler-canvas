import { SimplerEvent, SimplerEventMap } from "./events.js";
import { Callback, Unsubscribe } from "./events";
import { Canvas } from "./canvas.js";
import { Point } from "./point.js";
import { Path } from "./path.js";

interface BrushOpts {
  lineJoin: CanvasLineJoin;
  lineCap: CanvasLineCap;
  miterLimit: number;
  color: string;
  width: number;
}

interface BrushEventMap extends Typed {
  created: { path: Path };
}

export class Brush {
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

  #draw: boolean = false;
  #points: Point[] = [];

  #join: CanvasLineJoin = "miter";
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

  constructor(cv: Canvas, opts?: Partial<BrushOpts>) {
    this.#parent = cv;

    if (opts) this.applyOpts(opts);
  }

  color: string = "#000000";

  onUpDown(e: PointerEvent, ctx: CanvasRenderingContext2D): void {
    this.#draw = e.type === "pointerdown";

    if (this.#draw) {
      this.#points = [];

      ctx.save();
      ctx.beginPath();
    } else {
      this.#parent.renderUpper();
      ctx.restore();
      this.#parent.renderUpper();
      this.#createPath();
    }
  }
  onMove(e: PointerEvent, ctx: CanvasRenderingContext2D): void {
    if (this.#draw) {
      const p = this.#parent.getCoords([e.x, e.y]);
      ctx.strokeStyle = this.color;

      ctx.miterLimit = this.#miter;
      ctx.lineJoin = this.#join;

      ctx.lineWidth = this.#w;
      ctx.lineCap = this.#cap;

      if (
        this.#points.length < 1 ||
        !p.contains(this.#points[this.#points.length - 1], 5)
      )
        this.#points.push(p);

      const x = Brush.smoothenPath([...this.#points]);

      ctx.beginPath();
      Path.drawSvgPath(ctx, x, [0, 0]);
      ctx.stroke();
    }
  }

  applyOpts(opts: Partial<BrushOpts>): void {
    if (opts.miterLimit) this.#miter = opts.miterLimit;
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
}
