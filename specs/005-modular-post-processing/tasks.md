---

description: "Task list for modular laser and plasma post-processing"
---

# Tasks: Modular Laser and Plasma Post-Processing

**Input**: Design documents from `specs/005-modular-post-processing/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/post-processing.md`,
and `quickstart.md`

**Tests**: Required by the project constitution. Every behavior task follows Red → Green → Refactor
with Mocha + `tsx`.

## Phase 1: Setup

**Purpose**: Establish the feature module and reviewed fixture locations without adding dependencies.

- [X] T001 Create the post-processing source directory structure under `src/nesting/post/` and its feature test directories under `test/unit/nesting/post/` and `test/resources/gcode/`.
- [X] T002 [P] Record the approved Hypertherm reference source and revision in `docs/nesting/POST-PROCESSORS.md`, citing `docs/Hypertherm EDGE PRO Programmer reference.md`.
- [X] T003 [P] Add the initial fixture directories `test/resources/gcode/generic-laser/`, `test/resources/gcode/generic-plasma/`, and `test/resources/gcode/edge-connect/809550-rev6/`.

## Phase 2: Foundational

**Purpose**: Implement shared contracts and deterministic infrastructure required by every processor.

**Checkpoint**: Registry, domain types, validation issues, writer, canonicalization, and curve normalization are available before processor-specific work begins.

- [X] T004 [P] Write failing public contract and profile-validation tests for processor registration, exact `(id, revision)` selection, duplicate rejection, unknown-processor errors, profile fields, capabilities, bounds, movement, feed, entries, and process settings in `test/unit/nesting/post/registry.test.ts` and `test/unit/nesting/post/profile-validation.test.ts`.
- [X] T005 [P] Write failing canonicalization tests for CRLF/CR normalization, trailing whitespace, final newline, preserved line order, and preserved numeric tokens in `test/unit/nesting/post/canonicalize.test.ts`.
- [X] T006 [P] Write failing G-code writer tests for words, comments, line endings, numeric formatting, negative zero, and deterministic output in `test/unit/nesting/post/gcode-writer.test.ts`.
- [X] T007 [P] Write failing curve linearization tests for approved tolerance, deterministic segment order, unsupported missing tolerance, and epsilon-based termination in `test/unit/nesting/post/linearize.test.ts`.
- [X] T008 Define public post-processing types for `MachineProfile`, `PostProcessor`, `PostProcessorSummary`, `ValidationIssue`, `MachineProgram`, and processing context in `src/nesting/post/types.ts`.
- [X] T009 Implement the versioned processor registry and exact profile resolution in `src/nesting/post/registry.ts`.
- [X] T010 Implement the tokenized deterministic G-code writer in `src/nesting/post/gcode/writer.ts`.
- [X] T011 Implement canonical G-code normalization without command sorting or semantic rewriting in `src/nesting/post/canonicalize.ts`.
- [X] T012 Implement deterministic curve linearization using the machine profile tolerance and repository `EPSILON` in `src/nesting/post/linearize.ts`.
- [X] T013 Implement shared profile, cut-plan, capability, feed, process-setting, and emitted-program validation in `src/nesting/post/validate.ts`.
- [X] T014 Export the foundational post-processing types and utilities from `src/nesting/post/index.ts` and `src/nesting/index.ts`.

## Phase 3: User Story 1 - Release a Machine-Compatible Program (Priority: P1) 🎯 MVP

**Goal**: Translate one valid machine-independent `CutPlan` into reviewed laser, plasma, or EDGE Connect G-code while rejecting unsupported or invalid programs.

**Independent Test**: Submit the same valid `CutPlan` to approved laser, plasma, and EDGE Connect profiles; verify each result contains the expected processor metadata and canonical G-code. Submit invalid feeds, unsupported capabilities, unsupported curves without tolerance, and changed expected output; verify every result is not releasable and contains explicit issues.

### Tests for User Story 1

> Write each test first and verify it fails for the intended reason before implementing the behavior.

- [X] T015 [P] [US1] Write failing release-orchestration tests for valid output, metadata, error blocking, and immutable inputs in `test/unit/nesting/post/release.test.ts`.
- [X] T016 [P] [US1] Write failing generic laser processor tests for rapid, pierce, lead, cut, tab, and end actions in `test/unit/nesting/post/generic-laser.test.ts`.
- [X] T017 [P] [US1] Write failing generic plasma processor tests for pierce dwell, feed, torch, and THC capability handling in `test/unit/nesting/post/generic-plasma.test.ts`.
- [X] T018 [P] [US1] Write failing Hypertherm EDGE Connect tests for directly supported EIA `G00`, `G01`, axis words, comments, and line-number output in `test/unit/nesting/post/edge-connect.test.ts`.
- [X] T019 [P] [US1] Add reviewed golden G-code for generic laser scenarios in `test/resources/gcode/generic-laser/1/`.
- [X] T020 [P] [US1] Add reviewed golden G-code for generic plasma scenarios in `test/resources/gcode/generic-plasma/1/`.
- [X] T021 [P] [US1] Add reviewed EDGE Connect golden G-code for revision `809550-rev6` in `test/resources/gcode/edge-connect/809550-rev6/`.

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement shared G-code action emission and result metadata in `src/nesting/post/process.ts`.
- [X] T023 [P] [US1] Implement the generic laser processor using the shared writer and approved action mappings in `src/nesting/post/processors/generic-laser.ts`.
- [X] T024 [P] [US1] Implement the generic plasma processor with process settings, pierce dwell, and THC validation in `src/nesting/post/processors/generic-plasma.ts`.
- [X] T025 [US1] Implement Hypertherm EDGE Connect processor revision `809550-rev6` using only the directly supported EIA RS-274D subset from `docs/Hypertherm EDGE PRO Programmer reference.md` in `src/nesting/post/processors/edge-connect.ts`.
- [X] T026 [US1] Register approved generic laser, generic plasma, and EDGE Connect processors and expose `generateMachineProgram` from `src/nesting/post/index.ts`.
- [X] T027 [US1] Add public nesting-barrel exports for post-processing types and operations in `src/nesting/index.ts`.
- [X] T028 [US1] Make release orchestration compare canonicalized output with processor/revision-specific fixtures and block every validation error or mismatch in `src/nesting/post/process.ts`.

