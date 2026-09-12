# Tasks: True-Shape Nesting

**Input**: Design documents from `/specs/002-true-shape-nesting/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md,
contracts/nesting-api.ts, quickstart.md

**Tests**: Included. Constitution Principle III (Test-First) is non-negotiable, so every
implementation task is preceded by a failing test. Runner is the existing Mocha + `tsx` setup:
`npm run test:unit` for unit tests and `npm run test:integration:node` for the node integration
test. Acceptance thresholds from SC-002/SC-003 are themselves test tasks.

**Organization**: One user story (`US1`, P1) — the spec defines only `User Story 1 - Fit Parts
Into Available Stock`. Tasks are grouped Setup → Foundational → US1 → Acceptance Thresholds →
Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `[US1]` only in the user-story phase
- Paths are repository-relative and exact

## Path Conventions

Single project (library). Feature module: `src/nesting/trueShape/`; shared feature types:
`src/nesting/types.ts`; defaults: `src/nesting/config.ts`; unit tests: `test/unit/nesting/`;
integration tests: `test/integration/nesting/`. Legacy `src/nest/**` is reused but not modified.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the module layout and declare the contract from `plan.md` / `data-model.md`.

- [ ] T001 Create the feature directory `src/nesting/trueShape/` and the test directory `test/integration/nesting/`
- [ ] T002 [P] Extend the types in `src/nesting/types.ts` exactly as specified in `specs/002-true-shape-nesting/contracts/nesting-api.ts`: `StockItem` (`id`, `kind`, `holes?` added to `StockSheet`), `PartRequest`, `UnplacedPart`, `NestRequest`, `NestResponse`; no extra fields
- [ ] T003 [P] Add the job defaults to `src/nesting/config.ts`: `DEFAULT_EDGE_CLEARANCE`, `DEFAULT_PART_TO_PART_CLEARANCE` (see `DEFAULT_MARGIN` as the precedent for the edge value) and `DEFAULT_SEARCH_BUDGET_FACTOR`; reuse the existing `EPSILON` for all comparisons
- [ ] T004 [P] Re-export the new public types and `nestTrueShape` wiring surface from `src/nesting/index.ts` (additive only — no existing export changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure geometry predicates every US1 task composes. No user-story work starts until
these exist.

**⚠️ CRITICAL**: Complete this phase before Phase 3.

- [ ] T005 [P] Write failing unit tests for edge clearance — an instance closer than `edgeClearance` to the outer sheet edge, and separately to a hole contour, is rejected; at exactly the clearance it passes (FR-001) in `test/unit/nesting/trueShapeBounds.test.ts`
- [ ] T006 [P] Implement the containment predicate in `src/nesting/trueShape/bounds.ts` using `EPSILON` (`src/nesting/config.ts`), validating against the outer boundary and every hole contour (FR-001)
- [ ] T007 [P] Write failing unit tests for pairwise separation — two instances closer than `partToPartClearance`, including inside a hole, are rejected; equal-to-clearance passes (FR-002) in `test/unit/nesting/trueShapeSeparation.test.ts`
- [ ] T008 [P] Implement the separation predicate in `src/nesting/trueShape/separation.ts` by delegating to `satCollision` / `checkTransformedCollision` (`src/nesting/collision.ts`) with `bboxesOverlapWithMargin` as the broad phase (FR-002)
- [ ] T009 [P] Write failing unit tests for effective rotations — omission defaults to `DEFAULT_ALLOWED_ROTATIONS`; a caller list is honored verbatim; a grain-locked part is restricted to the grain-aligned subset; no output angle ever scales geometry (FR-004) in `test/unit/nesting/trueShapeRotations.test.ts`
- [ ] T010 [P] Implement `effectiveRotations(part, allowedRotations)` in `src/nesting/trueShape/rotations.ts` with `rotatePolygon` / `translatePolygon` (`src/nesting/polygonUtils.ts`) and never a scale factor (FR-004)
- [ ] T011 [P] Implement candidate placement generation in `src/nesting/trueShape/candidates.ts`, driving the existing packers `maxRectsPack` / `guillotinePack` / `shelfPack` (`src/nesting/binPacking/`) as candidate sources over the `sortShapes` orderings (`src/nesting/geometryAnalysis.ts`), returning contours transformed by `rotatePolygon` + `translatePolygon`

**Checkpoint**: Bounds, separation, rotation and candidate generation are unit-testable in isolation.

---

## Phase 3: User Story 1 - Fit Parts Into Available Stock (Priority: P1) 🎯 MVP

**Goal**: `nestTrueShape(request)` places irregular parts on caller-supplied sheets and remnants,
maximizing total material use across the job, and reports every non-placed quantity with a reason.

**Independent Test**: Submit irregular parts and one sheet; verify every placement is in bounds,
no two placements overlap, and non-fitting parts come back with quantity and reason.

### Tests for User Story 1

> Write these first; they MUST fail before implementation.

- [ ] T012 [US1] Write the failing contract test asserting the `nestTrueShape(request)` result shape (`placements`, `sheets`, `unplaced`, `utilization`, `budget`, `seed`, echoed clearances) in `test/unit/nesting/trueShapeContract.test.ts`
- [ ] T013 [P] [US1] Write failing tests for the basic fit: irregular parts on one sheet, every placement in bounds at `edgeClearance`, zero overlap, `unplaced` empty (FR-001, FR-002, SC-001) in `test/unit/nesting/trueShapePlacement.test.ts`
- [ ] T014 [P] [US1] Write failing tests for global yield and tie-breaking: a layout yielding more total material wins over a smaller-accommodating-item greedy choice, and two equally yielding arrangements resolve in a stable deterministic order (FR-005) in `test/unit/nesting/trueShapeYield.test.ts`
- [ ] T015 [P] [US1] Write failing tests for the deterministic budget: the budget is derived from input size, the same input plus the same seed produces identical placements across two runs, and changing only the seed still yields a self-consistent result (FR-005, FR-007) in `test/unit/nesting/trueShapeDeterminism.test.ts`
- [ ] T016 [P] [US1] Write failing tests for unplaced reporting: a part larger than every stock item appears in `unplaced` with its requested quantity and a non-empty `reason`, and no exception is thrown (FR-006) in `test/unit/nesting/trueShapeUnplaced.test.ts`
- [ ] T017 [P] [US1] Write failing tests for stock selection across sheets and remnants, including exclusion of a remnant below the caller threshold (FR-005, spec Edge Cases) in `test/unit/nesting/trueShapeStock.test.ts`

### Implementation for User Story 1

- [ ] T018 [US1] Implement the bounded global-yield search in `src/nesting/trueShape/search.ts`: deterministic node/iteration budget derived from input size (never wall-clock), stable tie-break keys, reuse of the T006/T008/T010/T011 predicates (FR-005, FR-007)
- [ ] T019 [US1] Implement `nestTrueShape(request)` in `src/nesting/trueShape/index.ts` orchestrating stock filter → candidates → search → result assembly, returning `NestResponse` with `utilization`, per-sheet use, waste and echoed clearances (FR-006)
- [ ] T020 [US1] Wire the module into the barrel in `src/nesting/index.ts` (additive; no existing export modified)
- [ ] T021 [US1] Write the integration test that runs a prepared-part set end to end through `nestTrueShape` in `test/integration/nesting/trueShape.test.ts` (SC-001)
- [ ] T022 [US1] Add validation of caller input — negative clearances, empty stock, non-positive dimensions — returning explicit reasons rather than throwing (FR-006, constitution: silent failure forbidden)

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: Acceptance Thresholds (SC-002, SC-003)

**Purpose**: The time and yield floors in the spec are pass/fail gates, not aspirations.

- [ ] T023 [P] Build the 100-part / 5-sheet benchmark fixture required by SC-002 and SC-003, following the existing fixture layout under `test/resources/nest-fixtures/`
- [ ] T024 [P] Write the failing performance test: the 100-part / 5-sheet job returns a valid result or explicit reasons in under 2 seconds (SC-002) in `test/unit/nesting/trueShapePerformance.test.ts`
- [ ] T025 [P] Write the failing yield test: placed part area divided by consumed stock area is at least 85% on that same fixture; a below-floor run is a calibration defect and the threshold does not move (SC-003)
- [ ] T026 Calibrate `DEFAULT_SEARCH_BUDGET_FACTOR` until both T024 and T025 pass together without making the budget wall-clock dependent (FR-005, FR-007)
- [ ] T027 [P] Write the rotation and grain end-to-end assertions: only caller-permitted, grain-aligned angles appear in `placements[].rotation`, and no placement dimensions are scaled (FR-004) in `test/unit/nesting/trueShapeRotationsE2E.test.ts`
- [ ] T028 [P] Write the hole-hosting assertion: a smaller part placed inside a hole satisfies both the edge clearance to the hole contour and the part-to-part clearance to neighbouring instances (FR-001, FR-002, spec Edge Cases)

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Run `npm run validate:fixtures` and confirm the new benchmark fixture is well-formed
- [ ] T030 Run the constitution gates: `npm run type-check`, `npm run lint`, `npm run test:unit`, `npm run test:integration:node` — all must pass with no regression against the recorded baseline
- [ ] T031 Validate every scenario in `specs/002-true-shape-nesting/quickstart.md`, including the modified-seed consistency check
- [ ] T032 Document the new public entry point in the module header of `src/nesting/trueShape/index.ts` and in `src/nesting/index.ts`

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: no dependencies; T002–T004 are parallel
- **Foundational (Phase 2)**: depends on Setup; T005–T011 are parallel within the phase (test task before its implementation task)
- **US1 (Phase 3)**: depends on Foundational; T012–T017 are parallel; T018 depends on T011 and T015; T019 depends on T018; T020–T022 follow T019
- **Acceptance (Phase 4)**: T023 before T024/T025; T026 depends on T022 and both threshold tests
- **Polish (Phase 5)**: T030 last — it is the constitution gate and gates the commit

## Notes

- Tests MUST fail before implementation (Principle III)
- No new entry in `dependencies`; no persistence; no mutation of caller input (Principle V)
- Budget and tie-breaks stay input-derived and stable (Principle IV)
- Update these checkboxes only when the corresponding gate passes
