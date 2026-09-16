---
description: "Task list for feature 003-nesting-optimization-gpu"
---

# Tasks: Nesting Optimization and GPU Acceleration

**Input**: Design documents from `/specs/003-nesting-optimization-gpu/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED — Constitution III (Test-First, NON-NEGOTIABLE). Write tests first, ensure they FAIL
before implementation. Runner is Mocha + `tsx`: `npm run test:unit`, `npm run test:integration:node`.

**Organization**: Tasks grouped by user story. US1 (P1) is the MVP; US2 (P2) adds acceleration without
changing correctness or availability.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 or US2; setup/foundational/polish tasks carry no story label
- Every task names its exact file path

## Path Conventions

Single-project library: `src/`, `test/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Additive type/config surface and the new module skeleton.

- [X] T001 Add `OptimizationObjective`, `ExecutionBackend`, `ExecutionBackendReport` and the optional `objective?` / `acceleration?` fields on `NestRequest` plus optional `backend?` on `NestResponse` in `src/nesting/types.ts` (additive only — no existing signature may break, Constitution I)
- [X] T002 [P] Add `DEFAULT_OBJECTIVE_WEIGHTS` and `DEFAULT_ACCELERATION = true` to `src/nesting/config.ts` next to `EPSILON`
- [X] T003 [P] Create `src/nesting/optimization/index.ts` re-exporting `normalizeObjective`, `selectBackend`, `createBackendReport` and the WebGPU probe/scoring surface so the barrel carries real behavior, not organization only (Constitution I)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Objective validation/normalization and the backend report builder — both required before
either user story.

**⚠️ CRITICAL**: No user-story work begins until this phase is complete.

- [X] T004 Create `src/nesting/optimization/objective.ts`: validate exactly four finite weights (`materialUse`, `travel`, `sheetCount`, `remnant`), each `>= 0`; normalize to sum 1 comparing with `EPSILON`; reject negative, `NaN`, non-finite or all-zero with an explicit reason (never coerce)
- [X] T005 [P] Create `src/nesting/optimization/backend.ts`: build `ExecutionBackendReport` (`backend`, `requested`, `accelerated`, `fallbackReason?`, `timings: { scoringMs, totalMs }`); timings are measurement only, never a search budget
- [X] T006 Wire additive re-exports in `src/nesting/index.ts` and confirm the `src/index.ts` barrel still resolves; run `npm run type-check`

**Checkpoint**: Foundation ready — US1 and US2 can now proceed.

---

## Phase 3: User Story 1 - Choose a Repeatable Optimization Trade-off (Priority: P1) 🎯 MVP

**Goal**: A caller supplies four weights and a seed and gets a repeatable, valid, overlap-free result
showing the applied objective and achieved metrics.

**Independent Test**: Run one job with fixed weights and seed twice — identical layout and metrics, no
overlaps, invalid weights rejected with an explicit reason.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [X] T007 [P] [US1] RED `test/unit/nesting/optimization/objectiveWeights.test.ts`: invalid weights rejected explicitly; valid weights normalized to 1 ± `EPSILON`; omitted objective preserves feature-002 behavior
- [X] T008 [P] [US1] RED `test/unit/nesting/optimization/determinism.test.ts`: 100 consecutive equal requests with the same seed yield identical placements and metrics (SC-001); near-equal scores use a stable tie-break

### Implementation for User Story 1

- [X] T009 [US1] Add the weighted scoring hook in `src/nesting/trueShape/search.ts` — budget derived from the input (never wall-clock), `EPSILON` comparisons, stable index order
- [X] T010 [US1] Wire the objective into `nestTrueShape` in `src/nesting/trueShape/index.ts`; return the applied objective and achieved metrics
- [X] T011 [US1] Populate the CPU `ExecutionBackendReport` (`backend: 'cpu'`, `requested`, `accelerated: false`) through `src/nesting/optimization/backend.ts`
- [X] T012 [US1] Extend `test/integration/nesting/trueShapePipeline.test.ts` to assert the objective echo and zero overlaps (SC-002)

