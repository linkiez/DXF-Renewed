# Tasks: Part Preparation

**Input**: Design documents from `/specs/001-part-preparation/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/preparation-api.ts, quickstart.md

**Tests**: Included. plan.md commits to TDD on the existing Mocha + `tsx` setup and
`quickstart.md` defines the validation scenarios, so each user story ships with its tests.
Acceptance-test coverage is explicit for offset correctness (FR-005/SC-008) and warning codes
(FR-006), which the analysis flagged as previously untested.

**Organization**: One user story (`US1`, P1) — the spec defines only `User Story 1 - Prepare
Cuttable Parts`. Tasks are grouped Setup → Foundational → US1 → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `[US1]` only in the user-story phase
- Paths are repository-relative and exact

## Path Conventions

Single project (library). Feature module: `src/nesting/pro/partPrep/`; shared feature types:
`src/nesting/pro/types.ts`; tests: `test/unit/preparation/`. Legacy `src/nest/**` is reused but not
modified.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the module and test layout described in plan.md.

- [X] T001 Create the part-preparation directories `src/nesting/pro/` and `src/nesting/pro/partPrep/` and the test directory `test/unit/preparation/`
- [X] T002 [P] Declare the public types in `src/nesting/pro/types.ts` (`SourceRef`, `BBox`, `Boundary`, `Repair`, `Warning`, `PreparedPart`, `PreparationIssue`, `IssueCode`, `PrepareOptions`, `PrepareResult`) exactly as specified in `specs/001-part-preparation/contracts/preparation-api.ts`; no extra fields
- [X] T003 [P] Add Mocha + `tsx` helpers in `test/unit/preparation/helpers.ts` (contour factory, `test/resources/` fixture loader, deep-equal runner)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure geometry modules every task in US1 composes. No user-story work starts until
these exist.

**⚠️ CRITICAL**: Complete this phase before Phase 3.

- [X] T004 [P] Implement unit resolution and canonical-mm normalization in `src/nesting/pro/partPrep/units.ts` per research R2: absent unit ⇒ `mm`, declared `mm` ⇒ `mm`, any other declared unit ⇒ rejection `UNSUPPORTED_UNIT` (FR-008, FR-009)
- [X] T005 [P] Implement entity→contour extraction in `src/nesting/pro/partPrep/extract.ts` per research R1: reuse `denormalise` → `entityToPolyline` → `applyTransforms`, flatten curves with `circleToPolygon`/`arcToPolygon`/`ellipseToPolygon`, and record `SourceRef` plus a `closed` flag for **both closed and open** contours (FR-001)
- [X] T006 [P] Implement `repair.ts` in `src/nesting/pro/partPrep/repair.ts` per research R4: close gaps `<= tolerance`, normalize winding without moving vertices, then detect real self-intersections (adjacent segments sharing an endpoint excluded); emit `Repair{kind:'gap-close'|'orientation'}` and never reorder or trim (FR-004, FR-010)
- [X] T007 [P] Implement simplification in `src/nesting/pro/partPrep/simplify.ts` per research R5: delegate to `simplifyPolygon` (`src/nest/geometry.ts`), remove duplicate/coincident points, re-close the ring, max deviation `<= tolerance` (FR-003)
- [X] T008 [P] Implement cut-width allowance in `src/nesting/pro/partPrep/offset.ts` per research R6 and FR-005: treat `cutWidthAllowance` as the **total kerf**, offset by `cutWidthAllowance / 2` **away from material** (outer outward, hole/island inward) using `offsetPolygon` (`src/nest/geometry.ts` + vendored `src/nest/clipper-core.cjs`); add a `[VERIFY]` comment on the sign convention
- [X] T009 [P] Implement containment classification in `src/nesting/pro/partPrep/classify.ts` per research R3: containment relation via `pointInPolygon` + bbox prefilter on an **interior sample point** (not the raw centroid); `depth 0` ⇒ `outer`, odd ⇒ `hole`, even `>= 2` ⇒ `island`, unlimited depth, never flatten/merge (FR-001, FR-011)

**Checkpoint**: All pure geometry modules are unit-testable in isolation.

---

## Phase 3: User Story 1 - Prepare Cuttable Parts (Priority: P1) 🎯 MVP

**Goal**: `prepareParts(dxf, options)` returns classified cuttable parts (outer/hole/island by
containment depth) with repairs and source-traceable warnings/rejections.

**Independent Test**: Submit closed, open, duplicated and self-crossing contours and verify each
either produces a classified part or a clear rejection reason; self-crossing contours are always
rejected and never repaired.

### Tests for User Story 1

> Write these first; they MUST fail before implementation.

- [X] T010 [US1] Write the failing contract test asserting `prepareParts` result shape (`parts`, `issues`, `unit`) in `test/unit/preparation/prepareParts.test.ts`
- [X] T011 [P] [US1] Write failing unit tests for unit handling: omitted unit ⇒ `unit === 'mm'`, `unit: 'in'` ⇒ `UNSUPPORTED_UNIT` with no parts (SC-004) in `test/unit/preparation/units.test.ts`
- [X] T012 [P] [US1] Write failing unit tests for nested classification: depth 0/1/2/3 ⇒ outer/hole/island/hole, unlimited depth, nothing flattened (SC-001, SC-006) in `test/unit/preparation/classify.test.ts`
- [X] T013 [P] [US1] Write failing unit tests for repair and rejection: gap `<= tolerance` closes, gap `> tolerance` rejects, open boundary rejects, bow-tie rejects with `SELF_INTERSECTION` and 0 auto-repairs (SC-002, SC-005) in `test/unit/preparation/repair.test.ts`
- [X] T014 [P] [US1] Write failing tests for cut-width allowance: offset of a reference circle stays within 0.5% of the analytic area, outer offsets outward and holes/islands inward, and allowance is applied as `kerf / 2` (FR-005, SC-008) in `test/unit/preparation/offset.test.ts`
- [X] T015 [P] [US1] Write failing tests for warnings: a part under `minFeatureSize` emits `MIN_FEATURE`, a part under `minArea` emits `MIN_AREA`, thresholds default/override in canonical mm, and a repairable gap emits `GAP_CLOSED` while an unrepairable closure is a rejection (FR-006) in `test/unit/preparation/warnings.test.ts`
- [X] T016 [P] [US1] Write failing tests for deep nesting: a 4-level nested contour set classifies depth 0/1/2/3/4 as outer/hole/island/hole/island with nothing flattened, merged or rejected for depth alone (SC-006) in `test/unit/preparation/nestingDepth.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement `prepareParts` in `src/nesting/pro/partPrep/index.ts` orchestrating `units → extract → repair → simplify → classify → offset` and returning `PrepareResult` with parts sorted by `outer.source.handle`
- [X] T018 [US1] Implement issue/warning assembly with source traceability in `src/nesting/pro/partPrep/index.ts`: rejection codes `OPEN_BOUNDARY`, `SELF_INTERSECTION`, `ZERO_AREA`, `GAP_TOO_LARGE`, `UNSUPPORTED_UNIT`, `UNSUPPORTED_ENTITY`; warning codes `MIN_FEATURE`, `MIN_AREA`, `ORIENTATION_REPAIRED`, `GAP_CLOSED`; issues sorted by `(source.handle, code)` (FR-002, FR-006)
- [X] T019 [US1] Add additive re-exports of `prepareParts` and the feature types from `src/nesting/index.ts` and `src/index.ts` (no breaking change to existing exports)
- [X] T020 [US1] Add the end-to-end pipeline test on `test/resources/arrayed-holes.dxf` in `test/unit/preparation/prepareParts.test.ts`, asserting every returned part has an `outer` plus correctly depth-tagged holes/islands and every boundary carries `source`
- [X] T021 [US1] Add the determinism test — run the T020 input 100× and assert deep-equal `PrepareResult` — in `test/unit/preparation/prepareParts.test.ts` (SC-003, FR-007)

**Checkpoint**: `npx mocha --require tsx --recursive test/unit/preparation --extensions .ts` passes; US1 is independently demoable.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation and guards that span the feature.

- [X] T022 [P] Update `docs/nesting/ALGORITHMS.md` with the classify/repair/simplify/offset decisions and the `cutWidthAllowance / 2` convention
- [X] T023 [P] Add the performance smoke test (500 parts prepared < 30 s single core) in `test/unit/preparation/perf.test.ts` (SC-007, research R8)
- [X] T024 Run `yarn type-check` and `yarn lint src` and fix every issue in `src/nesting/pro/` and `test/unit/preparation/`
- [X] T025 Validate every scenario in `specs/001-part-preparation/quickstart.md` and record the actual outcome per scenario
- [X] T026 [P] Review `src/nesting/pro/partPrep/` for dead code and duplication against `src/nesting/shapeExtractor.ts`; leave the legacy module untouched

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately.
- **Foundational (Phase 2)**: needs T002/T003; blocks US1.
- **US1 (Phase 3)**: needs Phase 2; tests (T010–T016) before implementation (T017–T019) before integration/determinism (T020–T021).
- **Polish (Phase 4)**: needs US1. T024/T025 require the implementation; T022/T023/T026 are independent.

### Task Dependencies (explicit)

- T004–T009 each depend on T002 (types).
- T010 depends on T002; T014 depends on T008; T015 depends on T018; T016 depends on T009.
- T017 depends on T004–T009; T018 depends on T017; T019 depends on T017; T020 depends on T019; T021 depends on T020.
- T025 depends on T024.

### Parallel Opportunities

- Setup: T002 and T003.
- Foundational: T004, T005, T006, T007, T008, T009 (six different files).
- US1 tests: T011, T012, T013, T014, T015, T016 (six different files). T010 touches `prepareParts.test.ts`, so run it before T020/T021 or in a separate slice.
- Polish: T022, T023, T026.

---

## Parallel Example: User Story 1

```bash
# After Phase 2, launch the independent unit-test files together:
Task: "unit tests for unit handling in test/unit/preparation/units.test.ts"
Task: "unit tests for nested classification in test/unit/preparation/classify.test.ts"
Task: "unit tests for repair and rejection in test/unit/preparation/repair.test.ts"
Task: "unit tests for cut-width allowance in test/unit/preparation/offset.test.ts"
Task: "unit tests for warnings in test/unit/preparation/warnings.test.ts"
Task: "unit tests for deep nesting in test/unit/preparation/nestingDepth.test.ts"

# Then implement the facade, then run:
npx mocha --require tsx --recursive test/unit/preparation --extensions .ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup.
2. Phase 2 Foundational — blocks everything, complete fully.
3. Phase 3 US1 in order: contract test → unit tests → facade → issue assembly → exports → integration → determinism.
4. **STOP and VALIDATE**: run the US1 independent test and the `quickstart.md` scenarios.
5. Run Phase 4 polish.

### Incremental Delivery

Setup + Foundational → US1 (MVP) → Polish. There is no US2/US3 in this spec; later workstreams
(002+) consume the `PrepareResult` contract and must not need changes to it.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task.
- `[US1]` maps tasks to the single user story in `spec.md`.
- Tests are written first and must fail before implementation.
- Reuse existing primitives (`polygonUtils`, `src/nest/geometry`, `clipper-core.cjs`); add no runtime dependency.
- Never modify `src/nest/**` or `src/nesting/shapeExtractor.ts` in this feature.

## Phase 5: Convergence

- [ ] T027 Guard inward cut-width offset against self-intersection and collapse; fall back to the original ring when the shrunk area <= EPS per FR-005 (partial)
- [ ] T028 Make part `id` unique per occurrence (not per block definition) in `src/nesting/pro/partPrep/index.ts` per data-model.md Part.id (partial)
- [ ] T029 Emit `OPEN_BOUNDARY` for inherently open primitives (LINE/ARC/SPLINE/RAY/XLINE, elliptical arc) instead of folding them into `GAP_CLOSED`/`GAP_TOO_LARGE` per FR-006 (partial)
- [ ] T030 Make `samplePoint` orientation-safe for CW rings in `src/nesting/pro/partPrep/classify.ts` per FR-002 (partial)
- [ ] T031 Document the O(n^2) ceiling of `hasSelfIntersection` with its upgrade path per plan: performance (partial)
- [ ] T032 Justify or remove the `sonar-project.properties` addition; it is outside the feature scope (unrequested)
