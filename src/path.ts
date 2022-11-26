import { SObject } from "./sobject.js";
import {
  calcPointOnQuadraticCurve,
  drawSvgPath,
  parseSVGPath,
} from "./utils.js";

// interface PathOpts extends SObjectOpts {}

export interface PathExport extends SObjectExport {
  path: string;
  type: "path";
}

export class Path extends SObject {
  // static applyOpts(obj: Path, opts: Partial<PathOpts>): void {
  //   if (opts.weight) obj.weight = opts.weight;
  // }

  static hydrate(obj: PathExport): Path {
    const p = new Path(obj.path, {
      fill: obj.fill,
      selectable: obj.selectable,
      stroke: obj.stroke,
      weight: obj.weight,
    });

    p.setPosition([obj.x, obj.y]);

    return p;
  }

  #p: SVGInstruction[];

  #calcOwnBox(): void {
    let low: Coords = [this.#p[0][1], this.#p[0][2]];
    let high: Coords = [this.#p[0][1], this.#p[0][2]];
    let last: Coords = [0, 0];

    this.#p.forEach((p) => {
      switch (p[0]) {
        case "M":
        case "L":
          if (low[0] > p[1]) low[0] = p[1];
          if (low[1] > p[2]) low[1] = p[2];
          if (high[0] < p[1]) high[0] = p[1];
          if (high[1] < p[2]) high[1] = p[2];
          last = [p[1], p[2]];
          break;
        case "Q": {
          const q = calcPointOnQuadraticCurve(last, [p[1], p[2]], [p[3], p[4]]);
          if (low[0] > q.x) low[0] = q.x;
          if (low[0] > p[3]) low[0] = p[3]; // p[3] < q.x < low[0] //? last[0] does not matter; if last[0] < (q.x || p[3]) => last[0] === low[0]
          if (low[1] > q.y) low[1] = q.y;
          if (low[1] > p[4]) low[1] = p[4];

          if (high[0] < q.x) high[0] = q.x;
          if (high[0] < p[3]) high[0] = p[3];
          if (high[1] < q.y) high[1] = q.y;
          if (high[1] < p[4]) high[1] = p[4];
          break;
        }
      }
    });

    const box: Box = [low[0], low[1], high[0] - low[0], high[1] - low[1]];

    this.#p = this.#p.map((inst) =>
      inst.map((part, i) =>
        typeof part === "string" ? part : i % 2 ? part - box[0] : part - box[1]
      )
    ) as SVGInstruction[];

    this.setBox(box);
  }

  constructor(path: SVGInstruction[] | string, opts?: Partial<SObjectOpts>) {
    super(opts);

    this.#p = typeof path === "string" ? parseSVGPath(path) : path;

    this.#calcOwnBox();
    // if (opts) Path.applyOpts(this, opts);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();

    ctx.transform(...this.matrix);

    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.weight;
    ctx.fillStyle = this.fill;

    drawSvgPath(ctx, this.#p, this.coords);

    if (this.stroke) ctx.stroke();
    if (this.fill) ctx.fill();

    // ctx.strokeStyle = "#bf4566";
    // ctx.strokeRect(...this.box);

    ctx.restore();
  }

  toObject(): PathExport {
    return {
      ...SObject.toObject(this),
      path: this.#p.map((p) => p.join(" ")).join(" "),
      type: "path",
    };
  }

  get path(): SVGInstruction[] {
    return this.#p;
  }
}
