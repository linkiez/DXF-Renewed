# Cut-path geometry helpers

`geometry.ts` provides pure geometry primitives for cut-path planning. It transforms placed
contours, measures rapid routes, computes bounds, checks sheet containment, detects rapid travel
through kept material and measures polygon clearance. Existing nesting polygon utilities,
collision checks and `EPSILON` are reused; caller-owned geometry is never mutated.
