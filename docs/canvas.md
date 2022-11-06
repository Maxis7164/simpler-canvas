# Canvas - 0.2.0-alpha

```ts
class Canvas {
  constructor(parent: HTMLElement, opts?: Partial<CanvasOpts>);

  add(...objs: SObject[]): void;

  getCoords(p: Coords | Point): Point;

  applyOptions(opts: Partial<CanvasOpts>): void;
  setBackground(clrOrUrl: string, isOverlay?: boolean): void;
  setSize(w: number, h: number): void;

  setBrush(b?: Brush | null): void;

  on<K extends keyof SCanvasEventMap>(
    eventName: K,
    cb: Callback<SCanvasEventMap[K]>
  ): Unsubscribe;

  renderLower(): void;
  renderUpper(): void;
  render(): void;

  toJSON(): CanvasExport;
  toObject(): CanvasExport;
}
```
