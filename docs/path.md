# Path - 0.1.0-alpha

```ts
class Path {
  constructor(path?: SVGInstruction[]);

  addRawPoint(p: Point | Coords): void;
  closePath(): void;

  render(ctx: CanvasRenderingContext2D): void;
}
```

## Constructor

### `path`

An SVG path describing the path.

## Methods

### `addRawPoint`

Adds a given `Point` to the path.

This method only works, if the path is not already closed and was not constructed using an SVG path.

### `closePath`

Closes the path and converts its raw points into `SVGInstructions`.

This method only works, if the path is not already closed and was not constructed using an SVG path.

### `render`

Renders the path to the given `CanvasRenderingContext2D`.

This method is reserved for `SObject`.
