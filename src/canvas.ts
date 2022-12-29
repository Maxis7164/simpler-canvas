import { Callback, SimplerEventMap, Unsubscribe } from "./events.js";
import { Path, PathExport } from "./path.js";
import { Selection } from "./selection.js";
import { SObject } from "./sobject.js";
import { Layered } from "./layered.js";
import { Brush } from "./brush.js";
import { Point } from "./point.js";

interface SCanvasEventMap extends Typed {}

interface CanvasOpts {
  drawModeActive: boolean;
  background: string;
  overlay: string;
  height: number;
  width: number;
}

export class Canvas {
  static #setup(
    parent: HTMLElement
  ): [HTMLElement, HTMLCanvasElement, HTMLCanvasElement] {
    const w = document.createElement("div");
    w.style.position = "relative";

    const l = document.createElement("canvas");
    l.style.position = "absolute";

    const u = document.createElement("canvas");
    u.style.position = "absolute";

    w.appendChild(l);
    w.appendChild(u);

    parent.appendChild(w);

    return [w, l, u];
  }

  #evs: SimplerEventMap<SCanvasEventMap> = new SimplerEventMap({});

  #wr: HTMLElement;
  #lcv: HTMLCanvasElement;
  #ucv: HTMLCanvasElement;

  #lctx: CanvasRenderingContext2D;
  #uctx: CanvasRenderingContext2D;

  #unsub: Unsubscribe | null = null;
  #brush: Brush | null = null;

  #bg: string = "";
  #ov: string = "";
  #h: number = 400;
  #w: number = 600;
  #bx!: DOMRect;

  #objs: Layered<SObject> = new Layered<SObject>();

  #sel?: Selection | null = null;
  #drawMode: boolean = false;
  #isDown: boolean = false;

  #applyOwnSize(): void {
    this.#lcv.height = this.#ucv.height = this.#h;
    this.#lcv.width = this.#ucv.width = this.#w;

    this.#lcv.style.height =
      this.#ucv.style.height =
      this.#wr.style.height =
        `${this.#h}px`;
    this.#lcv.style.width =
      this.#ucv.style.width =
      this.#wr.style.width =
        `${this.#w}px`;

    this.#bx = this.#ucv.getBoundingClientRect();
  }

  #applyBackground(): void {
    this.#lcv.style.background = this.#bg;
    this.#ucv.style.background = this.#ov;
  }

  #hydrateObject(obj: SObjectExport): any {
    switch (obj.type) {
      case "path":
        return Path.hydrate(obj as PathExport);
    }
  }

  #unselect(): void {
    this.#objs.forEach((obj) => obj.setSelected(false));
    this.#sel = null;
  }
  #getTargets(pos: Coords | Point): SObject[] {
    return this.#objs.filter((obj) => obj.contains(pos));
  }
  #getTarget(pos: Coords | Point): SObject | null {
    return this.#objs.find((obj) => obj.contains(pos)) ?? null;
  }

  #onUpDown(e: PointerEvent): void {
    this.#isDown = e.type === "pointerdown";
    const p = this.getCoords([e.x, e.y]);
    const t = new Layered(...this.#getTargets(p));
    const target = this.#getTarget(p);

    if (this.#drawMode && this.#brush) this.#brush.onUpDown(e, this.#uctx);
    else if (this.#isDown) {
      if (this.#sel && this.#sel.isFinalized) {
        if ((target && !this.#sel.isMember(target)) || !this.#sel.contains(p))
          this.#unselect();
      } else if (this.getSelectedObjects().length === 0 || !e.ctrlKey) {
        this.#unselect();

        if (t.length > 0) t[t.lastIndex].setSelected(true);
        else this.#sel = new Selection(p);
      }
    } else {
      if (this.#sel) {
        const box = this.#sel?.box!;

        if (box) {
          this.#objs.forEach((obj) => obj.setSelected(obj.containedIn(box)));
          this.#sel.finalize(...this.getSelectedObjects());

          if (this.#sel.box && this.#sel.box[2] === 0 && this.#sel.box[3] === 0)
            this.#sel = null;
        }
      }
    }

    this.renderUpper();
  }
  #onMove(e: PointerEvent): void {
    if (this.#isDown) {
      const p = this.getCoords([e.x, e.y]);

      if (this.#drawMode && this.#brush) {
        this.#brush.onMove(e, this.#uctx);
      } else {
        const s = this.getSelectedObjects();

        if (this.#sel) {
          if (this.#sel.isFinalized) {
            this.#sel.move(e.movementX, e.movementY);
            this.render();
          } else {
            this.#sel.setEnd(p);
            this.renderUpper();
          }
        } else if (s.length > 0) {
          s.forEach((obj) => obj.move(e.movementX, e.movementY));
          this.render();
        }
      }
    }
  }

  constructor(parent: HTMLElement | string, opts?: Partial<CanvasOpts>) {
    if (!(parent instanceof HTMLElement)) {
      const x = document.querySelector<HTMLElement>(parent);
      if (x === null)
        throw new Error(
          `[!] <Simpler Canvas> Cannot create Canvas: The Element with selector "${parent}" does not exist!`
        );
      else parent = x!;
    }

    [this.#wr, this.#lcv, this.#ucv] = Canvas.#setup(parent);

    this.#lctx = this.#lcv.getContext("2d")!;
    this.#uctx = this.#ucv.getContext("2d")!;

    if (opts) this.applyOptions(opts);
    this.#applyOwnSize();

    this.#ucv.addEventListener("pointerdown", (e) => this.#onUpDown(e));
    this.#ucv.addEventListener("pointerup", (e) => this.#onUpDown(e));
    document.addEventListener("pointerup", (e) => this.#onUpDown(e));
    this.#ucv.addEventListener("pointermove", (e) => this.#onMove(e));
  }

  getSelectedObjects(): SObject[] {
    return this.#objs.filter((obj) => obj.selected);
  }
  backward(obj: SObject): void {
    this.#objs.toRelativePosition(obj, -1);
    this.renderLower();
  }
  toBack(obj: SObject): void {
    this.#objs.toStart(obj);
    this.renderLower();
  }
  forward(obj: SObject): void {
    this.#objs.toRelativePosition(obj, 1);
    this.renderLower();
  }
  toFront(obj: SObject): void {
    this.#objs.toEnd(obj);
    this.renderLower();
  }

  add(...objs: SObject[]): void {
    this.#objs.set([...this.#objs, ...objs]);
    this.renderLower();
  }
  remove(...objs: SObject[]): void {
    this.#objs.set(this.#objs.filter((obj) => !objs.includes(obj)));
    this.renderLower();
  }

  getCoords(p: Coords | Point): Point {
    if (p instanceof Point) p = [p.x, p.y];

    p = [p[0] - this.#bx.left, p[1] - this.#bx.top];

    return new Point(p);
  }

  applyOptions(opts: Partial<CanvasOpts>): void {
    if (opts.background) this.setBackground(opts.background);
    if (opts.overlay) this.setBackground(opts.overlay, true);

    if (opts.height || opts.width)
      this.setSize(opts.width ?? -1, opts.height ?? -1);

    if (opts.drawModeActive) this.setDrawMode(opts.drawModeActive);
  }
  setBackground(clrOrUrl: string, isOverlay: boolean = false): void {
    if (isOverlay) this.#ov = clrOrUrl;
    else this.#bg = clrOrUrl;
    this.#applyBackground();
  }
  setSize(w: number, h: number): void {
    if (w > 0) this.#w = w * devicePixelRatio;
    if (h > 0) this.#h = h * devicePixelRatio;
  }
  setDrawMode(active?: boolean): void {
    this.#drawMode = this.#brush ? active ?? !this.#drawMode : false;
  }

  setBrush(b?: Brush | null): void {
    this.#brush = b ?? null;

    if (this.#unsub) this.#unsub();

    if (this.#brush)
      this.#unsub = this.#brush.on("created", ({ path }) => this.add(path));
  }

  on<K extends keyof SCanvasEventMap>(
    eventName: K,
    cb: Callback<SCanvasEventMap[K]>
  ): Unsubscribe {
    return this.#evs.on(eventName, cb);
  }

  renderLower(): void {
    this.#lctx.clearRect(0, 0, this.#w, this.#h);

    this.#objs.forEach((obj) => obj.render(this.#lctx));
  }
  renderUpper(): void {
    this.#uctx.clearRect(0, 0, this.#w, this.#h);

    if (this.#sel) {
      if (this.#sel.isFinalized) this.#sel.render(this.#uctx);
      else this.#sel.render(this.#uctx);
    }

    this.#objs.forEach((obj) =>
      obj.selected ? obj.renderBox(this.#uctx, Selection.color) : null
    );
  }
  render(): void {
    this.#applyOwnSize();
    this.#applyBackground();

    this.renderLower();
    this.renderUpper();
  }

  //? Helper for JSON.stringify()
  toJSON(): CanvasExport {
    return this.toObject();
  }
  toObject(): CanvasExport {
    return {
      objects: this.#objs.map((obj) => obj.toObject()),
      version: "smp:canvas/data@0.1.0-alpha",
      background: this.#bg,
      overlay: this.#ov,
      height: this.#h,
      width: this.#w,
    };
  }

  loadFromJSON(json: string): void {
    this.loadFromObject(JSON.parse(json));
  }
  loadFromObject(ex: CanvasExport): void {
    this.setSize(ex.width, ex.height);

    this.setBackground(ex.background);
    this.setBackground(ex.overlay, true);

    console.log(ex);

    this.#objs.set([]);
    const nxt = ex.objects.map((obj) => {
      console.log(obj);

      return this.#hydrateObject(obj);
    });
    this.add(...nxt);
  }

  attachSelection(sel: Selection): void {
    const box = sel.box!;

    if (box) {
      this.#objs.forEach((obj) => obj.setSelected(obj.containedIn(box)));
      sel.finalize(...this.getSelectedObjects());

      if (sel.box && sel.box[2] !== 0 && sel.box[3] !== 0) this.#sel = sel;
    }

    this.renderUpper();
  }

  get drawModeActive(): boolean {
    return this.#drawMode;
  }
  get backgroundColor(): string {
    return this.#bg;
  }
  get overlayColor(): string {
    return this.#ov;
  }
  get height(): number {
    return this.#h;
  }
  get width(): number {
    return this.#w;
  }
}
