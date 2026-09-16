# Cut-Path Planning Contract

## Public entry point

```ts
export function planCutPath(
  layout: CutLayout,
  profile: CutProcessProfile,
): CutPlanResult
```

The function does not mutate `layout` or `profile`, performs no persistence or network I/O, and
does not emit machine-specific code.

## Deterministic behavior

1. Validate structural references and dimensions.
2. Build the baseline rapid distance from `layout.contours` in input order.
3. Group contours by sheet and associated part.
4. Sequence inner contours before associated outer contours.
5. Apply the selected stable sequencing strategy with a budget derived from contour count.
6. Generate rapid, pierce, lead, cut, overcut, tab and end actions selected by the profile.
7. Validate actions, bounds, clearance, leads, tabs, travel and common-line candidates.
8. Return one plan per sheet, plus the first plan through the compatibility `plan` property, only
   when no error-level problems remain.

Equal-distance orderings use stable identifiers and original indexes as tie-breakers. The same
origin, geometry and distance function are used for baseline and optimized measurements.

## Validation semantics

Expected geometric or process failures return `valid: false` and one or more `CutPathProblem`
entries. Each rejected lead, tab or rapid must include a stable code and actionable message.
Malformed structural inputs throw; expected validation outcomes do not.

## Compatibility

The contract uses the existing `Point2D`, `NestableShape`, `Placement`, `StockItem` and
`StockSheet` types. The implementation is exported from the nesting barrel without changing
existing function signatures.
