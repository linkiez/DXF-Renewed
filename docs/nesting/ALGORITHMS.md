# Nesting Algorithms — NFP, Placement, Rotation, Optimizer

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §8.
Documentation language: en_US (project rule).

All algorithms here are **pure functions of `(input, seed, processorVersion)`**. No wall clock,
no random source other than the seeded generator, no filesystem, no network.

---

## 1. Contract

```ts
export interface NestingAlgorithmInput {
  parts: Part[]
  sheets: StockSheet[]
  remnants: Remnant[]
  options: NestingOptions
  seed: number
}

export function nest(input: NestingAlgorithmInput): NestingResult
```

---

## 2. No-Fit Polygon (NFP)

NFP of A against B is the locus of B's reference point where B touches but does not overlap A.

### 2.1 Reference point convention

Pick one convention and never change it: the **leftmost-then-lowest vertex** of the part's
outer contour. Every placement translation is expressed through that point.

### 2.2 Compilation by shape class

| Case | Method | Complexity |
|---|---|---|
| Convex vs convex | Minkowski sum of A and `-B` | O(n·m) |
| Concave A | decompose A into convex pieces (Hertel–Mehlhorn), compute per-piece NFP, then union | O(k·n·m + u) |
| Concave A and B | decompose both; union of pairwise NFPs, holes ignored | worst case growth `k²` |
| Degenerate input | fall back to SAT pairwise test | O(n·m), correct but slower |

### 2.3 Caching

```ts
export interface NfpCacheOptions {
  maxEntries: number      // default 5000
  anglePrecision: number  // default 2 → round rotation to 0.01°
  vertexPrecision: number // default 3 → round coordinates to 0.001 mm
}
```

Cache key = `hash(polyA) + hash(polyB) + angleA + angleB`. Rounding before hashing is what makes
the cache hit; without it, floating-point noise produces near-duplicate keys.

### 2.4 Acceleration ladder

1. Pre-filter with inflated convex hulls — reject impossible pairs in O(1) after hull build.
2. Place against the hull of the occupied region.
3. Refine only the best candidates with exact polygons.

This turns the common case from "exact polygon arithmetic on every candidate" into "hull test,
then exact test on a handful".

### 2.5 Failure handling

NFP failure is an **expected** condition, not an exception: degenerate polygons, duplicate
vertices, collinear runs. On failure, log `logger.warn`, fall back to SAT, and record a
`NFP_FALLBACK` counter in the run metrics so regressions are visible.

---

## 3. Placement heuristics

For each candidate NFP boundary vertex, score with one strategy:

| Strategy | Score | Bias |
|---|---|---|
| `bottom-left` | prefer lowest Y, then lowest X | fast, decent |
| `min-waste` | minimise enclosed waste area delta | better yield |
| `min-hull-gap` | minimise distance to occupied hull | compact layouts |
| `max-contact` | maximise shared boundary length | good for common-line |

Evaluation order: sort candidate vertices by X then Y, evaluate in order, keep the best score.
Stop early when the score cannot be beaten by the remaining candidates (bounded search).

```ts
export type PlacementHeuristic =
  | 'bottom-left' | 'min-waste' | 'min-hull-gap' | 'max-contact'
```

---

## 4. Rotation

```ts
export type RotationMode =
  | { kind: 'discrete'; angles: number[] }
  | { kind: 'step'; step: number }
  | { kind: 'continuous'; resolution: number }
```

| Mode | Cost | When |
|---|---|---|
| discrete `[0,90,180,270]` | 4 × placement | default |
| step (e.g. 15°) | 24 × placement | mixed parts |
| continuous | sweep + refine | convex or low-vertex parts only |

Rule: the number of orientations multiplies placement cost linearly. Apply continuous rotation
only when `vertexCount <= continuousVertexLimit` (default 24) or the part is convex.

---

## 5. Sheet and remnant selection

1. Filter remnants compatible with material and thickness.
2. Sort by area ascending.
3. Take the smallest remnant whose bounding box fits the part.
4. If none fits, open a new full sheet (only if `allowNewSheets`).
5. Drop remnants below `minUsableRemnantArea` from the candidate set.

Deterministic tie-break: equal area → equal id comparison, so two identical remnants always
resolve the same way.

---

## 6. Part-in-part

