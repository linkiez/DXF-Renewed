# Implementation Plan: True-Shape Nesting

**Branch**: `main` (spec branch `002-true-shape-nesting`) | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-true-shape-nesting/spec.md`

## Summary

Replace the current bbox/rectangle packing path with true-shape nesting that places irregular
contours on stock sheets and remnants, maximizing total material use across the job under a
deterministic iteration budget. Reuses the existing geometry stack in `src/nesting/` — no new
dependency, no new geometry primitives.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js
**Primary Dependencies**: none new — reuses `src/nesting/{types,config,collision,polygonUtils,geometryAnalysis}.ts` and `src/nesting/binPacking/*`
**Storage**: N/A (pure in-memory, ERP owns stock availability per spec Assumptions)
**Testing**: existing runner — `npm run test:unit`, `npm run test:integration:node` (the Mocha + `tsx` nesting suite), `npm run validate:fixtures`. `npm run test:integration` resolves to the Playwright browser suite and is **not** a gate for this feature.
**Target Platform**: Node.js library (`@linkiez/dxf-renew`)
**Project Type**: single project (library)
**Performance Goals**: 100-part mixed job < 2s (SC-002); 85% material use on the 100/5 fixture (SC-003)
**Constraints**: rotation only — never scale; deterministic (FR-007); no wall-clock term in search; two caller-supplied clearances; caller-supplied `remnantThreshold`; grain-locked parts require `grainAngle`
**Scale/Scope**: one job in memory per call; fixture 100 parts / 5 sheets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution ratified 2026-09-12, amended to v1.1.0 the same day (Governance expanded).
Evaluated against Principles I–V and the Governance subsections.

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Library-First, Additive Public API | PASS | Single module under the existing `src/nesting/` tree, re-exported from the `src/index.ts` barrel; every change to `NestingOptions` / `NestingResult` is additive |
| II. Reuse Before Rewrite | PASS | Reuses `types.ts`, `collision.ts`, `polygonUtils.ts`, `geometryAnalysis.ts`, `binPacking/*`; no new geometry, no new NFP (research D2) |
| III. Test-First | PASS | `tasks.md` places failing tests before every implementation task; runner is the existing Mocha + `tsx` |
| IV. Determinism and Reproducibility | PASS | Input-derived budget, never wall-clock (research D5/D6); seed + stable tie-break keys (FR-007) |
| V. Strict TS, Zero New Runtime Deps | PASS | `tsc --noEmit` clean; no new entry in `dependencies` |
| Governance §Implement, Do Not Report | PASS | `tasks.md` is implementation work, not a report artifact |
| Governance §Coding Conventions | PASS | English identifiers and JSDoc on the public surface; no `any`; no file over 500 lines |
| Governance §Documentation Discipline | PASS | T033 authors the sibling `*.doc.md` for every file changed under `src/` |
| Governance §Commit Discipline | PASS | Atomic Conventional Commits; no breaking change |
| Governance §Comment Discipline | PASS | Comments limited to module purpose and deliberate simplifications |

Re-evaluated after Phase 1 design: still PASS. The contract in `contracts/nesting-api.ts` adds no
runtime dependency and widens `NestingOptions` without breaking existing callers. `Complexity
Tracking` carries no unjustified deviation — the single extension (`StockSheet`/`Placement` fields)
is recorded there with its rejected alternative.

## Project Structure

### Documentation (this feature)

```text
specs/002-true-shape-nesting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── nesting-api.ts
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/
└── nesting/
    ├── index.ts              # barrel — additive re-exports of the trueShape module (T004, T020)
    ├── types.ts              # Point2D, BoundingBox, NestableShape, CompoundShape,
    │                         # Placement, StockSheet, NestingResult, NestingOptions
    ├── config.ts             # DEFAULT_ALLOWED_ROTATIONS, DEFAULT_MARGIN, DEFAULT_KERF, EPSILON
    │                         # + DEFAULT_EDGE_CLEARANCE, DEFAULT_PART_TO_PART_CLEARANCE,
    │                         #   DEFAULT_SEARCH_BUDGET_FACTOR (new, T003)
    ├── collision.ts          # satCollision, checkTransformedCollision, bboxesOverlapWithMargin,
    │                         # validatePlacements
    ├── polygonUtils.ts       # rotatePolygon, translatePolygon, computeArea, pointInPolygon
    ├── geometryAnalysis.ts   # analyzeShape, computeBestRotatedBbox, sortShapes
    ├── shapeExtractor.ts     # extractShapes (upstream of nesting)
    ├── binPacking/           # guillotine.ts, maxrects.ts, shelf.ts, multiSheetPacker.ts
    ├── applyNesting.ts       # nest / nestFromDxf pipeline (existing consumer)
    ├── toNestedSvg.ts        # SVG renderer, existing consumer of NestingResult
    ├── toNestedDxf.ts        # DXF renderer, existing consumer of NestingResult
    ├── NestingHelper.ts
    ├── trueShape/            # NEW module (T001)
    │   ├── bounds.ts         # T006 containment vs outer edge and hole contours (FR-001)
    │   ├── separation.ts     # T008 pairwise separation (FR-002)
    │   ├── rotations.ts      # T010 effectiveRotations (FR-004)
    │   ├── candidates.ts     # T011 candidate placement generation
    │   ├── search.ts         # T018 bounded global-yield search (FR-005, FR-007)
    │   └── index.ts          # T019 nestTrueShape entry point
    └── pro/
        ├── types.ts          # PreparedPart (feature 001 output)
        └── partPrep/         # prepareParts (feature 001 — upstream input)

test/
├── unit/
│   └── nesting/              # NEW trueShape unit tests (T005–T028)
├── integration/
│   └── nesting/              # NEW trueShape integration test (T021)
├── resources/nest-fixtures/  # benchmark fixture (T023)
└── functional/
```

**Structure Decision**: single project. Feature lands inside the existing `src/nesting/` tree;
no new top-level module, no new package. Extends the existing `NestingOptions` / `NestingResult`
contract rather than introducing a parallel type family.

## Complexity Tracking

No constitution violation. The constitution is ratified (v1.0.0 at plan time, amended to v1.1.0)
and the Constitution Check passes against Principles I–V and the Governance subsections.

One deliberate extension beyond the current contract — `StockSheet` and `Placement` gain fields
(see `data-model.md`). Chosen over a parallel `TrueShape*` type family because the existing
consumers (`applyNesting`, `toNestedSvg`, `toNestedDxf`, `NestingHelper`) already read those types;
the extension is additive, so no public signature breaks (Principle I).

## Phase 0: Outline & Research

See [research.md](./research.md). All unknowns from Technical Context are resolved; no
`NEEDS CLARIFICATION` remains.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — entities, field-level extensions, validation rules, invariants
- [contracts/nesting-api.ts](./contracts/nesting-api.ts) — public request/result contract
- [quickstart.md](./quickstart.md) — runnable validation scenarios

## Progress

- [x] Phase 0: research.md
- [x] Phase 1: data-model.md, contracts/, quickstart.md
- [x] Constitution ratified (v1.0.0, amended v1.1.0)
- [x] `/speckit.tasks` — `tasks.md` generated
- [x] `/speckit.analyze` — findings remediated
- [ ] `/speckit.implement`