**Checkpoint**: User Story 1 is independently testable when all three approved processors pass their unit tests, golden comparisons, type-check, and lint.

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation, compatibility checks, and acceptance validation.

- [X] T029 [P] Update the consolidated post-processor documentation with the implemented public API, EDGE Connect scope, unsupported-code behavior, and no-force-release rule in `docs/nesting/POST-PROCESSORS.md`.
- [X] T030 [P] Add source-adjacent API documentation for the post-processing module in `src/nesting/post/index.doc.md`.
- [X] T031 [P] Add the quickstart acceptance test covering laser, plasma, EDGE Connect, invalid release, curve linearization, and exact canonical comparison in `test/unit/nesting/post/quickstart.test.ts`.
- [X] T032 Run `yarn type-check`, `yarn lint`, `yarn test:unit`, and `git diff --check`; record successful acceptance in `specs/005-modular-post-processing/quickstart.md` and verify that input-derived budgets are deterministic.
- [X] T033 Review every EDGE Connect command against `docs/Hypertherm EDGE PRO Programmer reference.md`; remove or reject unsupported inferred code and document approved equivalents in `src/nesting/post/processors/edge-connect.ts`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002 and T003 can run in parallel after T001 creates the directories.
- **Foundational (Phase 2)**: Depends on T001; tests T004–T007 can run in parallel, then T008–T014 implement the shared boundary.
- **User Story 1 (Phase 3)**: Depends on foundational exports T008–T014; all story tests T015–T021 should be written before implementation T022–T028.
- **Polish (Phase 4)**: Depends on the complete User Story 1 implementation and reviewed fixtures.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on another user story; it is the complete MVP.

### Critical Within-Story Dependencies

- T008 → T009, T010, T011, T012, T013
- T009–T013 → T014
- T014 → T015–T021 test execution
- T015–T021 failing tests → T022–T028 implementation
- T022–T028 → T029–T033

## Parallel Execution Examples

### Foundational phase

```text
T004 registry tests
T005 canonicalization tests
T006 writer tests
T007 linearization tests
```

### User Story 1 tests

```text
T015 release orchestration tests
T016 generic laser tests
T017 generic plasma tests
T018 EDGE Connect tests
T019 laser fixtures
T020 plasma fixtures
T021 EDGE Connect fixtures
```

### User Story 1 implementation

```text
T023 src/nesting/post/processors/generic-laser.ts
T024 src/nesting/post/processors/generic-plasma.ts
T025 src/nesting/post/processors/edge-connect.ts
```

These processor tasks are parallel after the shared writer, types, validation, and failing tests are complete.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Implement User Story 1 with generic laser and plasma processors plus the EDGE Connect `809550-rev6` subset.
3. Run the independent story tests and all repository quality gates.
4. Stop only when reviewed golden outputs, release blocking, and metadata requirements pass.

### Incremental Delivery

1. Deliver shared contracts and deterministic writer infrastructure.
2. Add generic laser and plasma processors with reviewed fixtures.
3. Add EDGE Connect using only the documented EIA RS-274D subset.
4. Add further G59, XPR, ESSI, bevel, or advanced features only as separately reviewed processors and fixtures.

## Format Validation

All tasks use the required checklist format: `- [ ]`, sequential `T###` ID, optional `[P]`, required
`[US1]` label in the user-story phase, and an explicit repository file path.

## Phase 5: Convergence

- [X] T034 Remove runtime Node-only fixture I/O from the public post-processing path and provide an explicit browser-compatible reviewed-output boundary per Constitution V / plan: browser-compatible build (contradicts)
- [X] T035 Validate required processor process settings instead of silently defaulting missing feed, power, amperage, or dwell calibration per FR-004 / US1-AC3 (partial)
- [X] T036 Require a reviewed expected output for every approved processor before marking a machine program releasable per FR-006 / SC-001 (partial)
- [X] T037 Add explicit curve representation and deterministic linearization or rejection coverage for unsupported curve actions per FR-004a (partial)
- [X] T038 Remove the documented force-release path and align consolidated release rules with the no-override clarification per FR-004 (contradicts)
- [X] T039 Add required public JSDoc, module-purpose headers, and source-adjacent documentation for the new post-processing API per Constitution Coding Conventions / Documentation gate (partial)
- [X] T040 Reconcile consolidated post-processor API signatures and examples with the implemented exports, including registry, context, and action metadata contracts per plan: public API/documentation (partial)

## Phase 6: Convergence

- [X] T041 Implement deterministic Bezier linearization with the approved profile tolerance, or return an explicit documented rejection only where the clarified curve contract permits it, per FR-004a / US1 edge case (partial)
- [X] T042 Complete public JSDoc for all new exported processors, writer methods, options, interfaces, and classes per Constitution Coding Conventions / T039 (partial)
- [X] T043 Emit the approved plasma amperage setting or explicitly reject and document that unsupported calibration per FR-002 / T024 (partial)

## Phase 7: Convergence

- [X] T044 Reject malformed explicit arc geometry with a structured validation issue before emission per Constitution Silent Failure / FR-004a (partial)
- [X] T045 Remove or implement the stale `DialectTemplate` contract and its claim that generic processors implement it fully per T040 / plan: public API documentation (partial)
