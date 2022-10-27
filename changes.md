# Simpler Canvas - Changelog

## 0.3.0-alpha

- fixed selection border, if just one object is selected
- _get_ `SObject.corners()` added
- fixed multiple selection issue; reimplemented by holding `shift`
- `SObject.toJSON()` added
- `SObject.rotate()` added

## 0.2.0-alpha

- removed unnessesary console logs.
- _get_ `SObject.pos()` added
- _get_ `SObject.box()` added
- fixed frame stroke color
- reimplemented `Path`
  - `Path` is now immutable
  - `Path.clone()` added
  - `Path` now takes an SVG path as constructor argument
  - `Point` is abandoned from `Path`
  - more included in the documentation.
