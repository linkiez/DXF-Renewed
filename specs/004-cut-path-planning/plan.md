# Implementation Plan: Cut-Path Planning

**Branch**: `004-cut-path-planning` | **Date**: 2026-09-16 | **Spec**: `spec.md`

## Summary

Add an isolated, machine-independent cut-path planner under `src/nesting/cutPath/`. The planner
accepts explicit `CutLayout` and `CutProcessProfile` inputs, reuses existing nesting geometry and
collision utilities, emits a deterministic `CutPlan`, and returns structured validation problems
for expected geometric or process failures. It will preserve inner-before-outer safety, optimize
rapid travel against the input contour order, and expose the feature through the nesting barrel.

## Technical Context

**Language/Version**: TypeScript 6, Node.js >=18, strict compiler settings.

**Primary Dependencies**: Existing nesting modules, Mocha + `tsx` tests, ESLint; no new runtime
dependencies.

**Storage**: N/A. The planner is pure and does not persist data.

**Testing**: Mocha + `tsx`; unit tests in `test/unit/nesting/cutPath/`, with repository
`yarn type-check`, `yarn lint` and `yarn test:unit` gates.

**Target Platform**: Node.js and browser-compatible library builds.

**Project Type**: TypeScript library.

**Performance Goals**: Reference plans must reduce rapid distance by at least 20% against the
original `CutLayout` contour order. Sequencing work uses an input-derived bound, never a
wall-clock deadline.

**Constraints**: Additive public API; no input mutation; no machine-specific output; reuse
`Point2D`, `NestableShape`, `Placement`, `StockItem`, polygon utilities and collision behavior;
use `EPSILON` for geometric comparisons; return explicit validation problems.

**Scale/Scope**: One or more stock sheets and a finite ordered contour list per planning request.
The first implementation targets deterministic in-memory planning, not persistence or streaming.

## Constitution Check

*GATE: Must pass before implementation planning and after design.*

- **I. Library-First, Additive Public API**: PASS. New types and `planCutPath` live in a focused
  nesting module and are re-exported without changing existing signatures.
- **II. Reuse Before Rewrite**: PASS. The design reuses existing geometry types, polygon utilities,
  collision helpers, `EPSILON`, and the documented cut-action boundary.
- **III. Test-First**: PASS. The plan requires focused unit tests before implementation and all
  repository gates before task completion.
- **IV. Determinism and Reproducibility**: PASS. Input order, stable identifiers, explicit origin
  and an input-derived sequencing budget define repeatable output and metrics.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: PASS. The feature uses strict types,
  no new dependency, no persistence/network I/O and no caller-input mutation.
- **Unit discipline / precision / silent failure**: PASS. Geometry remains unitless as today,
  comparisons use `EPSILON`, and expected validation failures return specific problems.

## Phase 0: Research Summary

Research is recorded in `research.md`. Existing post-processor documentation already defines the
machine-independent action contract and sequencing guidance. No unresolved technical unknowns
remain after clarification.

## Phase 1: Design Summary

Design artifacts:

- `data-model.md`: public layout, profile, action, plan and validation result entities.
- `contracts/cut-path-planning.md`: public function, sequencing and validation semantics.
- `quickstart.md`: runnable gates and feature acceptance scenarios.

## Project Structure

### Documentation

```text
specs/004-cut-path-planning/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── cut-path-planning.md
└── quickstart.md
```

### Source Code

```text
src/nesting/
├── cutPath/
│   ├── types.ts
│   ├── plan.ts
│   ├── sequence.ts
│   ├── entries.ts
│   ├── validate.ts
│   ├── geometry.ts
│   └── index.ts
├── collision.ts
├── polygonUtils.ts
├── types.ts
└── index.ts

test/unit/nesting/cutPath/
├── plan.test.ts
├── sequence.test.ts
└── validate.test.ts
```

**Structure Decision**: Use a feature-local module under the existing nesting library. Keep
geometry, sequencing, entry selection and validation focused, update source-adjacent `.doc.md`
files for each changed source file, and expose only the public surface through the nesting barrel.

## Complexity Tracking

No constitution violations require justification.
