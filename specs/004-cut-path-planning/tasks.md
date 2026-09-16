---

description: "Implementation tasks for cut-path planning"
---

# Tasks: Cut-Path Planning

**Input**: Design documents from `/specs/004-cut-path-planning/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/cut-path-planning.md`, `quickstart.md`

**Tests**: Required by the project constitution. Every behavior task follows Red → Green →
Refactor and must include a focused failing test before implementation.

**Organization**: Tasks are grouped by user story. This feature has one P1 story, so the MVP
contains the complete planner and its independent acceptance coverage.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the feature-local source and test structure without changing existing
behavior.

- [X] T001 Create the feature-local `src/nesting/cutPath/` module and `test/unit/nesting/cutPath/` test directory per `specs/004-cut-path-planning/plan.md`
- [X] T002 [P] Add source-adjacent documentation placeholders for planned public cut-path files in `src/nesting/cutPath/*.doc.md`
- [X] T003 [P] Add the cut-path barrel export scaffold in `src/nesting/cutPath/index.ts` and reserve the public re-export path in `src/nesting/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define reusable types and shared geometry contracts required by every user-story task.

**Critical**: User Story 1 implementation cannot begin until this phase is complete.

- [X] T004 Define `CutLayout`, `CutContour`, `CutProcessProfile`, sequence, lead, pierce, tab, overcut and clearance types in `src/nesting/cutPath/types.ts` using existing `Point2D`, `NestableShape`, `Placement`, `StockItem` and `StockSheet`
- [X] T005 [P] Define `CutAction`, `CutPlan`, `CutPathProblem` and `CutPlanResult` in `src/nesting/cutPath/types.ts` with JSDoc, stable validation codes and structured metrics
- [X] T006 [P] Add structural input guards and explicit invalid-input errors in `src/nesting/cutPath/validate.ts` for missing sheet references, duplicate contour IDs, invalid dimensions and malformed profiles
- [X] T007 Implement reusable transformed-contour, route-distance and sheet-bounds helpers in `src/nesting/cutPath/geometry.ts` by composing `src/nesting/polygonUtils.ts`, `src/nesting/collision.ts` and `src/nesting/config.ts` `EPSILON`
- [X] T008 Add foundational type and geometry tests in `test/unit/nesting/cutPath/types.test.ts` and `test/unit/nesting/cutPath/geometry.test.ts`, verifying immutability and deterministic calculations before implementation
- [X] T009 Export the foundational cut-path types and helpers from `src/nesting/cutPath/index.ts` and `src/nesting/index.ts`, updating `src/nesting/index.doc.md` and the matching `src/nesting/cutPath/*.doc.md`

**Checkpoint**: The cut-path contracts, reusable geometry, structural validation and public export
surface are ready for the story implementation.

---

## Phase 3: User Story 1 - Plan a Safe Cut Sequence (Priority: P1) 🎯 MVP

**Goal**: Produce a deterministic, machine-independent cut plan that keeps inner contours before
outer contours, emits configured process actions, validates unsafe geometry and reduces rapid travel.

**Independent Test**: Plan a placed part with holes and an outer contour using a profile with
lead, pierce and tabs; assert safe ordering, expected action markers, in-bounds travel, structured
validation failures and at least 20% rapid-distance improvement on the reference layouts.

### Tests for User Story 1

> Write each test first and confirm it fails for the expected reason before implementing the
> corresponding behavior.

- [X] T010 [P] [US1] Add contract tests for `planCutPath` inputs, immutability and structured results in `test/unit/nesting/cutPath/plan.test.ts`
- [X] T011 [P] [US1] Add deterministic inner-before-outer and baseline travel tests in `test/unit/nesting/cutPath/sequence.test.ts`
- [X] T012 [P] [US1] Add validation tests for bounds, rapid-over-kept-material, invalid leads, invalid tabs and rejected common lines in `test/unit/nesting/cutPath/validate.test.ts`
- [X] T013 [P] [US1] Add action-generation tests for rapid, pierce, lead-in, cut, lead-out, overcut, tab and end actions in `test/unit/nesting/cutPath/actions.test.ts`

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement deterministic contour grouping, containment ordering, nearest-neighbour sequencing and bounded stable 2-opt in `src/nesting/cutPath/sequence.ts`
- [X] T015 [P] [US1] Implement pierce-point, lead-in/out, tab and overcut candidate generation in `src/nesting/cutPath/entries.ts` using profile clearance rules and existing polygon helpers
- [X] T016 [US1] Implement rapid, pierce, lead, cut, overcut, tab and end action generation in `src/nesting/cutPath/plan.ts` using `CutProcessProfile` and `CutAction`
- [X] T017 [US1] Implement route, lead, tab, bounds and common-line geometric validation in `src/nesting/cutPath/validate.ts`, returning stable `CutPathProblem` entries without silently dropping actions
- [X] T018 [US1] Implement `planCutPath` orchestration in `src/nesting/cutPath/plan.ts`, including baseline/optimized rapid metrics, error-level validity and structural-input exception handling
- [X] T019 [US1] Complete public exports and source-adjacent documentation for the implemented cut-path API in `src/nesting/cutPath/index.ts`, `src/nesting/index.ts`, `src/nesting/index.doc.md` and `src/nesting/cutPath/*.doc.md`
- [X] T020 [US1] Run the User Story 1 acceptance suite and fix any ordering, validation, determinism or travel-threshold failures in `test/unit/nesting/cutPath/`

**Checkpoint**: User Story 1 is independently functional when all cut-path unit tests pass and
the quickstart acceptance scenarios are verified.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against repository-wide quality gates and keep design
artifacts consistent with the implementation.

- [X] T021 [P] Update the consolidated cut-path data model and contract documentation in `specs/004-cut-path-planning/data-model.md` and `specs/004-cut-path-planning/contracts/cut-path-planning.md` if implementation details require clarification
- [X] T022 [P] Update `specs/004-cut-path-planning/quickstart.md` with the final runnable test selectors and measured SC-001 through SC-003 evidence
- [X] T023 Run `yarn type-check` and resolve all TypeScript errors in `src/nesting/cutPath/` and affected barrels
- [X] T024 Run `yarn lint` and resolve all lint errors in changed source files
- [X] T025 Run `yarn test:unit` and confirm no regression against the existing suite
- [X] T026 Run the feature quickstart validation and record the measured 20% travel-reduction threshold in `specs/004-cut-path-planning/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 can start immediately, while T002 and T003 can run in parallel after the directory exists.
- **Foundational (Phase 2)**: Depends on T001; T004–T008 establish the shared contracts and geometry before story work.
- **User Story 1 (Phase 3)**: Depends on T004–T009. Tests T010–T013 must be written and fail before T014–T018 implement the behavior.
- **Polish (Phase 4)**: Depends on the User Story 1 checkpoint and all acceptance tests passing.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on the Foundational phase; no other user stories exist.

### Within User Story 1

- T010–T013 are parallel test authoring tasks.
- T014 and T015 can run in parallel because they use separate implementation files.
- T016 depends on T014 and T015.
- T017 can begin after T007 and T012, then T018 integrates all planner behavior.
- T019 follows the final public API shape from T018.
- T020 follows T016–T019.

## Parallel Execution Examples

### Foundational phase

```text
Task T005: Define public cut action and result types in src/nesting/cutPath/types.ts
Task T006: Add structural input guards in src/nesting/cutPath/validate.ts
Task T007: Add reusable geometry helpers in src/nesting/cutPath/geometry.ts
```

### User Story 1 tests

```text
Task T010: Test the planCutPath contract
Task T011: Test deterministic sequence ordering and travel baseline
Task T012: Test validation problem codes and messages
Task T013: Test generated action kinds
```

### User Story 1 implementation

```text
Task T014: Implement contour sequencing in src/nesting/cutPath/sequence.ts
Task T015: Implement entry and tab candidates in src/nesting/cutPath/entries.ts
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Write and fail the User Story 1 tests.
3. Implement safe inner-first sequencing, action generation and structured validation.
4. Validate the independent story and the 20% travel-reduction criterion.
5. Stop at the User Story 1 checkpoint before optional refinements.

### Incremental Delivery

1. Deliver the foundational public types and reusable geometry.
2. Deliver a valid inner-first plan with process actions.
3. Add validation coverage for unsafe routes, leads, tabs and common lines.
4. Add deterministic travel optimization and measured acceptance evidence.
5. Run the full repository gates before commit.

### Notes

- `[P]` tasks touch separate files and have no dependency on incomplete work.
- `[US1]` maps tasks to the P1 user story in `spec.md`.
- Every task includes at least one concrete repository path.
- No task may mutate caller-owned layout/profile objects or introduce a runtime dependency.

---

## Phase 5: Convergence

- [X] T027 Return the measured optimized rapid distance instead of clamping it to the baseline in `src/nesting/cutPath/plan.ts` and make SC-002 validation use the actual route metrics per SC-002 (contradicts)
- [X] T028 Replace literal floating-point tolerances with `EPSILON` in `src/nesting/cutPath/sequence.ts` and `src/nesting/cutPath/entries.ts`, adding regression coverage for stable tie-breaking and zero-length segments per Constitution precision (contradicts)
- [X] T029 Implement geometric verification for enabled common-line candidates in `src/nesting/cutPath/validate.ts`, accepting valid shared edges and returning `COMMON_LINE_REJECTED` only for invalid candidates per FR-007 (partial)

## Phase 6: Convergence

- [X] T030 Define and implement complete multi-sheet cut-plan results and correctly aggregated baseline/optimized metrics for the one-or-more-sheets scope in `src/nesting/cutPath/types.ts`, `src/nesting/cutPath/plan.ts` and `test/unit/nesting/cutPath/plan.test.ts` per FR-001 and plan multi-sheet scope (partial)
- [X] T031 Preserve the signed measured improvement ratio and make the SC-002 travel-reduction threshold explicit and testable without clamping regressions in `src/nesting/cutPath/plan.ts` and `test/unit/nesting/cutPath/sequence.test.ts` per SC-002 and Constitution precision (partial)
- [X] T032 Validate generated pierce points against configured clearance and return an actionable structured problem when entry clearance is violated in `src/nesting/cutPath/validate.ts`, `src/nesting/cutPath/plan.ts` and `test/unit/nesting/cutPath/validate.test.ts` per FR-004 and US1/AC2 (partial)
- [X] T033 Define and implement the machine-independent action/plan behavior for geometrically verified common-line candidates while continuing to reject invalid candidates in `src/nesting/cutPath/plan.ts`, `src/nesting/cutPath/types.ts` and `test/unit/nesting/cutPath/actions.test.ts` per FR-007 and the shared-edge edge case (partial)
- [X] T034 Record measured SC-001–SC-003 evidence in `specs/004-cut-path-planning/quickstart.md` and reconcile completed T001–T026 task markers after the required gates pass per T022, T026 and Constitution workflow (partial)
