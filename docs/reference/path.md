# Path - 0.4.0-alpha

```ts
class Path extends SObject {
  static hydrate(obj: PathExport): Path;

  static drawSvgPath(
    ctx: CanvasRenderingContext,
    svg: SVGInstruction[],
    c: Coords | Point
  ): void;

  get path(): SVGInstruction[];

  constructor(path: SVGInstruction[] | string, opts?: Partial<SObjectOpts>);

  render(ctx: CanvasRenderingContext2D): void;

  toObject(): PathExport;
}
```

## **Properties**

### _get_ path

Returns the SVG instruction array of the path.

## **Constructor**

### path

An SVG path describing the path.

## **Methods**

### render

Renders the path to the given `CanvasRenderingContext2D`.

This method is reserved for `SObject`.

### toObject

Converts the `Path` to an exportable object.

This method is used by `Canvas`.
