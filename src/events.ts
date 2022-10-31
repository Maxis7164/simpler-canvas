export type Callback<E> = (e: SEvent<E>) => void;
export type Unsubscribe = () => void;

type SEvent<E> = E & { type: string };

export class SimplerEvent<K extends string, E extends {}> {
  #cbs: Callback<SEvent<E>>[] = [];
  #name: K;

  constructor(name: K) {
    this.#name = name;
  }

  fire(event: E): void {
    this.#cbs.forEach((cb) => cb({ ...event, type: this.#name }));
  }
  on(cb: Callback<E>): Unsubscribe {
    this.#cbs.push(cb);

    return () => {
      this.#cbs.splice(this.#cbs.indexOf(cb), 1);
    };
  }
}

type EventMapOf<M extends Typed> = {
  [P in keyof M]: SimplerEvent<string, M[P]>;
};

export class SimplerEventMap<M extends { [key: string]: Typed }> {
  #map: EventMapOf<M>;

  constructor(map: EventMapOf<M>) {
    this.#map = map;
  }

  fire<K extends keyof M>(eventName: K, event: M[K]): void {
    if (eventName in this.#map) this.#map[eventName].fire(event);
    else
      console.error(
        `[!] Invalid Event: Event "${
          eventName as string
        }" does not exist on this event map.`
      );
  }
  on<K extends keyof M>(eventName: K, cb: Callback<M[K]>): Unsubscribe {
    if (eventName in this.#map) return this.#map[eventName].on(cb);
    else
      console.error(
        `[!] Invalid Event: Event "${
          eventName as string
        }" does not exist on this event map.`
      );

    return () => {};
  }
}
