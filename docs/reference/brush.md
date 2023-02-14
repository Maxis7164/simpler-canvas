# Brush - 0.4.0-alpha

```ts
class Brush {
  static smoothenPath(p: Point[], corr: number = 0): SVGInstruction[];

  angleTolerance: number;

  lineJoin: CanvasLineJoin = "miter";
  lineCap: CanvasLineCap = "butt";
  straightenAfter: number = 0;
  straight: boolean = false;
  color: string = "#000000";
  miter: number = 10.0;
  width: number = 1;

  constructor(opts?: Partial<BrushOpts>);

  applyOpts(opts: Partial<BrushOpts>): void;

  move(e: CanvasBrushEvent): void;
  finishPath(): void;

  on<K extends keyof BrushEventMap>(
    eventName: K,
    callback: Callback<BrushEventMap[K]>
  ): Unsubscribe;
}

interface BrushOpts {
  lineJoin: CanvasLineJoin;
  straightenAfter: number;
  angleTolerance: number;
  lineCap: CanvasLineCap;
  miterLimit: number;
  straight: boolean;
  color: string;
  width: number;
}

interface BrushEventMap extends Typed {
  created: { type: "created"; path: Path };
  "before:move": { type: "before:moved"; points: Point[]; pointer: Point };
  move: { type: "before:moved"; points: Point[]; pointer: Point };
}
```

## **Properties**

### angleTolerance

Tolerance value for snapping a straight line at about 90° or 0°. The tolerance describes how far the actual angle can vary from 90° or 0° to still snap onto them.

> **Note**: This value needs to be positive and should not be greater than or equal to 45!

### color

The color of the brush.

### lineJoin

The mode that describes how individual lines should be joined together. Can be either 'bevel', 'round' or 'miter'.

### lineCap

Describes the ends of individual lines. Can be either 'round', 'butt' or 'square'.

### miter

Determines how far the outside connection point can be placed from the inside connection point of a line _(See [here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit) or [here](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_demo_of_the_miterlimit_property))_.

### width

Determines the width of the path. The width has to be greater than 0.

### straight

Determines if the brush draws lines or points.

### straightenAfter

If greater than zero and if `straight = false`, it will straighten the points array by removing every point other than the first or last. This will happen after an amount of milliseconds, which is speficied by the value of `straightenAfter`. If straighten, the brush cannot be converted to point mode until the line has been drawn.

## **Constructor**

### opts

Any optional settings for the brush.

## **Methods**

### applyOpts

Applies `BrushOpts` to the instance. This can be perfectly used, if many options have to be changed at once.

### on

Listen to a specific event on `BrushEventMap`. This is a passthrough of the `SimplerEventMap` instance of the `Brush` instance.

### move

Handles incoming moves provided by a `Canvas` parent, although any arbitrary input fulfilling the constrains of interface `CanvasBrushEvent` will work as well.

This function is reserved for `Canvas`.
