---

description: "Implementation tasks for nesting costing and reporting"
---

# Tasks: Nesting Costing and Reporting

**Input**: Design documents from `/specs/008-nesting-cost-reporting/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/cost-reporting-api.md`, `quickstart.md`

**Tests**: Required by the project constitution (Principle III). Every behavior task follows
Red → Green → Refactor: the test task for a behavior is written first and must fail for the expected
reason before the matching implementation task starts.

**Documentation**: Every task that changes a file under `src/` also creates or updates that file's
sibling `.doc.md` in the same task and commit. No other documentation is created or edited.

**Quality gate**: The pre-commit hook runs `yarn test` and `yarn quality:gate`; the gate fails on high
cyclomatic or cognitive complexity and on unused or unresolved files, so functions stay small and
imports resolve. Never bypass it.

**Organization**: Tasks are grouped by user story. US1 is the MVP: the pure `buildCostBreakdown` for
complete inputs, with exact reconciliation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story of the task (US1–US4); Setup, Foundational and Polish have none
- Source paths are under `src/nesting/cost/` and `src/nesting/linking/`; unit tests under
  `test/unit/nesting/cost/` and `test/unit/nesting/linking/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature skeleton.

- [X] T001 Create `src/nesting/cost/`, `src/nesting/linking/`, `test/unit/nesting/cost/` and `test/unit/nesting/linking/` per `specs/008-nesting-cost-reporting/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract the linking shared with the review, then define the cost types, messages, fixtures and barrel every story needs.

**Critical**: No user story work starts until this phase is complete.

