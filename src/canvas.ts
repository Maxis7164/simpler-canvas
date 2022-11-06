import { Callback, SimplerEventMap, Unsubscribe } from "./events.js";
import { Path, PathExport } from "./path.js";
import { SObject } from "./sobject.js";
import { Brush } from "./brush.js";
import { Point } from "./point.js";

interface SCanvasEventMap extends Typed {}

interface CanvasOpts {
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

  #objs: SObject[] = [];

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

  constructor(parent: HTMLElement, opts?: Partial<CanvasOpts>) {
    [this.#wr, this.#lcv, this.#ucv] = Canvas.#setup(parent);

    this.#lctx = this.#lcv.getContext("2d")!;
    this.#uctx = this.#ucv.getContext("2d")!;

    if (opts) this.applyOptions(opts);
    this.#applyOwnSize();
  }

  add(...objs: SObject[]): void {
    this.#objs = [...this.#objs, ...objs];
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

  setBrush(b?: Brush | null): void {
    this.#brush = b ?? null;

    if (b) {
      this.#ucv.addEventListener("pointerdown", (e) =>
        this.#brush!.onUpDown(e, this.#uctx)
      );
      this.#ucv.addEventListener("pointerup", (e) =>
        this.#brush!.onUpDown(e, this.#uctx)
      );
      this.#ucv.addEventListener("pointerleave", (e) =>
        this.#brush!.onUpDown(e, this.#uctx)
      );
      this.#ucv.addEventListener("pointermove", (e) =>
        this.#brush!.onMove(e, this.#uctx)
      );

      this.#unsub = this.#brush!.on("created", ({ path }) => this.add(path));
    } else {
      this.#ucv.outerHTML = this.#ucv.outerHTML;

      if (this.#unsub) this.#unsub();
      this.#unsub = null;

      this.renderUpper();
    }
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

    const nxt = ex.objects.map((obj) => {
      console.log(obj);

      return this.#hydrateObject(obj);
    });
    this.add(...nxt);
  }
}
