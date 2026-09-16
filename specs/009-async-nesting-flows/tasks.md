---

description: "Task list for Async Nesting Flows"

---

# Tasks: Async Nesting Flows

**Input**: Design documents from `/specs/009-async-nesting-flows/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/nesting-observable-api.ts](./contracts/nesting-observable-api.ts), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED. Constitution Principle III (Test-First, NON-NEGOTIABLE) and the spec's Success
Criteria are test-verifiable, so every story phase opens with failing tests.

**Organization**: Phases map to the three user stories in `spec.md`. US1 and US2 are both P1 and ship
together (MVP, see `spec.md` Assumptions); US3 (P2) adds cancellation and explicit outcomes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: `US1`, `US2`, `US3` (setup/foundational/polish tasks carry no story label)
- Every task names the exact file path it touches

## Path Conventions

Single-project library: `src/` and `test/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directories and the frozen baseline the whole feature is measured against.

- [X] T001 Create the new source and test directories `src/nesting/async/` and `test/unit/nesting/async/`
- [X] T002 [P] Capture the enumerated reference job set (`parsed-dxf-simple`, `raw-dxf-preset`, `true-shape-mixed`, `part-prep-boundary`; seed `20260101` each) as 7.7.6 golden fixtures in `test/integration/nesting/fixtures/`, creating that directory; record only placement decisions, `unplaced`/`issues` reasons and metrics (exclude `processingTimeMs` and `backend.timings`) — spec.md Assumptions, research R5
- [X] T003 [P] Confirm `rxjs@^7.8.2` is declared in `package.json` `dependencies` and `package.json` `version` is `8.0.0` (FR-010, ADR-0001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The Observable wrapper and the cancellation seam. Every in-scope flow depends on it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Write the failing unit tests for the wrapper — laziness (no work before `subscribe`), cold per subscription, exactly one `next` then `complete`, silent teardown on `unsubscribe` (no `next`/`complete`/`error`), contract violation becomes an `error` notification — in `test/unit/nesting/async/observableFlow.test.ts` (FR-001, FR-007, FR-009, FR-011, SC-007)
- [X] T005 Implement `observeFlow<T>(factory: (signal: AbortSignal) => Promise<T>): Observable<T>` using `defer(() => new Observable<T>(subscriber => { ... }))` with an internal `AbortController` aborted in the teardown callback, in `src/nesting/async/observableFlow.ts` (research R1/R2)
- [X] T006 Export `observeFlow` and its types from `src/nesting/async/index.ts`
- [X] T007 [P] Add an optional `signal?: AbortSignal` to the flow option/request types in `src/nesting/types.ts` (`NestingOptions`, `NestRequest`) and `src/nest/types.ts` (`NestOptions`), leaving all other fields and defaults unchanged (research R2)
- [X] T008 [P] Write the contract test asserting all eight in-scope exports return an RxJS `Observable` (and not a `Promise`) and that the out-of-scope names (`toNestedSvg`, `toNestedDxf`, `extractShapes`, `sortShapes`, `packMultiSheet`, `searchBestArrangement`, `analyzeShapes`) stay synchronous, in `test/unit/nesting/async/contracts.test.ts` (FR-001, SC-001)

**Checkpoint**: Wrapper is green; flows can be converted one file at a time.

---

## Phase 3: User Story 1 - Compose Every Nesting Flow As An Observable (Priority: P1) 🎯 MVP

**Goal**: All eight in-scope flows return a lazy, cold `Observable<T>`; the whole nesting journey composes with RxJS operators and no `await` or manual bridging.

**Independent Test**: Subscribe to each of the eight flows from the public export surface (`nest`, `nestFromDxf`, `NestingHelper`, `nestTrueShape`, `prepareParts` from `src/nesting/index.ts`; `nestDXF`, `nestWithPreset`, `quickNest` from `src/index.ts`) and assert exactly one complete emission then `complete`, with no pipeline work at the call site (quickstart scenario 1).

### Tests for User Story 1

> Write these first and confirm they FAIL against the current `Promise` surface.

- [X] T009 [P] [US1] Unit tests for `nest` and `nestFromDxf` laziness and single emission in `test/unit/nesting/async/applyNesting.observable.test.ts`
- [X] T010 [P] [US1] Unit tests for `nestDXF`, `nestWithPreset` and `quickNest` in `test/unit/nesting/async/nestDxf.observable.test.ts`
- [X] T011 [P] [US1] Unit tests for `NestingHelper.nest` in `test/unit/nesting/async/nestingHelper.observable.test.ts`, including the synchronous `nestingResult`, `shapes`, `toNestedSvg` and `toNestedDxf` accessors after emission (`contracts/nesting-observable-api.ts` `NestingHelperContract`)
- [X] T012 [P] [US1] Unit tests for `nestTrueShape` in `test/unit/nesting/async/trueShape.observable.test.ts`
- [X] T013 [P] [US1] Unit tests for `prepareParts` in `test/unit/nesting/async/partPrep.observable.test.ts`
- [X] T014 [P] [US1] Integration test composing two stages with RxJS operators (`switchMap`/`map`) and asserting stage-to-stage payload delivery with no `await`, in `test/integration/nesting/observableComposition.test.ts` (US1.2)

### Implementation for User Story 1

- [X] T015 [US1] Convert `nest` and `nestFromDxf` to `observeFlow(...)` returning `Observable<NestingResult>` in `src/nesting/applyNesting.ts`, reusing the existing pipeline body verbatim
- [X] T016 [US1] Convert `nestDXF`, `nestWithPreset` and `quickNest` to `observeFlow(...)` returning `Observable<NestDxfResult>` in `src/nest/index.ts` (progress printing of `metricsSummary()` must happen on `subscribe`, not at the call site)
- [X] T017 [US1] Convert `NestingHelper.nest` to return `Observable<NestingResult>` in `src/nesting/NestingHelper.ts` while keeping the synchronous `nestingResult`, `shapes`, `toNestedSvg` and `toNestedDxf` accessors working (populated on emission)
- [X] T018 [US1] Convert `nestTrueShape(request)` to return `Observable<NestResponse>` in `src/nesting/trueShape/index.ts`
- [X] T019 [US1] Convert `prepareParts(dxf, options)` to return `Observable<PrepareResult>` in `src/nesting/pro/partPrep/index.ts`
- [X] T020 [US1] Add the root-barrel export for `nestDXF`, `nestWithPreset` and `quickNest` in `src/index.ts` (today only `./nesting/index` is re-exported), verify no import cycle is introduced between `src/nest/index.ts` and `src/nesting/async/`, and re-export the Observable result types from `src/nesting/index.ts` (plan Structure, research R7)
- [X] T021 [US1] Migrate the CLI call site to `firstValueFrom(...)` in `src/cli-nest.ts` (line ~152 `await nestDXF(dxfText, options)`)
- [X] T022 [P] [US1] Migrate the pre-existing unit test call sites to `firstValueFrom(...)` in `test/unit/nesting/**` (`integration.test.ts`, `trueShape*.test.ts`, `optimization/*.test.ts` — 17 files)
- [X] T023 [P] [US1] Migrate the pre-existing integration test call sites to `firstValueFrom(...)` in `test/integration/nesting/**` (`gpuFallback.test.ts`, `trueShapePipeline.test.ts`, `trueShapeQuickstart.test.ts`)
- [X] T024 [P] [US1] Migrate the pre-existing preparation test call sites to `firstValueFrom(...)` in `test/unit/preparation/**` (`convergence.test.ts`, `perf.test.ts`, `prepareParts.test.ts`, `warnings.test.ts`)
- [X] T025 [US1] Update the co-located docs for the Observable signatures: `src/nesting/index.doc.md`, `src/nesting/types.doc.md`, `src/nesting/trueShape/index.doc.md`, and create `src/nesting/async/index.doc.md` + `src/nesting/async/observableFlow.doc.md` for the new module (Constitution Documentation Discipline). `src/nest/` has no `.doc.md` siblings, so no `src/nest/index.doc.md` is created

**Checkpoint**: US1 fully functional and independently testable; the full suite compiles.

---

## Phase 4: User Story 2 - Identical Results Under The Observable Surface (Priority: P1)

**Goal**: The Observable form reproduces the frozen 7.7.6 baseline exactly, stays deterministic, and each `subscribe` recomputes.

**Independent Test**: Run the enumerated reference job set through the Observable surface and the T002 fixtures with identical input and seed; placement decisions, reasons and metrics must be equal (quickstart scenarios 2 and 3).

### Tests for User Story 2

- [X] T026 [P] [US2] Baseline-parity integration test diffing each emission against the T002 fixtures for all four jobs (including `unplaced`/`issues` reasons and metrics, excluding measurement-only timing fields) in `test/integration/nesting/observableParity.test.ts` (FR-002, SC-002)
- [X] T027 [P] [US2] Coldness test asserting two subscriptions to the same Observable run the pipeline twice and emit identical results for the same input and seed, and that no `share`/`shareReplay`/`Subject` is used, in `test/unit/nesting/async/coldness.test.ts` (FR-011, SC-008)
- [X] T028 [P] [US2] Determinism test asserting repeated runs with identical input and seed produce identical placements in `test/unit/nesting/async/determinism.observable.test.ts` (FR-003, SC-003)
- [X] T029 [P] [US2] Immutability test passing `Object.freeze`d inputs to every in-scope flow and asserting the emission still succeeds and the input is structurally unchanged, in `test/unit/nesting/async/immutability.test.ts` (FR-006)
- [X] T030 [P] [US2] Fallback-reporting test asserting the accelerator fallback reason survives into the emission and the flow completes on the baseline path, in `test/unit/nesting/async/fallback.observable.test.ts` (FR-008, SC-005)

### Implementation for User Story 2

- [X] T031 [US2] Audit the eight flows and remove any wall-clock use as a search bound, keeping `processingTimeMs`/`backend.timings` measurement-only, across `src/nesting/applyNesting.ts`, `src/nest/index.ts`, `src/nesting/trueShape/index.ts` and `src/nesting/pro/partPrep/index.ts` (FR-003, SC-003)
- [X] T032 [US2] Verify seed pass-through is unchanged end to end and that no memoisation/caching was introduced in `src/nesting/async/observableFlow.ts` (research R6)
- [X] T033 [US2] Fix any remaining call-site regressions left after T022–T024 so the pre-existing suite compiles and passes again (SC-004)

**Checkpoint**: US1 and US2 both hold — outputs provably unchanged.

---

## Phase 5: User Story 3 - Explicit Failure And No Wasted Work On Unsubscribe (Priority: P2)

**Goal**: Every item that cannot be processed carries an explicit reason on the emission; abandoning a flow tears it down silently and leaves no residue.

**Independent Test**: Trigger unprocessable input and assert the reason is on the emitted value; start a long flow, unsubscribe, and assert nothing is emitted and a later flow is unaffected (quickstart scenarios 4, 5 and 7).

### Tests for User Story 3

- [X] T034 [P] [US3] Cancellation test asserting `unsubscribe` mid-flight emits no `next`, no `complete`, no `error`, and that a subsequent flow reusing the same helper emits the baseline result, in `test/unit/nesting/async/cancellation.test.ts` (FR-007, SC-006)
- [X] T035 [P] [US3] Explicit-outcome test asserting unplaceable items and part-prep `issues` appear with a specific reason on the emission and never as an `error` notification, in `test/unit/nesting/async/explicitOutcome.test.ts` (FR-004, SC-005)
- [X] T036 [P] [US3] Error-contract test asserting invalid request/options produce a single `error` notification with a descriptive message and no `next`, in `test/unit/nesting/async/errorContract.test.ts` (FR-009)
- [X] T037 [P] [US3] Shared-state test asserting `resetNestingState()` clears the state used by `nest`/`nestFromDxf` (`src/nesting/applyNesting.ts:258`) and that no residue from a cancelled or completed run changes the next flow's result, in `test/unit/nesting/async/sharedState.test.ts` (FR-007, SC-006)
- [X] T038 [P] [US3] Integration test asserting unsubscribe-then-rerun isolation across flows, including concurrent overlapping flows, in `test/integration/nesting/cancellationRecovery.test.ts`

### Implementation for User Story 3

- [X] T039 [US3] Check `signal.aborted` at the stage boundaries of `nest`/`nestFromDxf` (extraction, sort, per-sheet pack loop) in `src/nesting/applyNesting.ts` and stop early
- [X] T040 [US3] Check `signal.aborted` in the true-shape search iteration loop in `src/nesting/trueShape/index.ts`
- [X] T041 [US3] Check `signal.aborted` in the part-preparation loop in `src/nesting/pro/partPrep/index.ts`
- [X] T042 [US3] Check `signal.aborted` in the part-based pipeline stages in `src/nest/index.ts` and `src/nest/nestCore.ts`
- [X] T043 [US3] Ensure teardown discards partially computed state in `src/nesting/NestingHelper.ts` and audit `resetNestingState` in `src/nesting/applyNesting.ts` so no shared state survives a cancelled run (FR-007)

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T044 [P] Walk every scenario in [quickstart.md](./quickstart.md) (1–7) and record the observed result in that file
- [X] T045 [P] Add the 8.0.0 breaking-change migration note (Promise → Observable, `firstValueFrom` bridge) to `README.md`
- [X] T046 Run `npm run type-check` and `npm run lint` and resolve any finding (Constitution quality gates 1–2)
- [X] T047 Run `npm run test:unit`, `npm run test:integration:node` and `npm run test:integration:browser` and confirm all green (gate 3)
- [X] T048 [P] Confirm governance coherence: `package.json` `8.0.0`, `rxjs` in `dependencies`, `.specify/adr/ADR-0001-observable-nesting-surface.md` accepted, `.specify/memory/constitution.md` at `2.0.0`
- [X] T049 Remove now-dead `Promise`-only helpers and unused exports introduced by the conversion (deletion over addition)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; BLOCKS all user stories
- **User Stories (Phases 3–5)**: depend on Foundational
- **Polish (Phase 6)**: depends on the desired stories being complete

### User Story Dependencies

- **US1 (P1)**: starts after Foundational; no dependency on US2/US3. Its conversions T015–T019 are the prerequisite for US2 and US3.
- **US2 (P1)**: starts after Foundational, but its parity/coldness tests can only run once T015–T019 exist. US2 depends on US1 by necessity — the spec's "independently testable" claim means US2's assertions stand alone, not that it can be implemented first. MVP = US1 + US2.
- **US3 (P2)**: starts after Foundational; cancellation wiring T039–T043 depends on the US1 conversions T015–T019.

### Within Each User Story

- Tests first and failing before implementation
- Wrapper/plumbing before per-flow conversion
- Per-flow conversion before barrels, call-site migration and docs
- Story complete before moving to the next priority

### Parallel Opportunities

- T002, T003 in parallel (different files)
- T004, T007, T008 in parallel within Foundational
- T009–T014 in parallel (distinct test files)
- T015–T019 mostly parallel: five independent modules
- T022, T023, T024 in parallel (distinct test directories)
- T026–T030 in parallel (distinct test files)
- T034–T038 in parallel (distinct test files)
- T044, T045, T048, T049 in parallel (distinct files)

---

## Parallel Example: User Story 1

```bash
# Tests first (all fail against the Promise surface):
Task: "Unit tests for nest/nestFromDxf in test/unit/nesting/async/applyNesting.observable.test.ts"
Task: "Unit tests for nestDXF/nestWithPreset/quickNest in test/unit/nesting/async/nestDxf.observable.test.ts"
Task: "Unit tests for NestingHelper.nest + sync accessors in test/unit/nesting/async/nestingHelper.observable.test.ts"
Task: "Unit tests for nestTrueShape in test/unit/nesting/async/trueShape.observable.test.ts"
Task: "Unit tests for prepareParts in test/unit/nesting/async/partPrep.observable.test.ts"

# Then the five module conversions:
Task: "Convert nest/nestFromDxf in src/nesting/applyNesting.ts"
Task: "Convert nestDXF/nestWithPreset/quickNest in src/nest/index.ts"
Task: "Convert NestingHelper.nest in src/nesting/NestingHelper.ts"
Task: "Convert nestTrueShape in src/nesting/trueShape/index.ts"
Task: "Convert prepareParts in src/nesting/pro/partPrep/index.ts"

# Then the existing call sites (parallel by directory):
Task: "Migrate src/cli-nest.ts to firstValueFrom"
Task: "Migrate test/unit/nesting/** to firstValueFrom"
Task: "Migrate test/integration/nesting/** to firstValueFrom"
Task: "Migrate test/unit/preparation/** to firstValueFrom"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Phase 1 Setup → Phase 2 Foundational (wrapper green)
2. Phase 3 US1 → all eight flows return a lazy cold Observable; suite compiles again
3. Phase 4 US2 → baseline parity, coldness, determinism proven
4. **STOP and VALIDATE** against quickstart scenarios 1–3
5. Deploy/demo — US2 is a P1 correctness gate, so the surface does not ship without it

### Incremental Delivery

1. Setup + Foundational → wrapper ready
2. US1 → Observable surface
3. US2 → output parity proven (MVP complete here)
4. US3 → cancellation and explicit outcomes (P2)
5. Polish → docs, gates, dead-code removal

---

## Notes

- `[P]` = different files, no in-flight dependency
- Every task carries an exact path so it is executable without extra context
- Test tasks must fail before the matching implementation task
- Commit after each logical group; the version bump is a deliberate breaking change authorized by ADR-0001
- Out of scope and MUST stay synchronous: `toNestedSvg`, `toNestedDxf`, `extractShapes`, `sortShapes`, `packMultiSheet`, `searchBestArrangement`, `analyzeShapes`
- The 22 pre-existing test files that call the in-scope flows are migrated by T022–T024; nothing else in the repository calls them (`src/cli-nest.ts` is covered by T021)