- [X] T002 [P] Add tests for the shared action linking in `test/unit/nesting/linking/linkActions.test.ts`: contour of a `CutLayout` resolves to its placed part; fallback by `partId` equal to a part key or to a `shapeId`; actions without `partId` and `contourId` stay unlinked without a finding; each distinct unresolved reference is returned once as a structured finding with its first action index and kind (`unknown-part` or `unlinked-action`); a resolver for problems gives the same answers; no user text in the result
- [X] T003 [P] Add tests for the shared placement resolution in `test/unit/nesting/linking/placedParts.test.ts`, covering exactly the rules of `specs/007-nesting-simulation/data-model.md` "Placement resolution": sheet from `sheetId`, else the only sheet, else a structured finding and no part; deterministic `instanceIndex` order; outline from `transformedVertices`, else the `bbox` rectangle flagged as approximate; compound placements as one part with outer and hole outlines; parts grouped by sheet in artifact order; no user text in the result
- [X] T004 Implement `linkActions` in `src/nesting/linking/linkActions.ts` with its sibling `.doc.md` by moving the resolution logic out of `src/nesting/review/linkParts.ts` and returning `{ partKeyByAction, resolve, unresolved }` with no messages (depends on T002)
- [X] T005 Implement `placedParts` in `src/nesting/linking/placedParts.ts` with its sibling `.doc.md` by moving the placement logic out of `src/nesting/review/resolvePlacements.ts` and returning parts by sheet plus structured findings with no messages (depends on T003)
- [X] T006 Make `src/nesting/review/linkParts.ts` a thin wrapper over `linkActions`: same public result and the same pt_BR `ReviewNotice` texts built from the structured findings; update its `.doc.md` (depends on T004)
- [X] T007 Make `src/nesting/review/resolvePlacements.ts` a thin wrapper over `placedParts`: same `ResolvedPlacements` result and the same notices; update its `.doc.md` (depends on T005)
- [X] T008 Move `src/nesting/review/actionPath.ts` and `src/nesting/review/actionPath.doc.md` to `src/nesting/linking/actionPath.ts` and `.doc.md` (the geometry sampler shared by the review and the cost), update every importer in `src/nesting/review/` and `src/nesting/review/three/`, and update the sibling docs that mention it; behavior unchanged (depends on T001)
- [X] T009 Run the whole `test/unit/nesting/review/` suite, `test/unit/nesting/linking/` and `test/integration/nesting/reviewRealParts.test.ts` and confirm the review behavior is unchanged; fix any difference in the shared modules, not in the review tests (depends on T006, T007, T008)
- [X] T010 Define all public cost types in `src/nesting/cost/types.ts` exactly as in `specs/008-nesting-cost-reporting/contracts/cost-reporting-api.md` and `data-model.md`, with JSDoc and with its sibling `.doc.md`; reuse `CutLayout`, `CutPlanResult`, `ErpCorrelation`, `ErpDigest` and `ErpNestingArtifact`; constraints verbatim: `CostModel.contractVersion` is a positive integer and `1` is the only supported version; `currency.code` is three upper-case letters and `currency.minorUnitDigits` an integer in `[0, 4]`; `geometryUnitsPerMeter` is finite and greater than zero; `material.fullSheet` and `material.remnant` are prices per stock id in major units, `>= 0`; `speeds.cutting` and `speeds.rapid` are meters per minute, `> 0`; `speeds.pierceDwellSeconds` is `>= 0`; `rates.cuttingPerHour`, `rates.travelPerHour`, `rates.piercePerUnit` and `rates.labourPerHour` are `>= 0`; `handling.secondsPerSheet` and `handling.secondsPerJob` are seconds `>= 0`; consumable ids are unique, `cost >= 0` and `life.amount > 0`; `Estimable<T>` is `{ value: T; estimated?: boolean }`; component `status` is `'complete' | 'estimated' | 'incomplete'` and `amount` is an integer in minor units that is `null` exactly when `status` is `incomplete`; report `status` is `'complete' | 'estimated' | 'incomplete' | 'unavailable'`; notice `severity` is `'info' | 'warning' | 'error'`; notice codes are exactly `UNSUPPORTED_CONTRACT_VERSION`, `NO_LAYOUT`, `NO_CUT_PLAN`, `INVALID_COST_MODEL`, `MISSING_RATE`, `MISSING_SPEED`, `MISSING_DWELL`, `MISSING_CONSUMABLE_LIFE`, `MISSING_SHEET_PRICE`, `MIXED_CURRENCY`, `ESTIMATED_INPUT`, `UNLINKED_ACTION`, `UNKNOWN_PART`, `PART_WITHOUT_AREA`, `PART_WITHOUT_CUTTING`, `AREA_WITHOUT_HOLES`, `UNALLOCATED_DISTRIBUTED`, `UNPLACED_NOT_CHARGED`, `PLAN_SHEET_MISSING`, `PLACEMENT_SHEET_UNRESOLVED`; `CostBreakdown.distributed` entries are `{ category; scope: 'sheet' | 'job'; scopeId?: string; amount: number }` with integer minor units; `PartUsage.netArea` is the sum over the part's contours of `+Math.abs(area)` for `isOuter` true and `-Math.abs(area)` otherwise; categories in the fixed order `material`, `cutting`, `pierce`, `travel`, `consumable`, `labour`; no `any` and no `unknown` in the domain types (depends on T001)
- [X] T011 [P] Add message tests in `test/unit/nesting/cost/messages.test.ts`: every notice code has a Brazilian Portuguese message builder, identifiers and values are interpolated, no builder returns an empty string, snapshot of the pt_BR text
- [X] T012 Implement `src/nesting/cost/messages.ts` as the single internal module holding every notice text the cost module produces (pt_BR), not exported through the barrel, with its sibling `.doc.md` (depends on T010, T011)
- [X] T013 [P] Add the cost test fixtures in `test/unit/nesting/cost/fixtures.ts`: a complete `CostModel` (currency with two minor-unit digits, `geometryUnitsPerMeter` 1000, prices for full sheets and remnants, speeds, rates, handling and two consumables, one by pierces and one by cutting seconds); variants with one missing rate, speed, dwell, consumable life or sheet price; a variant with estimated values; invalid variants (negative rate, life of zero, mixed currency); and request builders reusing `smallFixture`, `partialFixture`, `layoutOnlyFixture`, `rejectedFixture` and `referenceFixture` from `test/unit/nesting/review/fixtures.ts`, plus a remnant variant of the small artifact; no `Math.random`
- [X] T014 Add the cost barrel scaffold in `src/nesting/cost/index.ts` and reserve the additive re-export in `src/nesting/index.ts`, updating `src/nesting/index.doc.md` (depends on T010)

**Checkpoint**: Shared linking extracted with the review behavior unchanged; types, messages, fixtures and barrel ready.

---

## Phase 3: User Story 1 - Quote a Completed Nesting Job (Priority: P1) 🎯 MVP

