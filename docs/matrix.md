# Matrix - 0.4.0-alpha

A matrix describes a linear transformation of a given coordinate system. Matrices can be devided into seperate groups by their number of rows and columns, where those numbers are seperaded by a cross (x), e. g. a matrix with 2 rows and 2 columns would be a 2x2 matrix.

If you don't know how to work with matrices, you don't have to. All operations including matrices have helper functions, such as scaling an object.

```ts
class Matrix {
  static getIdentity(n: number): Matrix;

  get dimension(): Dimension;

  constructor(m: number[][]);

  entry(r: number, c: number): number;

  multiplyWith(m: Matrix): Matrix;
  addWith(m: Matrix): Matrix;

  getInverse(): Matrix;

  scale(v?: number, h?: number): Matrix;
  rotate(angle: number): Matrix;

  toArray(): number[][];
  toCtxInterp(): Matrix2x3;
}
```

## **Properties**

### _get_ dimension

The dimension of the matrix. E. g. a 2x3 matrix would have a dimension of `[2, 3]`.

## **Constructor**

### m

The array representation of the matrix. The outer array represents the rows and the inner arrays represent the columns.

E. g. the 2x2 identity matrix:

```
/ 1 0 \   --\   [ [ 1, 0 ],
\ 0 1 /   --/     [ 0, 1 ] ]
```

## **Methods**

### entry

Returns the entry of the matrix at the given indices.

### multiplyWith

Multiplies this matrix with the given matrix and returns the result as `Matrix`.

### addWith

Adds this matrix with the given matrix and returns the result as `Matrix`.

### getInverse

Returns the inverse of this matrix.

This function uses the [matrix-inverse](https://github.com/metabolize/matrix-inverse/blob/main/matrix-inverse.js) library by _metabolize_.

### scale

Scales this matrix and returns the result.

### rotate

Applies a rotation on this matrix and returns the result.

### toArray

Returns the matrix in its array representation.

### toCtxInterp

Converts this matrix to the `CanvasRenderingContext2D` interpretation of a transformation matrix.

This function will only return a valid value if the matrix is a 2x3 or 3x3 matrix.
