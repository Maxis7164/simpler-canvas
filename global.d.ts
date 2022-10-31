type Typed<T = any> = { [key: string]: T };
type Boundings = [Point, Point, Point, Point];
type Box = [number, number, number, number];
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
type SVGInstruction = [SVGInstructionType, ...number];
