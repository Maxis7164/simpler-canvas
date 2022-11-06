import { SimplerEvent, SimplerEventMap } from "./events.js";
import { drawSvgPath, smoothenPath } from "./utils.js";
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

    const inst = smoothenPath(this.#points);

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

      ctx.beginPath();
      drawSvgPath(ctx, smoothenPath([...this.#points]));
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
