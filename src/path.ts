import { Box } from "./box.js";
import type { Canvas } from "./canvas.js";
import { Matrix } from "./matrix.js";
import { Point } from "./point.js";
import { SObject } from "./sobject.js";

export interface PathExport extends PathOpts {
  path: string;
  type: "path";
  x: number;
  y: number;
}

interface PathOpts {
  selectable: boolean;
  stroke: string;
  weight: number;
  fill: string;
}

export class Path extends SObject<PathExport> {
  static readonly errors = {
    InvalidPointReceived:
      "Invalid Point Received: Received an invalid point from a trusted source.",
  };
  static readonly buttons: Typed<number> = {
    rotate: 0,
  };

  static rect(
    coords: Point | Coords,
    w: number,
    h: number,
    opts?: Partial<PathOpts>
  ): Path {
    const [p] = Point.convert(false, coords);

    return new Path(
      `M ${p[0]} ${p[1]} L ${p[0] + w} ${p[1]} L ${p[0] + w} ${p[1] + h} L ${
        p[0]
      } ${p[1] + h} z`,
      opts
    );
  }

  static #getMidOfQuadratic(
    b: Coords | Point,
    c: Coords | Point,
    e: Coords | Point
  ): Point {
    [b, c, e] = Point.convert(true, b, c, e);

    const bc = b.lerp(c, 0.5);
    const ce = c.lerp(e, 0.5);

    return bc.lerp(ce, 0.5);
  }
  static #getExtremesOfCubic(
    sta: Point | Coords,
    ctrl1: Point | Coords,
    ctrl2: Point | Coords,
    end: Point | Coords
  ): Point[] {
    [sta, ctrl1, ctrl2, end] = Point.convert(true, sta, ctrl1, ctrl2, end);

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
        ? Point.getPointOnCubic(sta, ctrl1, ctrl2, end, tx1)
        : Point.INVALID,
      0 < tx2 && tx2 < 1
        ? Point.getPointOnCubic(sta, ctrl1, ctrl2, end, tx2)
        : Point.INVALID,
      0 < ty1 && ty1 < 1
        ? Point.getPointOnCubic(sta, ctrl1, ctrl2, end, ty1)
        : Point.INVALID,
      0 < ty2 && ty2 < 1
        ? Point.getPointOnCubic(sta, ctrl1, ctrl2, end, ty2)
        : Point.INVALID,
    ];

    return res.filter((p) => !p.isInvalid);
  }

  static #parseSVGPath(path: string): SVGInstruction[] {
    const p = path.split(" ");
    const np: SVGInstruction[] = [];
    let nxt: SVGInstruction = [p[0] as SVGInstructionType];

    for (let i: number = 1; i < p.length; i++) {
      const numi = parseInt(p[i]);

      if (isNaN(numi)) {
        np.push(nxt);
        nxt = [p[i] as SVGInstructionType];
      } else nxt.push(numi);
    }

    np.push(nxt);
    return np;
  }

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

  static drawSvgPath(
    ctx: CanvasRenderingContext2D,
    svg: SVGInstruction[],
    c: Coords | Point
  ): void {
    const a = c instanceof Point ? c : new Point(c);

    let last: Coords = [0, 0];

    ctx.beginPath();

    svg.forEach((p) => {
      const np: number[] = p
        .filter((a) => typeof a === "number")
        .map((coord, i) =>
          i % 2 === 0 ? (coord as number) + a.x : (coord as number) + a.y
        );

      switch (p[0]) {
        case "M":
          ctx.moveTo(np[0], np[1]);
          last = [np[0], np[1]];
          break;
        case "m":
          ctx.moveTo(last[0] + np[0], last[1] + np[1]);
          last = [last[0] + np[0], last[1] + np[1]];
          break;
        case "L":
          ctx.lineTo(np[0], np[1]);
          last = [np[0], np[1]];
          break;
        case "l":
          ctx.lineTo(last[0] + np[0], last[1] + np[1]);
          last = [last[0] + np[0], last[1] + np[1]];
          break;
        case "Q":
          ctx.quadraticCurveTo(np[0], np[1], np[2], np[3]);
          last = [np[2], np[3]];
          break;
        case "q":
          ctx.quadraticCurveTo(
            last[0] + np[0],
            last[1] + np[1],
            last[0] + np[2],
            last[1] + np[3]
          );
          last = [last[0] + np[2], last[1] + np[3]];
          break;
        case "C":
          ctx.bezierCurveTo(np[0], np[1], np[2], np[3], np[4], np[5]);
          last = [np[5], np[6]];
          break;
        case "c":
          ctx.bezierCurveTo(
            last[0] + np[0],
            last[1] + np[1],
            last[0] + np[2],
            last[1] + np[3],
            last[1] + np[4],
            last[1] + np[5]
          );
          last = [last[0] + np[4], last[1] + np[5]];
          break;
      }
    });

    ctx.closePath();
  }

  #p: SVGInstruction[];

  #selected: boolean = false;

  #m: Matrix = Matrix.getIdentity(3);
  #mi: Matrix = this.#m.invert();
  #angle: number = 0;
  #x: number = -1;
  #y: number = -1;
  #w: number = -1;
  #h: number = -1;

  #scaleX: number = 1;
  #scaleY: number = 1;

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

  #calcOwnBox(): Box {
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
          const q = Path.#getMidOfQuadratic(last, [p[1], p[2]], [p[3], p[4]]);

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
          const c = Path.#getExtremesOfCubic(
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

    const box: Box = new Box(
      low[0],
      low[1],
      high[0] - low[0],
      high[1] - low[1]
    );

    this.#p = this.#p.map((inst) =>
      inst.map((part, i) =>
        typeof part === "string"
          ? part
          : i % 2
          ? part - box.position.x
          : part - box.position.y
      )
    ) as SVGInstruction[];

    return box;
  }

  constructor(path: SVGInstruction[] | string, opts?: Partial<PathOpts>) {
    super([0, 0], [0, 0]);

    this.#p = typeof path === "string" ? Path.#parseSVGPath(path) : path;

    this.setBox(this.#calcOwnBox());

    if (opts) this.applyOpts(opts);
  }

  selectable: boolean = true;
  stroke: string = "#000000";
  weight: number = 1;
  fill: string = "";

  applyOpts(opts: Partial<PathOpts>): void {
    if (opts.selectable) this.selectable = opts.selectable;
    if (opts.stroke) this.stroke = opts.stroke;
    if (opts.weight) this.weight = opts.weight;
    if (opts.fill) this.fill = opts.fill;
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
  rotate(phi: number): void {
    const r = phi - this.#angle; //? get actual angle
    this.#angle = phi;

    this.#m = this.#m.rotate(r);
    this.#mi = this.#m.invert();
  }

  // contains(p: Point | Coords): boolean {
  //   [p] = Point.convert(true, p);

  //   p = this.#applyInverseOnPoint(p.coords);
  //   const t = this.#applyInverseOnPoint([this.#x, this.#y]);

  //   return (
  //     p.gt([t.x - 0.5 * this.weight, t.y - 0.5 * this.weight]) &&
  //     p.lt([t.x + this.#w + this.weight, t.y + this.#h + this.weight])
  //   );
  // }
  // containedIn(box: Box): boolean {
  //   return (
  //     this.#x - 0.5 * this.weight > box.x &&
  //     this.#x + this.#w + this.weight < box.x + box.w &&
  //     this.#y + 0.5 * this.weight > box.y &&
  //     this.#y + this.#h + this.weight < box.y + box.h
  //   );
  // }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();

    ctx.transform(...this.#m.toCtxInterp());

    if (this.getsDeleted) ctx.globalAlpha = 0.4;

    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.weight;
    ctx.fillStyle = this.fill;

    const p = this.#applyInverseOnPoint(this.position);
    Path.drawSvgPath(ctx, this.#p, p.coords);

    if (this.stroke) ctx.stroke();
    if (this.fill) ctx.fill();

    //?: debug
    // ctx.strokeStyle = "#bf4566"; //? size used as point to easily apply matrix inverse
    // ctx.strokeRect(p.x, p.y, this.#w, this.#h);

    ctx.restore();
  }

  toObject(): PathExport {
    return {
      path: this.#p.map((p) => p.join(" ")).join(" "),
      selectable: this.selectable,
      stroke: this.stroke,
      weight: this.weight,
      fill: this.fill,
      x: this.#x,
      y: this.#y,
      type: "path",
    };
  }

  get path(): SVGInstruction[] {
    return this.#p;
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
  get buttons(): Coords[] {
    return [[this.#x + this.#w / 2, this.#y - 10]];
  }

  //! probably get abandoned or changed...
  get box(): Box {
    return new Box(
      this.#x - 0.5 * this.weight,
      this.#y - 0.5 * this.weight,
      this.#w + this.weight,
      this.#h + this.weight
    );
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
