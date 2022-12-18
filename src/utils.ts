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

export function smoothenPath(p: Point[], corr: number = 0): SVGInstruction[] {
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

export function drawSvgPath(
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

export function formatError(str: string, param: Typed = {}): string {
  return str.replace(/{{\s*(\w*)\s*}}/g, (_, key) => {
    return param[key] ?? key;
  });
}