**Goal**: A planner gets per-part and job amounts for all six categories from a completed artifact, plan and complete rates, with exact reconciliation.

**Independent Test**: Submit a completed artifact with all rates and verify the total equals the sum of the components, the parts add up exactly to the job for every component, a full sheet and a remnant are priced separately, and repeating the request gives the same result.

> Write each test first and confirm it fails for the expected reason before implementing.

- [X] T015 [P] [US1] Add usage tests in `test/unit/nesting/cost/collectUsage.test.ts`: one usage per placed part with the key `shapeId#instanceIndex`; net area computed by `isOuter` and `Math.abs(area)` (outer added, holes subtracted, the stored sign never used, and a fixture whose hole areas are stored as positive numbers) when the layout is supplied, else the placed outline area with an info `AREA_WITHOUT_HOLES`; cut, lead, overcut, tab and common-line lengths summed as cut length, rapid lengths as travel length, pierce actions counted; actions that cannot be linked accumulated as unallocated usage per sheet with `UNLINKED_ACTION` or `UNKNOWN_PART`; a part with no cutting action reported with `PART_WITHOUT_CUTTING`; a part without positive area reported with `PART_WITHOUT_AREA`; unplaced items never produce a part
- [X] T016 [P] [US1] Add time tests in `test/unit/nesting/cost/estimateTimes.test.ts`: cutting seconds = length / (speed in geometry units per second) using `geometryUnitsPerMeter`; the action's numeric `feed` metadata takes precedence over `speeds.cutting`; rapid seconds from `speeds.rapid`; pierce seconds from the action's numeric `dwell` metadata, else `speeds.pierceDwellSeconds`; a time is `null` when the speed or dwell it needs is absent; zero length gives zero seconds
- [X] T017 [P] [US1] Add apportionment tests in `test/unit/nesting/cost/apportion.test.ts`: integer results that add up exactly to the rounded sum of the exact shares for seeded random-free cases and a 500-share case; largest remainder with ties to the earlier index; zero shares; one share; a total smaller than the number of shares; identical results for identical input; no input mutation
- [X] T018 [P] [US1] Add component tests in `test/unit/nesting/cost/componentAmounts.test.ts` for complete inputs: material of each sheet priced as full sheet or remnant and distributed to its placed parts by net area (FR-003); cutting = cutting seconds x `rates.cuttingPerHour`; pierce = count x `rates.piercePerUnit`; travel = travel seconds x `rates.travelPerHour`; consumable cost per use = cost / life by pierces or by cutting seconds; labour = machine seconds x `rates.labourPerHour` plus handling seconds per sheet and per job x the same rate; amounts without an owner part (unlinked travel, handling) distributed over the placed parts of their scope by net area, each one returned in `distributed` and raising an info `UNALLOCATED_DISTRIBUTED` whose message states component, scope and amount; a sheet whose placed parts all lack positive net area splits its price equally among them (no sheet with parts is left uncharged); a zero rate gives a zero amount; amounts exact in minor units
- [X] T019 [P] [US1] Add breakdown tests in `test/unit/nesting/cost/buildCostBreakdown.test.ts` for complete inputs: the parts add up exactly to the job for every component and for the total, including rounding residuals (SC-001); sheet amounts are the sums of their parts and the job the sum of the sheets; copies of one part type are also reported in total; a full sheet and a remnant on the same job are priced separately; unplaced quantity is not charged (FR-011, SC-005); an action linked to a part the artifact lacks keeps its amount, distributed and listed in `distributed` (spec edge case); the usage lengths and pierce counts equal the `CutPlan.stats` (`cutLength`, `rapidLength`, `pierceCount`) of the real-planner fixture when every action is linked (FR-007); identical output for identical input; deeply frozen inputs unchanged (FR-006, SC-008); the 500-part reference job reconciles
- [X] T020 [US1] Implement `collectUsage` in `src/nesting/cost/collectUsage.ts` with its sibling `.doc.md` on top of `placedParts` and `linkActions`; compute net area with `computeArea` from `src/nesting/polygonUtils.ts` and the action lengths with `sampleActionPath` from `src/nesting/linking/actionPath.ts`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T005, T004, T008, T010, T015)
- [X] T021 [P] [US1] Implement `estimateTimes` in `src/nesting/cost/estimateTimes.ts` with its sibling `.doc.md` to satisfy T016; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T020)
- [X] T022 [P] [US1] Implement `apportion` in `src/nesting/cost/apportion.ts` with its sibling `.doc.md` to satisfy T017 (largest remainder, ties by index); keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T010)
- [X] T023 [US1] Implement `componentAmounts` in `src/nesting/cost/componentAmounts.ts` with its sibling `.doc.md` for complete inputs: one small helper per component, exact unrounded amounts per part, rates converted once from major units with `minorUnitDigits`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T021, T020, T018)
- [X] T024 [US1] Implement the synchronous core `buildCostBreakdown` in `src/nesting/cost/buildCostBreakdown.ts` with its sibling `.doc.md`: collect usage, estimate times, compute exact amounts, apportion each component over the parts so the job amount is the rounded sum of the exact part amounts, then build part, sheet, part-type and job groups; never mutate the request; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T023, T022, T019)
- [X] T025 [US1] Export `buildCostBreakdown` and the US1 types from `src/nesting/cost/index.ts` and `src/nesting/index.ts`, updating `src/nesting/index.doc.md` (depends on T024, T014)
- [X] T026 [US1] Run the US1 suites (`yarn test:unit`) and fix failures in `test/unit/nesting/cost/` and `src/nesting/cost/`

