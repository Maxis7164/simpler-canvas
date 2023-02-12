import { SObject } from "./sobject";
import { Point } from "./point";

interface SImageExport {
  type: "image";
  x: number;
  y: number;
}

export class SImage extends SObject<SImageExport> {
  constructor(pos: Point | Coords) {
    super(pos, [0, 0]);
  }

  render(ctx: CanvasRenderingContext2D): void {}

  toObject(): SImageExport {
    return {
      x: this.position.x,
      y: this.position.y,
      type: "image",
    };
  }
}