**Checkpoint**: US1 is fully functional and independently testable (MVP).

---

## Phase 4: User Story 2 - Benefit from Available Hardware (Priority: P2)

**Goal**: Large jobs run faster on capable hardware, with identical layout for the same seed and a
transparent CPU fallback when acceleration is unavailable, lost, or slow.

**Independent Test**: Run the reference job with acceleration available and unavailable — both pass the
same placement validation; the unavailable run completes on the CPU and reports the fallback reason.

### Tests for User Story 2 ⚠️ (write first, ensure they FAIL)

- [X] T013 [P] [US2] RED `test/unit/nesting/optimization/backendSelection.test.ts`: `acceleration` defaults to `true`; `false` pins `backend: 'cpu'` with `requested: false` and no adapter probe; absent adapter yields `cpu` with a populated `fallbackReason` (depends on T010)
- [X] T014 [P] [US2] RED `test/integration/nesting/gpuFallback.test.ts`: fallback completes and produces a layout identical to `acceleration: false`; a mid-run acceleration loss retries unfinished work on the CPU baseline without discarding completed placements (FR-006). Depends on T010 for the US1 entry point.

### Implementation for User Story 2

- [X] T015 [P] [US2] Create `src/nesting/optimization/webgpu/device.ts` — probe `globalThis.navigator?.gpu` at runtime using local structural interfaces only; no `any`/`unknown` in the core domain (Constitution V)
- [X] T016 [P] [US2] Create `src/nesting/optimization/webgpu/score.ts` — fixed-point candidate scoring kernel that consumes the same normalized weights from `objective.ts` as the CPU path and returns ordered proposals; the CPU keeps selection, tie-break and validation authority (Constitution IV, FR-001)
- [X] T017 [US2] Extend `src/nesting/optimization/backend.ts` selection: prefer `webgpu` when `acceleration !== false` and the probe succeeds; record an explicit `fallbackReason` otherwise (silent failure forbidden)
- [X] T018 [US2] Wire acceleration into `nestTrueShape` in `src/nesting/trueShape/index.ts`, resolving the same normalized objective as the CPU baseline (FR-001); the CPU re-validates every placement before it is emitted
- [X] T019 [US2] Enforce the SC-004 gate in `src/nesting/optimization/backend.ts`: abandon acceleration when it fails to reach ≥2× the baseline on the reference job, set `fallbackReason`, and never discard already-completed placements

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Acceptance measurement, documentation discipline, quality gates.

- [X] T020 [P] Add the reference job fixture (100 parts / 5 sheets) at `test/resources/nest-fixtures/reference-job-100x5.json` for SC-004
- [X] T021 Add the benchmark harness in `test/unit/nesting/optimization/sc004Benchmark.test.ts` asserting the baseline stays under 2 s and the accelerated path reaches ≥2×; record and skip the 2× gate where no adapter is present
- [X] T022 [P] Add sibling `*.doc.md` files for `src/nesting/optimization/*` and `src/nesting/optimization/webgpu/*`, and update `src/nesting/types.doc.md`
- [X] T023 Run the quality gates (`npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run test:integration:node`) and flip the corresponding checkboxes in `specs/003-nesting-optimization-gpu/tasks.md` only when each gate passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Setup — BLOCKS both user stories
- **US1 (Phase 3)**: depends on Phase 2; no dependency on US2
- **US2 (Phase 4)**: depends on Phase 2; integration point with US1 is `trueShape/index.ts` (T010 before T018)
- **Polish (Phase 5)**: depends on the desired user stories being complete

### Within Each User Story

- RED tests are written and FAIL before implementation
- `objective.ts`/`backend.ts` (Phase 2) before story wiring
- Scoring hook before entry-point wiring before integration assertions
- Story complete and validated before advancing to the next priority

### Story Dependencies

