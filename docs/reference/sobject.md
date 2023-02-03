# SObject - 0.4.0-alpha

```ts
class SObject {
  static applyOpts(obj: SObject, opts: Partial<SObjectOpts>): void;
  static getOpts(obj: SObject): SObjectOpts;

  static toObject(obj: SObject): SObjectExport;

  selectable: boolean = true;
  stroke: string = "#000000";
  weight: number = 1;
  fill: string = "";

  get boundings(): Boundings;
  get selected(): boolean;
  get matrix(): Matrix;
  get coords(): Point;
  get box(): Box;

  constructor(opts?: Partial<SObjectOpts>);

  setBox(b: Box): void;

  move(dx: number, dy: number): void;
  setPosition(p: Coords | Point): void;

  scale(v?: number, h?: number): void;

  setSelected(isSelected?: boolean): void;

  contains(p: Point | Coords): boolean;
  containedIn(box: Box): boolean;

  render(ctx: CanvasRenderingContext2D): void;
  renderBox(ctx: CanvasRenderingContext2D): void;

  remove(from: Canvas): void;

  toObject(): SObjectExport;
}
```

## **Properties**

### selectable

Determines if the object can be selected. Defaults to `true`.

### stroke

The color of the object's border. Any CSS color value can be used as an input. Defaults to `#000000` (hex black).

### weight

The width of the stroke of the object. Defaults to `1`.

### fill

The color of the object's inside. Any CSS color value can be used as an input. Defaults to _`<empty string>`_

### _get_ boundings

The bounding box of the object.

### _get_ selected

The current selected state of the object.

### _get_ matrix

The transformation matrix of the object.

### _get_ coords

The coordinates of the object on the canvas.

### _get_ box

The `Box` of the object.

## **Constructor**

### opts

The `SObjectOpts` that should be applied to the object.

## **Methods**

### _static_ applyOpts

Applies the given `SObjectOpts` to the given `SObject`.

This function is a helper function for all classes extending `SObject`.

### _static_ getOpts

Returns the `SObjectOpts` applied to the given `SObject`.

### _static_ toObject

Converts the given `SObject` to an exportable `SObjectExport`

### setBox

Sets its coordinates as well as its width and height to the `Box`.

### move

Moves the object relative of the current coordinates to the new location by dx and dy.

### setPosition

Moves the object to the specified canvas coordinates.

### scale

Scales the object on either vertical, horizontal or both axies. To just change the value of one, use a value `<= 0`.

### setSelected

Sets the selected state of the object.

### contains

Checks if the given point is inside the object.

### containedIn

Checks if the object lies inside the given box.

### render

A dummy function to make the `render` function not specific to `SObject`'s children.

### renderBox

Renders the bounding box of the object to the given `HTMLCanvasElement`.

### remove

Removes the object from the given `Canvas`.

### toObject

Converts the instance to an exportable `SObjectExport`.