**Checkpoint**: US1 is independently functional: `buildCostBreakdown` returns reconciled amounts for complete inputs.

---

## Phase 4: User Story 2 - Know What Is Missing or Estimated (Priority: P2)

**Goal**: Every gap is explicit: incomplete components carry no value, estimated inputs are flagged, invalid models are rejected with reasons, and unavailable reports say why.

**Independent Test**: Request breakdowns with a missing rate, speed, dwell and consumable life, an estimated value and an invalid model; verify the affected components, no invented value and the notices.

- [X] T027 [P] [US2] Add model validation tests in `test/unit/nesting/cost/validateCostModel.test.ts`: a negative or non-numeric rate, speed, handling time, price or consumable cost, a speed of zero or less, a consumable life of zero or less, a currency code that is not three upper-case letters, `minorUnitDigits` outside `[0, 4]`, a non-positive `geometryUnitsPerMeter`, duplicate consumable ids, and prices or consumables declared in another currency each give a specific `INVALID_COST_MODEL` or `MIXED_CURRENCY` notice; a valid model gives none; every issue is returned, nothing throws
- [X] T028 [P] [US2] Extend `test/unit/nesting/cost/componentAmounts.test.ts` with status tests: a missing rate, speed, dwell, consumable life or sheet price makes exactly the dependent components `incomplete` with `amount: null` and a reason (`MISSING_RATE:<field>` and so on) and no other component changes; a zero value is valid and an absent value is not; a value with `estimated: true` is used and every component that used it is `estimated` with reason `ESTIMATED:<field>` and the breakdown raises one `ESTIMATED_INPUT` notice per estimated input; an incomplete component is not apportioned to any part
- [X] T029 [P] [US2] Extend `test/unit/nesting/cost/buildCostBreakdown.test.ts` with status tests: a part, sheet or job total is `incomplete` when any component is, else `estimated` when any is, else `complete`; an incomplete total has `amount: null` and exposes only `partialSubtotal`; statuses depend only on inputs (same statuses for different amounts); no cut plan gives a material estimate and `incomplete` cut-dependent components with `NO_CUT_PLAN`; a plan for a sheet the artifact lacks gives `PLAN_SHEET_MISSING`; no layout, a rejected artifact and an unsupported contract version give `unavailable` with a specific notice and no breakdown (FR-017)
- [X] T030 [P] [US2] Add schema tests in `test/unit/nesting/cost/schemas.test.ts`: the request and cost model schemas accept the complete fixture, reject a missing artifact or cost model, a wrong `contractVersion` and wrongly typed fields, and stay aligned with the exported types (a fixture typed as `CostRequest` parses)
- [X] T031 [US2] Implement the Zod schemas in `src/nesting/cost/schemas.ts` with its sibling `.doc.md`, exporting `costRequestSchema` and `costModelSchema`, aligned with `types.ts`; the request schema composes `erpNestingArtifactSchema` from `src/nesting/erp/schemas.ts` instead of copying it; no new dependency (depends on T010, T030)
- [X] T032 [US2] Implement `validateCostModel` in `src/nesting/cost/validateCostModel.ts` with its sibling `.doc.md` returning every issue as a `CostNotice`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T031, T012, T027)
- [X] T033 [US2] Extend `src/nesting/cost/componentAmounts.ts` and `src/nesting/cost/buildCostBreakdown.ts` and their `.doc.md` files with statuses, reasons, estimated propagation, partial subtotals, the unavailable cases and the related notices from `messages.ts`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T032, T028, T029, T024)
- [X] T034 [US2] Export `validateCostModel` and the schemas' types from `src/nesting/cost/index.ts` and `src/nesting/index.ts` and update `src/nesting/index.doc.md` (depends on T033)
- [X] T035 [US2] Run the US2 suites and fix failures

