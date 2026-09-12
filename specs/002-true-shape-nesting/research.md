# Phase 0 — Research

All Technical Context unknowns resolved. Decisions are constrained by the clarified spec and by
what already exists in `src/nesting/`.

## D1 — Geometry and input types

- **Decision**: reuse `Point2D`, `BoundingBox`, `NestableShape`, `CompoundShape` from
  `src/nesting/types.ts` and `PreparedPart` from `src/nesting/pro/types.ts`. Add no geometry
  primitive.
- **Rationale**: `types.ts` exists and is already the single source for shape geometry; feature
  001 (`prepareParts`) already emits parts upstream of nesting, satisfying the spec assumption
  that inputs have passed preparation.
- **Alternatives considered**: a parallel `TrueShape*` type family — rejected: duplicates the
  contract and forces adaptation at every consumer.

## D2 — Collision and placement validation

- **Decision**: build on `satCollision`, `checkTransformedCollision`, `bboxesOverlapWithMargin`
  and `validatePlacements` in `src/nesting/collision.ts`, plus `rotatePolygon` / `translatePolygon`
  / `pointInPolygon` / `computeArea` from `src/nesting/polygonUtils.ts`.
- **Rationale**: SAT-based contour collision already implements the true-shape test FR-002 needs;
  `bboxesOverlapWithMargin` is the existing margin-aware broad phase.
- **Alternatives considered**: new NFP (no-fit-polygon) implementation — rejected for cost; NFP
  may be reintroduced later as an optimization behind the same contract.

## D3 — Orientations (FR-004)

- **Decision**: candidate angles come from `NestingOptions.allowedRotations`, defaulting to
  `DEFAULT_ALLOWED_ROTATIONS` (`[0, 90, 180, 270]`) from `src/nesting/config.ts`. Grain-locked
  parts intersect that list with the angles aligned to their declared grain direction. Scale is
  never applied.
- **Rationale**: `DEFAULT_ALLOWED_ROTATIONS` already encodes the clarified default; grain
  restriction is a filter over the same list.
- **Alternatives considered**: free continuous rotation — rejected by the clarification.

## D4 — Clearances (FR-001, FR-002)

- **Decision**: two independent caller-supplied absolute distances — *edge clearance* (part
  instance vs. outer sheet edge **and** vs. every hole contour) and *part-to-part clearance*
  (boundary vs. boundary of any two placed instances, including inside a hole).
- **Rationale**: the clarification requires two distinct values; a single margin cannot express
  "tight to the edge, loose between parts" or the reverse.
- **Alternatives considered**: reuse `DEFAULT_MARGIN` (10.0) for both — rejected: collapses the
  two requirements into one and contradicts the accepted clarification. `DEFAULT_MARGIN` stays
  only as the default for the edge value when the caller omits it.

## D5 — Search strategy and budget (FR-005, FR-007, SC-002, SC-003)

- **Decision**: global-yield search over alternative placements using the existing packing
  strategies (`binPacking/maxrects.ts`, `guillotine.ts`, `shelf.ts`) and `sortShapes` orderings as
  candidate generators; the budget is a deterministic count of iterations/nodes derived from the
  input size. Wall-clock time is never a term. Ties resolve by a stable deterministic order
  (seed + input order).
- **Rationale**: a counted budget is the only bound that keeps FR-007 reproducible; a time-based
  cutoff produces intermittent differences between identical runs.
- **Alternatives considered**: exact optimum (unbounded) — rejected: cannot honor SC-002;
  wall-clock cutoff — rejected: breaks FR-007; greedy best-fit-first — rejected by clarification 1.

## D6 — Determinism (FR-007)

- **Decision**: identical input plus identical seed yields identical placements. Achieved by
  stable ordering of parts and candidate positions, and by deriving the budget from input size.
- **Rationale**: with a counted budget and stable ordering there is no nondeterministic input to
  the search.
- **Alternatives considered**: relying on `Array.prototype.sort` default ordering — rejected:
  not stable across V8 versions for all comparators; use explicit tie-break keys.

## D7 — Numeric tolerance

- **Decision**: use `EPSILON` (`1e-6`) from `src/nesting/config.ts` for containment and
  separation comparisons instead of exact float comparison.
- **Rationale**: already the project-wide geometry tolerance; exact comparison would make
  FR-001/FR-002 flaky on rotated coordinates.
- **Alternatives considered**: per-feature tolerance constant — rejected as duplication.

## D8 — Benchmark fixture (SC-002, SC-003)

- **Decision**: one fixture of 100 mixed parts over 5 sheets is the sole benchmark corpus for both
  criteria; 85% material use is a hard acceptance floor measured as placed part area divided by
  consumed stock area. Budget calibration is validated against this fixture.
- **Rationale**: SC-003 names the same fixture as SC-002; one corpus keeps performance and yield
  gates in sync. A budget that exhausts below 85% is a calibration defect, not an exception.
- **Alternatives considered**: a versioned external benchmark set — rejected by the clarification.

## D9 — Remnants and holes

- **Decision**: a remnant is a stock item the caller supplies; stock items below the caller
  threshold are excluded before search. Holes are region constraints, not stock items: parts may
  be placed inside a hole when both clearances hold.
- **Rationale**: matches the spec Edge Cases and keeps the stock list flat.
- **Alternatives considered**: modelling each hole as a nested stock sheet — rejected: inflates
  the search space without adding capability.
