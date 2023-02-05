# Breaking Changes

## Commit `51d06d2`

- `Matrix.prototype.rotate` will now use radians as angle input instead of degrees
  - To use degrees, use the helper method `Matrix.degreesToRadians`

## Commit `be904d6`

- Removed `SObject` from library
  - `Path` has taken over functionality of `SObject`
  - static properties and methods from `SObject` are now accessabel from `Path`
