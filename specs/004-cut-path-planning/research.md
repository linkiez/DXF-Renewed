# Cut-Path Planning Research

## Decision: Reuse existing nesting geometry and collision helpers

**Rationale:** `Point2D`, `NestableShape`, `CompoundShape`, `Placement` and `StockSheet` already
represent the geometry and placement data required by a cut plan. `polygonUtils.ts` provides
distance, transforms, bounds and containment helpers, while `collision.ts` provides the existing
bounds and polygon collision behavior. Reusing them preserves precision, epsilon handling and
public API consistency.

**Alternatives considered:** A second cut-specific polygon model was rejected because it would
require conversions and could diverge from nesting geometry. SVG was rejected because the planner
must remain machine-independent and should not depend on rendering output.

## Decision: Add an isolated `src/nesting/cutPath/` module

**Rationale:** The feature is additive and belongs beside the existing nesting pipeline. A focused
module can expose cut-path types, planning, sequencing and validation through a local barrel, with
only re-exports added to `src/nesting/index.ts` and `src/index.ts` as appropriate.

**Alternatives considered:** Extending `trueShape/` was rejected because cut planning consumes a
completed layout and has different responsibilities from placement search. A post-processor module
was rejected because this feature produces the machine-independent plan consumed by post-processors.

## Decision: Return structured validation results

**Rationale:** Geometric and process rejections are expected outcomes and must include actionable
codes and messages. Structural input errors remain exceptional. The result includes the plan when
valid, all validation problems, and deterministic travel metrics.

**Alternatives considered:** Throwing for every validation failure would prevent callers from
displaying or correcting multiple issues at once. Silently omitting invalid actions violates the
constitution's explicit-failure rule.

## Decision: Use deterministic inner-first sequencing with bounded improvement

**Rationale:** The sequence groups contours by sheet and containment depth, placing inner contours
before their outer contours. Within eligible groups it uses stable nearest-neighbour ordering and
a bounded deterministic 2-opt pass. The original `CutLayout` contour order is the SC-002 baseline,
using the same start point and distance calculation as the optimized sequence.

**Alternatives considered:** Pure input order satisfies safety but cannot meet the travel-reduction
criterion. An unbounded optimizer was rejected because the constitution requires input-derived,
reproducible budgets rather than wall-clock behavior.

## Decision: Model machine-independent actions using the existing post-processor contract

**Rationale:** `docs/nesting/POST-PROCESSORS.md` already defines `CutActionKind`, `CutAction` and
`CutPlan` as the boundary between nesting and machine-specific emitters. The feature will align
its public types with that contract and add planning metadata without coupling to a machine dialect.

**Alternatives considered:** A machine-specific G-code plan was rejected because it violates the
feature's machine-independent scope and would prevent reuse by laser, plasma and other emitters.