**Checkpoint**: US2 makes the quote trustworthy: no figure is mistaken for a firm price.

---

## Phase 5: User Story 3 - Review the Production Report (Priority: P2)

**Goal**: The report states sheets used, yield, time and cost, lists unplaced items, and is linked to the artifact, the cost model and itself by digests.

**Independent Test**: Request a report for a multi-sheet artifact and verify per-sheet and job figures, times by category, the identity values, determinism over 100 runs and the 1-second gate.

- [X] T036 [P] [US3] Add production tests in `test/unit/nesting/cost/buildProductionReport.test.ts`: sheets used (with at least one placed part), yield, waste area and total area exactly as supplied by the artifact; cutting, travel, pierce and handling seconds and their total per sheet and for the job, `null` where a time is incomplete; unplaced items copied with their reasons and `UNPLACED_NOT_CHARGED`; figures for a multi-sheet artifact
- [X] T037 [P] [US3] Add flow tests in `test/unit/nesting/cost/calculateCostReport.test.ts`: cold Observable that does nothing before subscription, emits exactly one report and completes; the report carries the artifact correlation, both artifact digests, the digest of the canonical cost model, the currency, the contract version `1` and a `reportDigest` that matches the canonical JSON of the report without that field; an invalid cost model, a rejected artifact and an unsupported contract version emit an `unavailable` report with notices; a request that is structurally invalid (an artifact that fails the ERP artifact schema, so with no correlation or digests) rejects the Observable; the report survives `JSON.parse(JSON.stringify(report))` unchanged (FR-005); 100 consecutive reports for the same inputs are identical, digests included (FR-014, SC-004); frozen inputs unchanged; the 500-part reference job is reported in under 1 second (SC-006)
- [X] T038 [P] [US3] Add the real-drawings integration test in `test/integration/nesting/costRealParts.test.ts`: prepare the drawings of `test/resources/nest-fixtures` with `prepareParts`, nest them with `calculateErpNesting`, plan the cut with `planCutPath`, request the report and assert that every placed part is costed, no action is unlinked, the parts reconcile to the job and the report is `complete` with the complete model (reuse the setup of `test/integration/nesting/reviewRealParts.test.ts` through a shared helper in `test/integration/nesting/fixtures/` if it keeps both files under 500 lines)
- [X] T039 [US3] Implement `buildProductionReport` in `src/nesting/cost/buildProductionReport.ts` with its sibling `.doc.md`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T033, T036)
- [X] T040 [US3] Make `buildCostBreakdown` return the production report with the breakdown and the notices, updating `src/nesting/cost/buildCostBreakdown.ts` and its `.doc.md` (depends on T039)
- [X] T041 [US3] Implement `calculateCostReport` in `src/nesting/cost/calculateCostReport.ts` with its sibling `.doc.md`: `observeFlow` from `src/nesting/async/observableFlow.ts`, request validation with `costRequestSchema` (which reuses the 006 artifact schema), `buildCostBreakdown`, digests with `digestCanonical` and `canonicalize` from `src/nesting/erp/`, canonical projections that exclude the report digest itself and anything time or order dependent, notices ordered by severity then code then part key; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T040, T031, T037)
- [X] T042 [US3] Export `calculateCostReport` and the report types from `src/nesting/cost/index.ts` and `src/nesting/index.ts` and update `src/nesting/index.doc.md` (depends on T041)
- [X] T043 [US3] Run the US3 suites, `yarn test:integration:node` and the SC-006 timing five times on the reference job; fix any calibration failure and record the processor model, core count and worst case in `specs/008-nesting-cost-reporting/quickstart.md` (depends on T042, T038)

