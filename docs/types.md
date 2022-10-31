# Types

## `Typed` - 0.1.0-alpha

```ts
type Typed<T = any> = { [key: string]: T };
```

## `Coords`

```ts
type Coords = [number, number];
```

## `Box`

```ts
type Box = [Point, Point, Point, Point];
```

## `SVGInstructionType`

```ts
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
```

## `SVGInstruction`

```ts
type SVGInstruction = [SVGInstructionType, ...number];
```
