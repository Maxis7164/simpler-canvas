import { Callback, SimplerEventMap, Unsubscribe } from "./events.js";
import { SObject } from "./sobject.js";

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

  #bg: string = "";
  #ov: string = "";
  #h: number = 400;
  #w: number = 600;

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
  }

  #applyBackground(): void {
    this.#lcv.style.background = this.#bg;
    this.#ucv.style.background = this.#ov;
  }

  constructor(parent: HTMLElement, opts?: Partial<CanvasOpts>) {
    [this.#wr, this.#lcv, this.#ucv] = Canvas.#setup(parent);

    this.#lctx = this.#lcv.getContext("2d")!;
    this.#uctx = this.#ucv.getContext("2d")!;

    if (opts) this.applyOptions(opts);
    this.#applyOwnSize();
  }

  add(...objs: SObject[]): void {
    this.#objs.push(...objs);

    this.renderLower();
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

  on<K extends keyof SCanvasEventMap>(
    eventName: K,
    cb: Callback<SCanvasEventMap[K]>
  ): Unsubscribe {
    return this.#evs.on(eventName, cb);
  }

  renderLower(): void {
    this.#objs.forEach((obj) => obj.render(this.#lctx));
  }
  renderUpper(): void {}
  render(): void {
    this.#applyOwnSize();
    this.#applyBackground();
  }
}
