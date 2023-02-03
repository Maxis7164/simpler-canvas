import { SimplerEvent, SimplerEventMap } from "./events.js";
import { Path, PathExport } from "./path.js";
import { Selection } from "./selection.js";
import { SObject } from "./sobject.js";
import { Layered } from "./layered.js";
import { Brush } from "./brush.js";
import { Point } from "./point.js";

interface ContextMenuOpenEvent {
  position: Point;
}
interface SCanvasEventMap extends Typed {
  "ctx:open": ContextMenuOpenEvent;
}

interface CanvasOpts {
  defaultContextMenu: boolean;
  drawModeActive: boolean;
  background: string;
  overlay: string;
  height: number;
  width: number;
}
export interface CanvasBrushEvent {
  ctx: CanvasRenderingContext2D;
  target: SObject | null;
  pointer: Point;
  render: () => void;
  clear: () => void;
}

export class Canvas {
  static #setup(
    parent: HTMLElement
  ): [HTMLElement, HTMLCanvasElement, HTMLCanvasElement, HTMLElement] {
    const w = document.createElement("div");
    w.style.position = "relative";

    const ctxm = document.createElement("div");
    ctxm.setAttribute("__simpler_canvas:context_menu__", "");
    ctxm.setAttribute("__smpc:ctx__", "");
    ctxm.style.position = "absolute";

    ctxm.style.background = "var(--smp-cnvs-ctx-bg, #ccc)";
    ctxm.style.minHeight = "10px";
    ctxm.style.display = "none";
    ctxm.style.width = "175px";
    ctxm.style.zIndex = "1";

    const l = document.createElement("canvas");
    l.style.position = "absolute";

    const u = document.createElement("canvas");
    u.style.position = "absolute";

    w.appendChild(l);
    w.appendChild(u);
    w.appendChild(ctxm);

    parent.appendChild(w);

    return [w, l, u, ctxm];
  }

  #evs: SimplerEventMap<SCanvasEventMap> = new SimplerEventMap({
    "ctx:open": new SimplerEvent("ctx:open"),
  });

  #ctxm: HTMLElement;
  #wr: HTMLElement;
  #lcv: HTMLCanvasElement;
  #ucv: HTMLCanvasElement;

  #lctx: CanvasRenderingContext2D;
  #uctx: CanvasRenderingContext2D;

  #brush: Brush | null = null;

  #bg: string = "";
  #ov: string = "";
  #h: number = 400;
  #w: number = 600;
  #bx!: DOMRect;

  #objs: Layered<SObject> = new Layered<SObject>();

  #defaultContextMenu: boolean = false;
  #sel?: Selection | null = null;
  #drawMode: boolean = false;
  #isDown: boolean = false;

  #makeCanvasBrushEvent(
    ctx: CanvasRenderingContext2D,
    p: Point
  ): CanvasBrushEvent {
    return {
      target: this.#getTarget(p),
      pointer: p,
      ctx,
      render: () => this.renderUpper(),
      clear: () => null,
    };
  }

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

    if (this.#drawMode && this.#brush && !this.#isDown) {
      const path = this.#brush.finishPath(
        this.#makeCanvasBrushEvent(this.#uctx, p)
      );

      if (path) this.add(path);
    } else if (this.#isDown) {
      if (e.button !== 2) this.#ctxm.style.display = "none";
      else {
        this.#ctxm.replaceChildren();
        this.#onCtxMenu(e);
      }

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
    if (this.#ctxm.style.display === "block") return;

    if (this.#isDown) {
      const p = this.getCoords([e.x, e.y]);

      if (this.#drawMode && this.#brush) {
        this.#brush.move(this.#makeCanvasBrushEvent(this.#uctx, p));
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
  #onCtxMenu(e: PointerEvent): void {
    const p = this.getCoords([e.x, e.y]);
    const t = this.#getTarget(p);

    if (t && this.#defaultContextMenu) {
      this.#ctxm.style.display = "block";
      this.#ctxm.style.left = `${p.x + 10}px`;
      this.#ctxm.style.top = `${p.y + 10}px`;

      const bDel = document.createElement("button");
      bDel.innerText = "Remove from Canvas";
      bDel.addEventListener("click", () => t.remove(this));

      this.#ctxm.appendChild(bDel);
    }

    this.#evs.fire("ctx:open", { position: p });
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

    [this.#wr, this.#lcv, this.#ucv, this.#ctxm] = Canvas.#setup(parent);

    this.#lctx = this.#lcv.getContext("2d")!;
    this.#uctx = this.#ucv.getContext("2d")!;

    if (opts) this.applyOptions(opts);
    this.#applyOwnSize();

    this.#ucv.addEventListener("pointerdown", (e) => this.#onUpDown(e));
    document.addEventListener("pointerup", (e) => this.#onUpDown(e));
    this.#ucv.addEventListener("pointermove", (e) => this.#onMove(e));
    this.#ucv.addEventListener("contextmenu", (e) => e.preventDefault());
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

    if (opts.defaultContextMenu)
      this.#defaultContextMenu = opts.defaultContextMenu;

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

  setBrush(b?: Brush): void {
    this.#brush = b ?? null;
  }

  // on<K extends keyof SCanvasEventMap>(
  //   eventName: K,
  //   cb: Callback<SCanvasEventMap[K]>
  // ): Unsubscribe {
  //   return this.#evs.on(eventName, cb);
  // }

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
  get defaultContextMenu(): boolean {
    return this.#defaultContextMenu;
  }
}
