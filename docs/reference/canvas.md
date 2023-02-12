# Canvas - 0.4.0-alpha

```ts
class Canvas {
  get defaultContextMenu(): boolean;
  get drawModeActive(): boolean;
  get backgroundColor(): string;
  get overlayColor(): string;
  get height(): number;
  get width(): number;

  constructor(parent: HTMLElement, opts?: Partial<CanvasOpts>);

  getSelectedObjects(): SObject[];

  backward(obj: SObject): void;
  toBack(obj: SObject): void;
  forward(obj: SObject): void;
  toFront(obj: SObject): void;

  add(...objs: SObject[]): void;
  remove(...objs: SObject[]): void;

  getCoords(p: Coords | Point): Point;

  applyOptions(opts: Partial<CanvasOpts>): void;
  setBackground(clrOrUrl: string, isOverlay?: boolean): void;
  setDrawMode(active?: boolean): void;
  setSize(w: number, h: number): void;
  setBrush(b?: Brush): void;

  on<K extends keyof SCanvasEventMap>(
    eventName: K,
    cb: Callback<SCanvasEventMap[K]>
  ): Unsubscribe;

  renderLower(): void;
  renderUpper(): void;
  render(): void;

  attachSelection(sel: Selection): void;

  toObject(): CanvasExport;

  loadFromJSON(json: string): void;
  loadFromObject(ex: CanvasExport): void;

  toJSON(): CanvasExport;
}

interface CanvasOpts {
  defaultContextMenu: boolean;
  drawModeActive: boolean;
  containInside: boolean;
  background: string;
  overlay: string;
  height: number;
  width: number;
}
```

## **Properties**

### _get_ defaultContextMenu

Decides wether the context menu provided by Simpler Canvas should be used or not.

_**Note:** This option is currently not fully implemented. It may be better to use a custom context menu while the implementation gets finalized._

_**Tip:** The default context menu can be customly styled. To do that, use `div[__smpc:ctx__]` or `div[__simpler_canvas:context_menu__]` as CSS Selector._

### _get_ drawModeActive

Describes the current draw mode state. If no `Brush` was set before, this value will always be false.

### _get_ backgroundColor

The background color of the canvas.

### _get_ overlayColor

The color of the canvas' overlay.

### _get_ height

The height of the canvas.

### _get_ width

The width of the canvas.

### containInside

Deciedes wether all objects on the canvas have to stay inside the canvas' bounding box or not.

## **Constructor**

### parent

The parent `HTMLElement` the canvas should be appended to.

### opts

Any optional settings for the canvas e. g. the background color.

## **Methods**

### getSelectedObjects

Returns an array of all currently selected objects of the canvas.

### backward

Sends an object of the canvas back a layer.

This function will call `renderLower()` when it's done.

### toBack

Sends an object of the canvas to the back.

This function will call `renderLower()` when it's done.

### forward

Sends an object of the canvas forward a layer.

This function will call `renderLower()` when it's done.

### toFront

Sends an object of the canvas to the front.

This function will call `renderLower()` when it's done.

### add

Adds the given objects to the canvas.

This function will call `renderLower()` when it's done.

### remove

Removes the given objects from the canvas.

This function will call `renderLower()` when it's done.

### getCoords

Converts page coordinates to canvas coordinates.

### applyOptions

Applys `CanvasOpts` to the canvas.

### setBackground

Sets the background or overlay of the canvas to an image or a color.

### setSize

Sets the size of the canvas.

### setDrawMode

Sets the draw mode of the canvas. If no `Brush` was set before, this will do nothing.

### setBrush

Links a `Brush` to the canvas.

### on

Allows you to listen to canvas events specified in `SCanvasEventMap`.

### renderLower

Renders all objects to the canvas. It will render the complete lower canvas.

### renderUpper

Renders selections, etc. to the upper canvas.

### render

Renders the canvas and applies its size and colors. This function combines `renderLower` and `renderUpper`.

### toObject

Exports the canvas as an object.

### loadFromJSON

Loads the canvas export object in JSON format.

### loadFromObject

Loads the canvas export object.

### toJSON

This function allows you to use the instance as an argument for the `JSON.stringify` function.

This function is used by JSON.stringify.
