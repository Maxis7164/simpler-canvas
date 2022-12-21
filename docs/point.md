# Point - 0.4.0-alpha

A point is a set of two numbers representing coordinates on the canvas and providing extra functionality.

```ts
class Point {
  static readonly INVALID: Point;

  static convert(coordsToPoints: true, ...poc: (Point | Coords)[]): Point[];
  static convert(coordsToPoints: false, ...poc: (Point | Coords)[]): Coords[];

  static getPointOnCubic(
    p0: Point | Coords,
    p1: Point | Coords,
    p2: Point | Coords,
    p3: Point | Coords,
    t: number
  );

  get isInvalid(): boolean;
  get coords(): Coords;
  get x(): number;
  get y(): number;

  constructor(p: Coords | Matrix, invalid: boolean = false);

  eq(p: Point | Coords): boolean;
  gt(p: Point | Coords): boolean;
  lt(p: Point | Coords): boolean;

  lerp(p: Point | Coords, t: number = 0.5): Point;

  clone(): Point;

  contains(p: Point | Coords, radius: number): boolean;
}
```

## **Properties**

### _get_ isInvalid

A boolean stating if the `Point` is invalid. This is used to mark a failed operation with `Point` which should not result in a fatal error.

### _get_ coords

The coordinates of the point.

### _get_ x

The x coordinate of the point.

### _get_ y

The y coordinate of the point.

## **Constructor**

### p

The point expressed either as a set of coordinates or as a Rx1 `Matrix`.

If `p` is an instance of `Matrix`, `Point` will use the entries of the first column in the first and second row as x and y coordinates.

### invalid

Specifies if the point should be considered as invalid or not. Defaults to `false`

## **Methods**

### eq

Checks if this point equals the given point.

### gt

Checks if the coordinates of this point are greater than those of the given point.

### lt

Checks if the coordinates of this point are less than those of the given point.

### lerp

Executes a linear interpolation between two points and returns the point at position `t`.

### contains

Checks if the given point lies inside a specified radius of this point.
