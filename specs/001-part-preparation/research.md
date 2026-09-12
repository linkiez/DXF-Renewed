# Phase 0 Research: Part Preparation

**Branch**: `001-part-preparation` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

Every item in the plan's Technical Context is resolved below. No `NEEDS CLARIFICATION` remains.

## R1 — Contour extraction input

**Decision**: Add `partPrep/extract.ts` that converts parsed DXF entities to raw contours using
the existing `denormalise` → `entityToPolyline` → `applyTransforms` pipeline (`src/nest/extractParts.ts`
shows the usage). Each contour records its source reference (entity `handle`, `layer`, `type`) and a
closed/open flag. Curve entities (CIRCLE / ARC / ELLIPSE) are flattened with the existing
`circleToPolygon` / `arcToPolygon` / `ellipseToPolygon` from `src/nesting/polygonUtils.ts`.

**Rationale**: `src/nesting/shapeExtractor.ts` discards open contours (logs + skips) and pre-labels
holes with a heuristic; the spec requires open contours to be *reported* (FR-001, FR-006) and
classification to be depth-based (FR-001). Reusing the entity→polyline conversion keeps one parser.

**Alternatives considered**: reuse `extractShapes` as-is (rejected — silent skip of open contours,
heuristic `isHole`); parse DXF inside `partPrep` (rejected — duplicates the existing parser).

## R2 — Units

**Decision**: `partPrep/units.ts` resolves the request unit: absent → `mm`; declared `mm` → `mm`;
any other declared unit → request rejected with `UNSUPPORTED_UNIT`. A single `toCanonical(value)`
boundary normalizes every incoming length to `mm` (identity while `mm` is the only supported unit).

**Rationale**: FR-008 / FR-009 / SC-004. Isolating the boundary means adding a future unit is one
table entry, not a geometry change.

**Alternatives considered**: auto-detect units from DXF `$INSUNITS` (rejected — the spec makes the
*request* unit authoritative); silent inch conversion (rejected — silent wrong-unit cuts).

## R3 — Containment depth / even-odd classification

**Decision**: `partPrep/classify.ts` builds the containment relation between closed contours with
`pointInPolygon` (already in `polygonUtils.ts`) plus a bounding-box prefilter. For contour *A* to be
inside contour *B*, test an **interior sample point of A** (not the raw centroid — the centroid of a
concave part can fall outside it) against *B*. `depth(A)` = number of contours containing *A*;
classification by parity with even-odd semantics: depth `0` → `outer`, odd → `hole`, even `≥ 2` →
`island`. Single pass, no depth cap, never flatten or merge. Each depth-0 contour starts one
`PreparedPart`; every deeper contour is attached to the nearest containing depth-0 contour.

**Rationale**: FR-001 / FR-011 / SC-001 / SC-006. Parity follows directly from the clarified
nesting model (Session 2026-09-12 Q3).

**Alternatives considered**: winding-number classification of raw DXF (rejected — depends on source
winding conventions the spec does not fix); area-ordering heuristic as in `shapeExtractor` (rejected
— gives no depth, caps at one level of holes).

## R4 — Repair policy

**Decision**: `partPrep/repair.ts` performs only the two repairs the spec permits:
1. **Gap close** — weld endpoints whose distance is `≤ tolerance` (ambiguity resolved by proximity
   to the nearest open endpoint); the contour is closed only when the resulting chain closes.
2. **Winding normalization** — rewrite orientation to a canonical direction with `normalizeWinding`;
   vertices are not moved.

After repairs, the contour is tested for real self-intersection (segment pair intersection with a
bbox prefilter, ignoring adjacent segments sharing an endpoint). A remaining self-intersection
rejects the contour with `SELF_INTERSECTION` and is **never** reordered or trimmed.

**Rationale**: FR-004 / FR-010 / SC-005.

**Alternatives considered**: Clipper2 boolean union to repair self-intersections (rejected — changes
shape beyond tolerance and hides ambiguous input; the vendored `clipper-core.cjs` is only used for
the cut-width offset in R6).

## R5 — Simplification

**Decision**: `partPrep/simplify.ts` delegates to the existing Douglas-Peucker implementation
`simplifyPolygon` in `src/nest/geometry.ts`, then removes duplicate/coincident points and re-closes
the ring. Tolerance is the caller tolerance already validated in R2.

**Rationale**: FR-003; the helper already exists and is tested. Roadmap workstream A4 expects
≥ 30 % vertex reduction at max deviation ≤ tolerance.

**Alternatives considered**: Visvalingam-Whyatt (better area preservation, but a new implementation);
arc fitting (deferred to a later workstream).

## R6 — Cut-width allowance

**Decision**: `partPrep/offset.ts` applies the caller's `cutWidthAllowance` (total kerf) as a radial
offset of `cutWidthAllowance / 2` **away from the part material**: outer boundaries offset outward,
holes/islands offset toward the enclosed void, so the finished part matches the nominal geometry.
Implementation reuses `offsetPolygon` (vendored `src/nest/clipper-core.cjs`).

**Rationale**: FR-005; Roadmap A5 checks the offset area against an analytic circle within 0.5 %.
`[VERIFY]` the offset sign convention against the machine manual when a real post-processor lands.

**Alternatives considered**: bake the allowance into nesting spacing only (rejected — FR-005 says
the boundary itself carries the allowance); offset by the full allowance (rejected — double counts
the kerf).

## R7 — Determinism

**Decision**: no `Math.random`, `Date` or `performance` values in output; all lengths compared with
the existing `EPSILON`; results sorted by `(source.handle, depth, classification)` and issues by
`(source.handle, code)`; no reliance on `Map`/`Set` iteration order.

**Rationale**: FR-007 / SC-003 require identical output for identical input + tolerance.

**Alternatives considered**: none acceptable.

## R8 — Performance and scale

**Decision**: single-threaded, pure CPU, no I/O. Containment classification is `O(n²)` worst case
with a bbox prefilter, which is sufficient for the reference scale (~10k contours). Perf target:
500 parts prepared < 30 s single core; per-part preparation < 30 ms typical (`ROADMAP-NESTING.md` §8).
If a fixture exceeds the target, add an R-tree over contour bboxes — the classification API does not
change.

**Alternatives considered**: spatial index now (rejected — YAGNI at the reference scale; documented
upgrade path).

## R9 — API shape

**Decision**: a single pure function `prepareParts(dxf, options) => PrepareResult`, re-exported
additively from `src/nesting/index.ts` (and therefore from `src/index.ts`), matching the functional
style already used by `nest` / `nestFromDxf`. No class, no global mutable state (unlike the existing
`shapeIdCounter`).

**Rationale**: FR-002 traceability is carried on the returned objects, not global state; pure
functions are trivially deterministic and testable.

**Alternatives considered**: a `PartPreparer` class (rejected — one implementation, no state to
encapsulate).

## R10 — Issue and warning model

**Decision**: one discriminated `PreparationIssue` type with `severity: 'warning' | 'rejection'`.
Rejections: `OPEN_BOUNDARY`, `SELF_INTERSECTION`, `ZERO_AREA`, `GAP_TOO_LARGE`, `UNSUPPORTED_UNIT`,
`UNSUPPORTED_ENTITY`. Warnings: `MIN_FEATURE`, `MIN_AREA`, `ORIENTATION_REPAIRED`, `GAP_CLOSED`.
Every issue carries the source reference and, where applicable, the contour depth.

**Rationale**: FR-002 / FR-006 / SC-002 — every rejection must name the affected source geometry and
must be specific.

**Alternatives considered**: throwing exceptions (rejected — a partially invalid drawing must still
return the valid parts alongside the issues).