- **US1 (P1)**: after Foundational only — independent, MVP
- **US2 (P2)**: after Foundational; touches `trueShape/index.ts` after T010, otherwise independent and independently testable

---

## Parallel Example: User Story 1

```bash
# Launch both RED tests for US1 together:
task "RED objectiveWeights test in test/unit/nesting/optimization/objectiveWeights.test.ts"
task "RED determinism test in test/unit/nesting/optimization/determinism.test.ts"
```

## Parallel Example: User Story 2

```bash
# Launch both RED tests, then both GPU modules (different files):
task "RED backendSelection test in test/unit/nesting/optimization/backendSelection.test.ts"
task "RED gpuFallback test in test/integration/nesting/gpuFallback.test.ts"
task "device probe in src/nesting/optimization/webgpu/device.ts"
task "scoring kernel in src/nesting/optimization/webgpu/score.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1)
3. **STOP and VALIDATE**: determinism, weight validation, zero overlaps
4. Deliver — US1 alone is a shippable increment

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate independently → deliver (MVP)
3. US2 → validate fallback + cross-backend determinism → deliver
4. Polish → measure SC-004, close documentation, run gates

---

## Notes

- `[P]` = different files, no dependency on an incomplete task
- Verify each RED test fails before implementing; a passing-first test is a defect
- Determinism is non-negotiable: budget derived from the input, stable tie-break, CPU final authority
- No new runtime dependencies; no file over 500 lines; additive API only
- Commit after each task or logical group with Conventional Commits

## Phase 6: Convergence

- [X] T024 Wire the fixed-point accelerator kernel (`proposeOrder`/`fixedPointScore` from `src/nesting/optimization/webgpu/score.ts`) into the `nestTrueShape`/`searchBestArrangement` path when `selectBackend` returns `webgpu`, so `accelerated: true` is only reported after real accelerated scoring; until dispatch succeeds, report `accelerated: false` with an explicit `fallbackReason` per FR-004/FR-007, SC-002/SC-004
- [X] T025 Implement FR-006 lost/slow/invalid fallback in `src/nesting/optimization/backend.ts`/`src/nesting/trueShape/index.ts`: apply `meetsAccelerationGate`/`ACCELERATION_GAIN_FACTOR` to abandon acceleration failing the >=2x SC-004 gate, set `fallbackReason`, and retry the complete unfinished search on the CPU baseline without discarding the valid baseline result per FR-006, T019
- [X] T026 Remove or justify the no-op `selectionObjective` helper in `src/nesting/optimization/backend.ts` (`selection.requested ? objective : objective` returns `objective` in both branches) per Constitution II / comment discipline (unrequested)

## Phase 7: Convergence

- [X] T027 Wire the WebGPU executor: extend `src/nesting/optimization/webgpu/device.ts` with device dispatch (`requestAdapter`/`requestDevice`/compute pipeline) and invoke fixed-point scoring from `webgpu/score.ts` in the `nestTrueShape`/`searchBestArrangement` path when the backend is `webgpu`, keeping CPU re-validation of every placement per FR-004, FR-005, SC-002, T024
- [X] T028 Enforce the SC-004 >= 2x gate in `src/nesting/trueShape/index.ts`: after accelerated scoring compare `meetsAccelerationGate`/`ACCELERATION_GAIN_FACTOR` against the CPU baseline, and on failure set `fallbackReason`, revert `backend` to `cpu`, and finish the request on the baseline without discarding the valid baseline result per FR-006, SC-004, T025
- [X] T029 Report `backend: 'webgpu'` / `accelerated: true` only once the wired dispatch passes the SC-004 gate, removing the placeholder always-CPU fallback in `selectBackend` per FR-007, US2, T024

## Phase 8: Convergence

- [X] T030 Update stale source comments in `src/nesting/optimization/backend.ts` and `src/nesting/optimization/webgpu/device.ts` to document the implemented WebGPU compute dispatch, CPU parity validation and SC-004 fallback gate per plan: documentation accuracy
