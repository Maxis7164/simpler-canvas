import { Point } from "./point.js";
import { SObject } from "./sobject.js";
import { coordsToPoints, drawSvgPath, parseSVGPath } from "./utils.js";

export interface PathExport extends SObjectExport {
  path: string;
  type: "path";
}

export class Path extends SObject {
  static readonly errors = {
    InvalidPointReceived:
      "Invalid Point Received: Received an invalid point from a trusted source.",
  };

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

  static getMidOfQuadratic(
    b: Coords | Point,
    c: Coords | Point,
    e: Coords | Point
  ): Point {
    [b, c, e] = coordsToPoints(b, c, e);

    const bc = b.lerp(c, 0.5);
    const ce = c.lerp(e, 0.5);

    return bc.lerp(ce, 0.5);
  }
  static getExtremesOfCubic(
    sta: Point | Coords,
    ctrl1: Point | Coords,
    ctrl2: Point | Coords,
    end: Point | Coords
  ): Point[] {
    [sta, ctrl1, ctrl2, end] = coordsToPoints(sta, ctrl1, ctrl2, end);

    const ax = 3 * end.x - 9 * ctrl2.x + 9 * ctrl1.x - 3 * sta.x;
    const bx = 6 * ctrl2.x - 12 * ctrl1.x + 6 * sta.x;
    const cx = 3 * ctrl1.x - 3 * sta.x;
    const ay = 3 * end.y - 9 * ctrl2.y + 9 * ctrl1.y - 3 * sta.y;
    const by = 6 * ctrl2.y - 12 * ctrl1.y + 6 * sta.y;
    const cy = 3 * ctrl1.y - 3 * sta.y;

    const xrt = Math.sqrt(bx ** 2 - 4 * ax * cx);
    const yrt = Math.sqrt(by ** 2 - 4 * ay * cy);

    const tx1 = (-bx + xrt) / (2 * ax);
    const tx2 = (-bx - xrt) / (2 * ax);
    const ty1 = (-by + yrt) / (2 * ay);
    const ty2 = (-by - yrt) / (2 * ay);

    const res: Point[] = [
      0 < tx1 && tx1 < 1
        ? Point.getPointOnBezier(sta, ctrl1, ctrl2, end, tx1)
        : Point.INVALID,
      0 < tx2 && tx2 < 1
        ? Point.getPointOnBezier(sta, ctrl1, ctrl2, end, tx2)
        : Point.INVALID,
      0 < ty1 && ty1 < 1
        ? Point.getPointOnBezier(sta, ctrl1, ctrl2, end, ty1)
        : Point.INVALID,
      0 < ty2 && ty2 < 1
        ? Point.getPointOnBezier(sta, ctrl1, ctrl2, end, ty2)
        : Point.INVALID,
    ];

    return res.filter((p) => !p.isInvalid);
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
          const q = Path.getMidOfQuadratic(last, [p[1], p[2]], [p[3], p[4]]);

          if (low[0] > q.x) low[0] = q.x;
          if (low[1] > q.y) low[1] = q.y;
          if (high[0] < q.x) high[0] = q.x;
          if (high[1] < q.y) high[1] = q.y;

          if (low[0] > p[3]) low[0] = p[3]; // p[3] < q.x < low[0] //? last[0] does not matter; if last[0] < (q.x || p[3]) => last[0] === low[0]
          if (low[1] > p[4]) low[1] = p[4];
          if (high[0] < p[3]) high[0] = p[3];
          if (high[1] < p[4]) high[1] = p[4];
          break;
        }
        case "C": {
          const c = Path.getExtremesOfCubic(
            last,
            [p[1], p[2]],
            [p[3], p[4]],
            [p[5], p[6]]
          );

          c.forEach((p) => {
            if (low[0] > p.x) low[0] = p.x;
            if (low[1] > p.y) low[1] = p.y;
            if (high[0] < p.x) high[0] = p.x;
            if (high[1] < p.y) high[1] = p.y;
          });

          if (low[0] > p[3]) low[0] = p[3];
          if (low[1] > p[4]) low[1] = p[4];
          if (high[0] < p[3]) high[0] = p[3];
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
