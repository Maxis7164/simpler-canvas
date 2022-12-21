# Layered - 0.4.0-alpha

Layered is a utility class using a native `Array<T>` and adding some functionality regarding more control over an element's position inside the array.

```ts
class Layered<T = any> extends Array<T> {
  get lastIndex(): number;

  toPosition(member: T, position: number): void;
  toRelativePosition(member: T, position: number);

  toStart(member: T): void;
  toEnd(member: T): void;

  set(items: T[]): void;
}
```

## **Properties**

### _get_ lastIndex

Returns the index of the last item inside the array.

## **Methods**

### toPosition

Moves an item to the specified position inside the array.

### toRelativePosition

Moves an item relatively to its current index to a new positon.

### toStart

Moves an item to be the first of the array.

### toEnd

Moves an item to be the last of the array.

### set

Overrides the current array for the specified one.
