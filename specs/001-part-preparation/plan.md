# Implementation Plan: Part Preparation

**Branch**: `001-part-preparation` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-part-preparation/spec.md`

## Summary

Turn parsed DXF geometry into traceable, cuttable parts. Every closed contour is classified by
containment depth using the even-odd rule (depth 0 = outer, odd = hole, even ≥ 2 = island); only
gap closing within the caller tolerance and winding normalization are repaired automatically. Real
self-intersections and open boundaries are rejected with a source-traceable issue. All
measurements are interpreted in the unit declared by the request (absent → `mm`, unsupported
declared → reject) and normalized to canonical `mm` before classification and output.

## Technical Context

**Language/Version**: TypeScript 6.x (target ES2019, `strict`, `moduleResolution: bundler`), Node >= 18, ESM

**Primary Dependencies**: no new runtime dependency. Reuse `src/nesting/polygonUtils.ts` (area, winding, bbox, point-in-polygon, curve → polygon), `src/nest/geometry.ts` (`simplifyPolygon`, `offsetPolygon`) with vendored `src/nest/clipper-core.cjs`, and the existing `denormalise` / `entityToPolyline` / `applyTransforms` pipeline.

**Storage**: N/A — stateless; never persists or alters source drawings.

**Testing**: Mocha + `tsx` for unit tests (`test/unit/**`, `yarn test:unit`); Playwright for browser integration (`yarn test:integration`).

**Target Platform**: Node >= 18 and browsers (ESM library exported from `src/index.ts`).

**Project Type**: library + CLI (single project).

**Performance Goals**: prepare 500 parts < 30 s single core; per-part preparation < 30 ms typical (`ROADMAP-NESTING.md` §8).

**Constraints**: byte-identical output for identical input + tolerance (FR-007/SC-003); canonical unit `mm`; no new runtime dependency; deterministic ordering.

**Scale/Scope**: reference DXFs up to ~10k contours; fixtures under `test/resources/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is an unfilled template (`[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`,
`[SECTION_2_NAME]`, `[GOVERNANCE_RULES]`, `[CONSTITUTION_VERSION]`) with no ratified principles,
constraints or governance rules. There are therefore no active gates to evaluate; the check passes
by default. This plan introduces no violation: single module, additive public exports, no new
runtime dependency, no persistence, TDD on the existing Mocha setup. Complexity Tracking is empty.
Ratifying the constitution is out of scope for this feature.

**Post-design re-check**: PASS — additive exports only, no public API break, determinism preserved,
reuses existing geometry primitives.

## Project Structure

### Documentation (this feature)

```text
specs/001-part-preparation/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── preparation-api.ts   # public TypeScript API contract
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/nesting/
├── pro/
│   ├── types.ts             # PreparedPart, Boundary, Repair, PrepIssue, PrepareOptions/Result
│   └── partPrep/
│       ├── extract.ts       # entities -> raw contours (closed + open) with source refs
│       ├── units.ts         # unit resolution + canonical mm normalization
│       ├── classify.ts      # containment tree; even-odd depth -> outer/hole/island/open
│       ├── repair.ts        # gap close within tolerance + winding normalization; self-intersection reject
│       ├── simplify.ts      # duplicate/redundant point removal (Douglas-Peucker)
│       ├── offset.ts        # cut-width allowance (outer/hole aware)
│       └── index.ts         # prepareParts() facade
└── index.ts                 # re-export prepareParts + types (additive)

test/unit/preparation/
├── extract.test.ts
├── units.test.ts
├── classify.test.ts
├── repair.test.ts
└── prepareParts.test.ts
```

**Structure Decision**: single project. Part preparation is added as
`src/nesting/pro/partPrep/`, matching the target module layout in `ROADMAP-NESTING.md` §5, and
reuses the existing `src/nesting` geometry primitives instead of duplicating them. The legacy
`src/nest/**` module is not extended; it stays as-is and is never imported by `partPrep` except
for the two pure geometry helpers named above.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