**Checkpoint**: US3 delivers the complete, auditable `CostReport` flow.

---

## Phase 6: User Story 4 - Export to the ERP (Priority: P3)

**Goal**: The report is also available as two documented CSV tables whose totals reproduce the structured report.

**Independent Test**: Export both tables, read them back and verify the totals equal the report's.

- [X] T044 [P] [US4] Add table tests in `test/unit/nesting/cost/costReportToCsv.test.ts` for `costReportTables`: the `parts` table has exactly the columns of the contract in order and one row per placed part in artifact order; the `job` table has job rows first and then each sheet in artifact order, with the metrics in the fixed order of the contract and the production metrics only for the job scope; amounts are integers in minor units, lengths, areas and seconds have exactly three decimals, an incomplete amount or time is `null`
- [X] T045 [P] [US4] Extend `test/unit/nesting/cost/costReportToCsv.test.ts` for `costReportToCsv`: RFC 4180 text with a header row, comma separators, LF line ends, decimal point and no thousands separator, fields containing a comma, quote or line break quoted with doubled quotes, empty cells for `null`, identical text for identical reports regardless of the process locale, and a round trip: parsing the text back and summing the `parts` amounts per category reproduces the `job` amounts and the report totals exactly (SC-007)
- [X] T046 [P] [US4] Implement `costReportTables` in `src/nesting/cost/costReportTables.ts` with its sibling `.doc.md`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T041, T044)
- [X] T047 [US4] Implement `costReportToCsv` in `src/nesting/cost/costReportToCsv.ts` with its sibling `.doc.md` (depends on T046, T045)
- [X] T048 [US4] Export `costReportTables`, `costReportToCsv` and the table types from `src/nesting/cost/index.ts` and `src/nesting/index.ts` and update `src/nesting/index.doc.md` (depends on T047)
- [X] T049 [US4] Run the US4 suites and fix failures

**Checkpoint**: Every report can be persisted and loaded by the ERP without further calculation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation check, repository gates and recorded evidence.

- [X] T050 [P] Verify that every file in `src/nesting/cost/` and `src/nesting/linking/` has an up-to-date sibling `.doc.md` (pt-BR, consolidated, no changelog language), exports one public function (except `types.ts` and barrels) and stays under 500 lines; no other documentation is created or edited
- [X] T051 [P] Confirm that the source structure in `specs/008-nesting-cost-reporting/plan.md` still matches the files created (it already lists `costReportTables.ts` and `src/nesting/linking/actionPath.ts`), record any further file added while implementing with its justification, and keep `contracts/cost-reporting-api.md` signatures in parity with the code
- [X] T052 Run `yarn type-check` and resolve all TypeScript errors, including signature parity between the contract and `src/nesting/cost/`
- [X] T053 Run `yarn lint` and `yarn quality:gate` and resolve every error in the changed source files (the gate rejects high complexity; split functions instead of disabling it)
- [X] T054 Run `yarn test:unit` and `yarn test:integration:node` and confirm no regression, including the whole `review` suites after the linking extraction
- [X] T055 Run `yarn build` and `yarn dist` and confirm the cost module is in `lib/` and the browser bundle has no new dependency
- [X] T056 Record the measured SC-001 to SC-008 evidence (date, environment, worst case) in `specs/008-nesting-cost-reporting/quickstart.md` (depends on T043, T049)
- [X] T057 Update `specs/008-nesting-cost-reporting/checklists/requirements.md` notes and confirm every success criterion has a passing test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 can start immediately.
- **Foundational (Phase 2)**: depends on T001. T002, T003, T011 and T013 are parallel;
  T004 follows T002, T005 follows T003; T006 and T007 follow them; T009
  closes the extraction; T010 can run in parallel with the extraction; T012 follows T010 and
  T011; T014 follows T010.
- **User Stories (Phases 3–6)**: all depend on Phase 2. US1 is the MVP. US2 extends the US1 files
  `componentAmounts.ts` and `buildCostBreakdown.ts` and is therefore sequential after US1. US3 depends
  on US2 (it needs the statuses) and adds the flow. US4 depends on US3 (it exports a `CostReport`).
