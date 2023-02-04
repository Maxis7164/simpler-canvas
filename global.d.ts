type Typed<T = any> = { [key: string]: T };
type Boundings = [Point, Point, Point, Point];
type Box = [number, number, number, number];

/** @description Coordinates to a Point inside a canvas */
type Coords = [number, number];

type SVGInstructionType =
  | "M"
  | "m"
  | "L"
  | "l"
  | "Q"
  | "q"
  | "T"
  | "t"
  | "C"
  | "c"
  | "S"
  | "s";
type SVGInstruction = [SVGInstructionType, ...number[]];

interface CanvasExport {
  objects: SObjectExport[];
  background: string;
  overlay: string;
  version: string;
  height: number;
  width: number;
}

type Matrix2x3 = [number, number, number, number, number, number];
type Dimension = [number, number];

declare module "./src/matrix-inverse" {
  export = function fn(m: number[][]): number[][] {};
}
