# Selection - 0.5.0a

`Selection` initiates an selection field on the canvas to which it gets attached. When finalized, it will be the size of all contained `SObjects`. If no objects are inside the selection box, the selection will get closed on the attached `Canvas`.

```typescript
class Selection {
  static color: string = "#22ffbb";

  get members(): SObject[];

  get box(): Box | null;

  get isFinalized(): boolean;

  constructor(s: Point | Coords, e?: Point | Coords);

  finalize(...memb: SObject[]): void;
  setEnd(e: Point | Coords): void;

  move(dx: number, dy: number): void;

  isMember(obj: SObject): boolean;
  contains(p: Point | Coords): boolean;

  render(ctx: CanvasRenderingContext2D): void;
}
```

## **Properties**

### _static_ color

The color of all selection boxes, including the selection box of `SObject` when rendered.

Defaults to `#22ffbb`.

### _get_ members

The members of the selection. Those are all `SObjects` of the `Canvas` it is attached to.

### _get_ box

The box of the selection. It depends on the existance and position of the end point as well as the state of the selection.

If the selection has no end point, it will return `null`. If the selection has an end point, it will return a box of the start and end point. If the selection is finalized, it will return a close box including its members.

### _get_ isFinalized

Returns the state of the selection.

## **Constructor**

### s

The starting point of the selection.

### e

The ending point of the selection.

## **Methods**

### finalize

Finalizes the selection making it ready for any selection-specific operations, such like `move`.

_This method is reserved for `Canvas`._

### setEnd

Sets the given end point as new end point of the selection.

### move

_If finalized_, it will move the selection, including its members, by the given amount.

The parameters `dx` and `dy` are meant relative to the current selection's position.

### isMember

Checks if the given object is a member of the selection.

### contains

Checks if the selection contains the given point. This will be compared with the selection's bounding box.

### render

Renders the selection frame to the canvas.

_This method is reserved for `Canvas`._
