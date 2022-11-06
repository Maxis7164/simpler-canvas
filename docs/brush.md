# Brush - 0.1.0-alpha

```ts
class Brush {
  color: string = "#000000";

  constructor(cv: Canvas);

  onUpDown(e: PointerEvent): void;
  onMove(e: PointerEvent): void;

  on<K extends keyof BrushEventMap>(
    eventName: K,
    callback: Callback<BrushEventMap[K]>
  ): Unsubscribe;
}

interface BrushEventMap extends Typed {
  created: { type: "created"; path: Path };
}
```

## Properties

### `color`

The color of the brush.

## Constructor

### `cv`

The canvas the brush will draw on.

## Methods

### `onUpDown`

This function is reserved for `Canvas`.

### `onMove`

This function is reserved for `Canvas`.

### `on`

Listen to a specific event on `BrushEventMap`.
