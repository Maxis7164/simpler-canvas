import { Point } from "./point.js";

export function coordsToPoints(...coords: (Coords | Point)[]): Point[] {
  return coords.map((p) => (p instanceof Point ? p : new Point(p)));
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

  console.log(np);

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
