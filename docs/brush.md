# Brush - 0.4.0-alpha

```ts
class Brush {
  static smoothenPath(p: Point[], corr: number = 0): SVGInstruction[];

  join: CanvasLineJoin = "miter";
  cap: CanvasLineCap = "butt";
  color: string = "#000000";
  miter: number = 10.0;
  width: number = 1;

  constructor(cv: Canvas, opts?: Partial<BrushOpts>);

  applyOpts(opts: Partial<BrushOpts>): void;

  on<K extends keyof BrushEventMap>(
    eventName: K,
    callback: Callback<BrushEventMap[K]>
  ): Unsubscribe;

  onUpDown(e: PointerEvent): void;
  onMove(e: PointerEvent): void;
}

interface BrushEventMap extends Typed {
  created: { type: "created"; path: Path };
}
```

## **Properties**

### color

The color of the brush.

### join

The mode that describes how individual lines should be joined together. Can be either 'bevel', 'round' or 'miter'.

### cap

Describes the ends of individual lines. Can be either 'round', 'butt' or 'square'.

### miterLimit

Determines how far the outside connection point can be placed from the inside connection point of a line _(See [here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit) or [here](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_demo_of_the_miterlimit_property))_.

### width

Determines the width of the path. The width has to be greater than 0.

## **Constructor**

### cv

The canvas the brush will draw on.

### opts

Any optional settings for the brush.

## **Methods**

### applyOpts

Applies `BrushOpts` to the instance.

### on

Listen to a specific event on `BrushEventMap`.

### onUpDown

A native event handler for `PointerUpEvent` and `PointerDownEvent`.

This function is reserved for `Canvas`.

### onMove

A native event handler for `PointerMoveEvent`.

This function is reserved for `Canvas`.