- **Polish (Phase 7)**: depends on all stories being complete.

### Within Each Story

- Test tasks first and failing, then implementation, then the story run task.
- `componentAmounts.ts` and `buildCostBreakdown.ts` tasks are sequential across stories (shared
  files); everything else marked [P] can run in parallel.

## Parallel Execution Examples

### Foundational

```text
T002 linkActions.test.ts | T003 placedParts.test.ts | T011 messages.test.ts | T013 fixtures.ts
then: T004 linkActions.ts | T005 placedParts.ts | T010 types.ts
```

### User Story 1

```text
T015 | T016 | T017 | T018 | T019  (tests)
then: T021 estimateTimes.ts | T022 apportion.ts
```

### User Story 2

```text
T027 | T028 | T029 | T030  (tests)
```

### User Story 3

```text
T036 | T037 | T038  (tests)
```

### User Story 4

```text
T044 | T045  (tests)
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2 (extraction first, with the review suites as the regression guard).
2. Complete Phase 3 and stop: a pure, reconciled breakdown for complete inputs is releasable and covers
   SC-001, SC-005 and SC-008 for complete inputs.
3. Validate with T026 before the statuses work.

### Incremental Delivery

1. Add US2 for statuses and validation (SC-002).
2. Add US3 for the production report, digests and the flow (SC-003, SC-004, SC-006).
3. Add US4 for the CSV export (SC-007).
4. Finish with Polish and the recorded evidence; a gate may not be skipped or narrowed to pass.

---

## Phase 8: Convergence

**Purpose**: Remaining work found by comparing the current code with `spec.md`, `plan.md`, `tasks.md` and the constitution. Ordered by severity.

- [X] T058 Stop approximated part areas from passing silently: when `placedParts` reports `geometry-approximate` for a part (its outline is the bounding box) and the area therefore comes from that rectangle, make `src/nesting/cost/collectUsage.ts` raise a warning notice with a new code `PART_AREA_APPROXIMATE` (message in pt-BR in `src/nesting/cost/messages.ts`), add the code to `CostNoticeCode` in `src/nesting/cost/types.ts`, `specs/008-nesting-cost-reporting/data-model.md` and the codes list of the types task, add the failing test first in `test/unit/nesting/cost/collectUsage.test.ts` and `test/unit/nesting/cost/messages.test.ts` using `sparsePlacementFixture` from `test/unit/nesting/review/fixtures.ts`, and update the sibling `.doc.md` files per Constitution: Silent failure is forbidden and research D1 (partial)
- [X] T059 [P] Cover the unresolved-placement path: add a test in `test/unit/nesting/cost/collectUsage.test.ts` with `sparsePlacementFixture(2)` asserting that a placement whose sheet cannot be determined is not costed and raises one `PLACEMENT_SHEET_UNRESOLVED` warning naming its part key, per data-model notice codes (partial)
- [X] T060 [P] Assert the notices behind every missing input: extend `test/unit/nesting/cost/buildCostBreakdown.test.ts` so that removing `speeds.cutting`, `speeds.rapid`, `speeds.pierceDwellSeconds` and a consumable `life` each yields exactly one notice with the codes `MISSING_SPEED`, `MISSING_SPEED`, `MISSING_DWELL` and `MISSING_CONSUMABLE_LIFE` and a message naming the input, per FR-004 and SC-002 (partial)
- [X] T061 [P] Document the exact export columns where integrators read them: list the 20 `parts` columns, the 6 `job` columns and the metric names in their fixed order in `src/nesting/cost/costReportTables.doc.md`, and keep them identical to `specs/008-nesting-cost-reporting/contracts/cost-reporting-api.md`, per FR-015 (partial)
- [X] T062 [P] Lower the complexity of `categoryAmount` in `src/nesting/cost/componentAmounts.ts` (cyclomatic 12, quality gate warning CRAP 43.1) by resolving the rates and the consumable usage once per call into a small typed record and replacing the optional-chaining chain, keeping `test/unit/nesting/cost/componentAmounts.test.ts` passing and `yarn quality:gate` free of warnings for the file, per plan: Constraints "functions stay small" (partial)
