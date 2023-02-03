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

## `Unsubscribe`

The unsubscribe type indicates a function, which is used to unsubscribe from an event listener.

```ts
type Unsubscribe = () => void;
```

## `CanvasExport`

```ts
interface CanvasExport {
  background: string;
  objects: Typed[];
  overlay: string;
  version: string;
  height: number;
  width: number;
}
```

## `SObjectExport`

```ts
interface {
  
}
```