A hole is a legal container when `hole.area >= part.area × (1 + clearance)`.

Cut order is mandatory: inner part first, then the hole contour that contains it. Violating this
drops the inner part into the skeleton. The cut-path planner enforces it through containment
depth ordering.

---

## 7. Common-line cutting

1. Detect edges between neighbour parts that are parallel and within `commonLineTol`.
2. Emit one shared segment instead of two.
3. Verify the resulting geometry: SAT no-overlap, plus area conservation within tolerance.
4. On verification failure, roll back to separate contours and record `COMMON_LINE_ROLLBACK`.

Opt-in. The gain is large (up to roughly half the cut length for identical adjacent parts), but
it changes part geometry edges, so it must never ship without the verification step.

---

## 8. Optimizer

```ts
export interface OptimizerOptions {
  strategy: 'none' | 'hill-climb' | 'annealing' | 'genetic'
  timeBudgetMs: number
  seed: number
  weights: { yield: number; rapidDistance: number; sheetCount: number }
}
```

| Strategy | Move | Acceptance | Typical gain |
|---|---|---|---|
| hill-climb | swap two parts / rotate one | accept if objective improves | +2–5 % |
| annealing | same moves | accept worse early, cool down | +3–8 % |
| genetic | population of order + rotation vectors | crossover + mutation, elitism | +5–12 %, slow |

Invariant: the optimizer only permutes **order and rotation**. Every candidate layout is
re-validated with SAT before acceptance, so an optimization pass can never introduce overlap.

Determinism: the RNG is seeded from `options.seed`. Two runs with the same seed and budget must
produce the same layout, including the same sequence of accepted moves.

---

## 9. Determinism rules

| Rule | Reason |
|---|---|
| Stable sort keys everywhere (`area`, then `id`) | iteration order must not depend on insertion |
| No `Date.now()` in decisions | only in response metadata |
| Seeded RNG only | reproducibility SLO |
| Rounded cache keys | stable hits across float noise |
| Time budget checked by iteration count, not clock, in tests | test stability |

The time budget uses the wall clock in production and a fixed iteration cap in tests, injected as
a strategy rather than read directly.

---

## 10. Performance targets

| Scenario | Target |
|---|---|
| 100 parts, irregular | < 2 s |
| 500 parts, mixed | < 30 s single core |
| 2000 parts, rectangle-only | < 60 s |
| NFP cache hit rate | >= 90 % |
| Placement candidates evaluated per part | < 500 average |

---

## 11. Test oracles

| Property | Oracle |
|---|---|
| NFP correctness | brute-force pairwise overlap scan on a small random set |
| Placement validity | SAT no-overlap over all placed pairs |
| Area conservation | sum(part area) + waste == sheet area within tolerance (rectangle fixtures) |
| Determinism | two runs, same seed → identical serialized result |
| Optimizer safety | no accepted move increases overlap count |
| Common-line rollback | forced bad geometry must roll back, never emit |

## Part preparation (feature 001-part-preparation)

`prepareParts(dxf, options)` classifies closed contours into cuttable parts. Pipeline:
`units → extract → repair → simplify → classify → offset`.

- **units** — canonical mm; absent unit ⇒ mm, declared `mm` ⇒ mm, any other declared unit ⇒
  rejection `UNSUPPORTED_UNIT`.
- **extract** — `denormalise → entityToPolyline → applyTransforms`; records `SourceRef` and a
  `closed` flag for both closed and open contours.
- **repair** — close gaps `<= tolerance` (`GAP_CLOSED`), normalize winding to CCW
  (`ORIENTATION_REPAIRED`); real self-intersections are never repaired (`SELF_INTERSECTION`).
- **simplify** — delegates to `simplifyPolygon`; duplicate/coincident points removed, ring
  re-closed, max deviation `<= tolerance`.
- **classify** — even-odd containment depth on an interior sample point (never the raw centroid):
  depth 0 ⇒ `outer`, odd ⇒ `hole`, even `>= 2` ⇒ `island`; unlimited depth, never flattened.
- **offset** — `cutWidthAllowance` is the total kerf, applied as `cutWidthAllowance / 2` **away
  from material**: outer outward, hole/island inward (sign convention resolved by picking the
  candidate that moves the boundary in the intended direction, see `[VERIFY]` in `offset.ts`).
