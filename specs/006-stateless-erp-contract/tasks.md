---

description: "Task list for the stateless ERP nesting contract"
---

# Tasks: Stateless ERP Nesting Contract

**Input**: Design documents from `/specs/006-stateless-erp-contract/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: Required by Constitution Principle III. Every production-code task is preceded by a
failing test task or is covered by an earlier contract test.

## Phase 1: Setup

**Purpose**: Prepare dependency and governance changes required by the runtime ERP contract.

- [X] T001 Define package-major-version migration assertions and dependency validation in `test/integration/nesting/erp/packageMigration.test.ts`
- [X] T002 [P] Record the approved Zod runtime-dependency exception and migration path in `.specify/adr/ADR-0002-stateless-erp-contract.md`
- [X] T003 [P] Add the feature test directory structure under `test/unit/nesting/erp/` and `test/integration/nesting/erp/`
- [X] T004 [P] Add the ERP contract module export placeholder in `src/nesting/erp/index.ts`

## Phase 2: Foundational

**Purpose**: Establish shared types, schemas, canonicalization, and digest primitives before the
user-facing flow is implemented.

**Checkpoint**: Foundational contract primitives and governance are complete; User Story 1 can be
implemented independently.

- [X] T005 Define ERP request, artifact, correlation, snapshot, issue, unplaced-item, and digest interfaces in `src/nesting/erp/types.ts`
- [X] T006 [P] Write failing schema tests for contract versioning, required correlation fields, complete job input, and strict scalar validation in `test/unit/nesting/erp/schemas.test.ts`
- [X] T007 [P] Write failing canonicalization tests for recursively sorted keys, stable arrays, finite-number handling, and volatile-field exclusion in `test/unit/nesting/erp/canonical.test.ts`
- [X] T008 [P] Write failing digest tests for SHA-256 output shape, equivalent-object equality, and timestamp-insensitive projections in `test/unit/nesting/erp/digest.test.ts`
- [X] T009 [P] Write failing immutability tests proving validation and digest projection do not mutate caller-owned input in `test/unit/nesting/erp/immutability.test.ts`
- [X] T010 Implement versioned Zod request and artifact schemas aligned with `src/nesting/erp/types.ts` in `src/nesting/erp/schemas.ts`
- [X] T011 Implement deterministic canonical projection and compact JSON serialization in `src/nesting/erp/canonical.ts`
- [X] T012 Implement browser-compatible Web Crypto SHA-256 helpers in `src/nesting/erp/digest.ts`
- [X] T013 Export ERP types, schemas, canonicalization, and digest primitives from `src/nesting/erp/index.ts` and `src/nesting/index.ts`
- [X] T014 [P] Add the ERP public contract type fixture from `specs/006-stateless-erp-contract/contracts/erp-nesting-contract.ts` to `test/unit/nesting/erp/contract-types.test.ts`

## Phase 3: User Story 1 - Submit and Correlate a Nesting Request (Priority: P1) 🎯 MVP

**Goal**: Let an ERP submit one complete caller-owned revision and receive one deterministic,
self-contained Observable artifact without external state access or mutation.

**Independent Test**: Subscribe to the public ERP flow with a valid request and assert one complete
artifact containing correlation data, resource snapshots, status, layout/unplaced details, and both
digests. Repeat the same canonical request 100 times and assert equal output digests. Submit a
request with unavailable resources and assert a partial artifact with explicit unplaced reasons.

### Tests for User Story 1

> Write tests first and confirm the new tests fail before implementing the corresponding behavior.

- [X] T015 [P] [US1] Write failing valid-request contract tests for one lazy Observable emission and completion in `test/integration/nesting/erp/erpFlow.test.ts`
- [X] T016 [P] [US1] Write failing correlation and snapshot preservation tests in `test/integration/nesting/erp/erpFlow.test.ts`
- [X] T017 [P] [US1] Write failing deterministic repetition tests for 100 equal requests, layout decisions, plan, metrics, and output digests in `test/integration/nesting/erp/determinism.test.ts`
- [X] T018 [P] [US1] Write failing partial-resource tests for available-resource continuation and typed unplaced reasons in `test/integration/nesting/erp/partialResources.test.ts`
- [X] T019 [P] [US1] Write failing statelessness tests proving no ERP/file/inventory/profile access and no caller-input mutation in `test/integration/nesting/erp/statelessness.test.ts`
- [X] T020 [P] [US1] Write failing override and timestamp-insensitivity tests in `test/integration/nesting/erp/erpFlow.test.ts`
- [X] T021 [P] [US1] Write failing invalid-version and contract-violation tests for the Observable error path in `test/integration/nesting/erp/contractErrors.test.ts`

### Implementation for User Story 1

- [X] T022 [US1] Implement resource and part adaptation from `ErpNestingRequest` to existing `NestRequest` models in `src/nesting/erp/adapter.ts`
- [X] T023 [US1] Implement deterministic mapping from `NestResponse` placements, metrics, and unplaced parts to the ERP artifact layout in `src/nesting/erp/adapter.ts`
- [X] T024 [US1] Implement explicit status, warning, rejection, and unplaced reason aggregation in `src/nesting/erp/artifact.ts`
- [X] T025 [US1] Implement lazy RxJS orchestration with validation, existing nesting-flow delegation, cancellation teardown, and one-emission completion in `src/nesting/erp/flow.ts`
- [X] T026 [US1] Implement input and output digest projections around the finalized artifact in `src/nesting/erp/flow.ts`
- [X] T027 [US1] Export the public ERP flow and all ERP contract types from `src/nesting/erp/index.ts`, `src/nesting/index.ts`, and `src/index.ts`
- [X] T028 [US1] Add the package-level Zod dependency, package version `9.0.0`, lockfile update, and constitutional amendment rationale in `package.json`, `yarn.lock`, `.specify/memory/constitution.md`, and `.specify/adr/ADR-0002-stateless-erp-contract.md`

**Checkpoint**: User Story 1 is independently functional: valid requests emit complete artifacts,
repeated canonical requests match, missing resources produce partial results, and no external state
is accessed or mutated.

## Phase 4: Polish and Cross-Cutting Validation

**Purpose**: Validate the complete feature against the repository quality gates and quickstart.

- [X] T029 [P] Add public JSDoc and contract examples for ERP interfaces and flow exports in `src/nesting/erp/types.ts` and `src/nesting/erp/flow.ts`
- [X] T030 [P] Add sibling documentation for the ERP module in `src/nesting/erp/erp.doc.md`
- [X] T031 Run feature-specific unit and integration tests from `specs/006-stateless-erp-contract/quickstart.md`
- [X] T032 Run `yarn type-check` and fix all TypeScript errors introduced by the ERP contract in `src/` and `test/`
- [X] T033 Run `yarn lint`, `yarn build`, `yarn quality:gate`, and `git diff --check` for the complete feature
- [X] T034 Verify the 100-request digest acceptance criterion and record measured evidence in `specs/006-stateless-erp-contract/quickstart.md`
- [X] T035 [P] Validate the bundled browser ERP flow and Web Crypto SHA-256 path in `test/integration/nesting/erp/browserBundle.test.ts`

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1** has no implementation dependencies and can begin immediately.
- **Phase 2** depends on Phase 1 and blocks User Story 1.
- **Phase 3** depends on all Phase 2 primitives and delivers the MVP.
- **Phase 4** depends on the completed User Story 1 implementation.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; it is the only story in this specification and has no
  dependency on another user story.

### Within User Story 1

- Tests T015-T021 must fail before T022-T028 implementation begins.
- T002 must be completed before T028 changes `package.json` or `yarn.lock`.
- Types and schemas precede adapters and artifact mapping.
- Adapter and artifact mapping precede Observable orchestration.
- The public export task follows implementation tasks.
- Package/governance changes must be completed before the final quality gates.

## Parallel Execution Examples

### Phase 1

```text
Task T002: Record the Zod ADR
Task T003: Create ERP test directories
Task T004: Add ERP export placeholder
```

### Phase 2

```text
Task T006: Write schema tests
Task T007: Write canonicalization tests
Task T008: Write digest tests
Task T009: Write immutability tests
Task T014: Add public contract type fixture
```

### User Story 1

```text
Task T015: Test valid Observable flow
Task T016: Test correlation and snapshots
Task T017: Test deterministic repetitions
Task T018: Test partial resources
Task T019: Test statelessness
Task T020: Test overrides and timestamps
Task T021: Test contract errors
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 governance and structure.
2. Complete Phase 2 validation, canonicalization, and digest primitives.
3. Complete Phase 3 User Story 1.
4. Run the independent User Story 1 tests and the 100-request digest check.
5. Stop for review before polishing or release migration.

### Incremental Delivery

1. Deliver schemas and digest primitives with their tests.
2. Deliver the valid-request ERP Observable artifact.
3. Add partial-resource handling and statelessness assertions.
4. Apply the Zod/package-major governance change.
5. Validate the browser bundle and Web Crypto path.
6. Run all repository quality gates and document measured evidence.

## Phase 5: Convergence

- [X] T036 Strengthen nested Zod validation for parts, stock, nesting options, and artifact plans per FR-010 (partial)
- [X] T037 Add an unavailable-resource integration scenario that requires a partial artifact with typed unplaced reasons per FR-012 and US1/AC2 (partial)
- [X] T038 Compare layouts, plans, metrics, and output digests across 100 independent requests per FR-007, SC-002, and T017 (partial)
- [X] T039 Validate emitted artifacts with `erpNestingArtifactSchema` before Observable emission per FR-009 and the plan's runtime-validation decision (partial)
- [X] T040 Add explicit supported-version dispatch and strict nesting algorithm validation per FR-013 and the plan's versioning decision (partial)
