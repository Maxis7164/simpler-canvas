import { Path } from "./path.js";
import { Point } from "./point.js";

export function coordsToPoints(...coords: (Coords | Point)[]): Point[] {
  return coords.map((p) => {
    if (typeof p === "undefined")
      throw new Error(
        '[!] <Simpler Canvas> Invalid Coordinates: "undefined" is not a valid coordinate array or Point!'
      );

    return p instanceof Point ? p : new Point(p);
  });
}

export function parseSVGPath(path: string): SVGInstruction[] {
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

export function calcPointOnQuadraticCurve(
  b: Coords | Point,
  c: Coords | Point,
  e: Coords | Point
): Point {
  [b, c, e] = coordsToPoints(b, c, e);

  const bc = b.lerp(c, 0.5);
  const ec = e.lerp(c, 0.5);

  return bc.lerp(ec, 0.5);
}

export function smoothenPath(p: Point[], corr: number = 0): SVGInstruction[] {
  if (p.length < 2) return [];

  const path: SVGInstruction[] = [];
  const many: boolean = p.length > 2;

  let i: number;
  let p1 = new Point(p[0].coords);
  let p2 = new Point(p[1].coords);
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

export function drawSvgPath(
  ctx: CanvasRenderingContext2D,
  svg: SVGInstruction[]
): void {
  let last: Coords = [0, 0];

  ctx.beginPath();

  svg.forEach((p) => {
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
}
