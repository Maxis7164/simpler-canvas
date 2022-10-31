import { SObject, SObjectOpts } from "./sobject.js";
import { calcPointOnQuadraticCurve, parseSVGPath } from "./utils.js";

// interface PathOpts extends SObjectOpts {}

export class Path extends SObject {
  // static applyOpts(obj: Path, opts: Partial<PathOpts>): void {
  //   if (opts.weight) obj.weight = opts.weight;
  // }

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

    this.setBox([low[0], low[1], high[0] - low[0], high[1] - low[1]]);
  }

  constructor(path: SVGInstruction[] | string, opts?: Partial<SObjectOpts>) {
    super(opts);

    this.#p = typeof path === "string" ? parseSVGPath(path) : path;

    this.#calcOwnBox();
    // if (opts) Path.applyOpts(this, opts);
  }

  render(ctx: CanvasRenderingContext2D): void {
    let last: Coords = [0, 0];

    ctx.save();
    ctx.beginPath();

    ctx.lineWidth = this.weight;
    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.stroke;

    this.#p.forEach((p) => {
      switch (p[0]) {
        case "M":
          ctx.moveTo(p[1], p[2]);
          last = [p[1], p[2]];
          break;
        case "m":
          ctx.moveTo(last[0] + p[1], last[1] + p[2]);
          last = [last[0] + p[1], last[1] + p[2]];
          break;
        case "L":
          ctx.lineTo(p[1], p[2]);
          last = [p[1], p[2]];
          break;
        case "l":
          ctx.lineTo(last[0] + p[1], last[1] + p[2]);
          last = [last[0] + p[1], last[1] + p[2]];
          break;
        case "Q":
          ctx.quadraticCurveTo(p[1], p[2], p[3], p[4]);
          last = [p[3], p[4]];
          break;
        case "q":
          ctx.quadraticCurveTo(
            last[0] + p[1],
            last[1] + p[2],
            last[0] + p[3],
            last[1] + p[4]
          );
          last = [last[0] + p[3], last[1] + p[4]];
          break;
        case "C":
          ctx.bezierCurveTo(p[1], p[2], p[3], p[4], p[5], p[6]);
          last = [p[5], p[6]];
          break;
        case "c":
          ctx.bezierCurveTo(
            last[0] + p[1],
            last[1] + p[2],
            last[0] + p[3],
            last[1] + p[4],
            last[1] + p[5],
            last[1] + p[6]
          );
          last = [last[0] + p[5], last[1] + p[6]];
          break;
      }
    });

    ctx.closePath();

    if (this.stroke) ctx.stroke();
    if (this.fill) ctx.fill();

    ctx.strokeStyle = "#bf4566";
    ctx.strokeRect(...this.box);

    ctx.restore();
  }
}
