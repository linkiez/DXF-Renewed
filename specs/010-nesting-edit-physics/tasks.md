---

description: "Implementation tasks for nesting layout editing and cut risk simulation"
---

# Tasks: Nesting Layout Editing and Cut Risk Simulation

**Input**: Design documents from `/specs/010-nesting-edit-physics/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/edit-risk-api.md`, `quickstart.md`

**Tests**: Required by the project constitution (Principle III). Every behavior task follows
Red → Green → Refactor: the test task for a behavior is written first and must fail for the expected
reason before the matching implementation task starts.

**Documentation**: Every task that changes a file under `src/` also creates or updates that file's
sibling `.doc.md` in the same task and commit. No other documentation is created or edited.

**Quality gate**: The pre-commit hook runs `yarn test` and `yarn quality:gate`; the gate fails on high
cyclomatic or cognitive complexity and on unused or unresolved files, so functions stay small and
imports resolve. Never bypass it. Playwright regenerates `test/rendered/*.png`: run
`git checkout -- test/rendered` after browser runs.

**Organization**: Tasks are grouped by user story. US1 is the MVP: judge, commit, undo and redo a part
edit, with the review's drag, overlay and keyboard editing. US3 (the pure risk module) does not depend
on US1 or US2 and can run in parallel with them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story of the task (US1–US4); Setup, Foundational and Polish have none
- Source paths are under `src/nesting/edit/`, `src/nesting/risk/`, `src/nesting/linking/` and
  `src/nesting/review/`; unit tests under `test/unit/nesting/edit/`, `test/unit/nesting/risk/`,
  `test/unit/nesting/linking/` and `test/unit/nesting/review/`; browser specs under
  `test/integration-browser/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature skeleton.

- [X] T001 Create `src/nesting/edit/`, `src/nesting/risk/`, `test/unit/nesting/edit/` and `test/unit/nesting/risk/` per `specs/010-nesting-edit-physics/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract the action duration shared with the cost, then define the types, messages, fixtures and barrels every story needs.

**Critical**: No user story work starts until this phase is complete.

- [X] T002 [P] Add tests for the shared action helpers in `test/unit/nesting/linking/actionDuration.test.ts`: `actionCategory(kind)` maps `cut`, `lead-in`, `lead-out`, `overcut`, `tab` and `common-line` to `cut`, `rapid` to `travel`, `pierce` to `pierce` and `end` to no category (the same table as `CATEGORY` in `src/nesting/cost/collectUsage.ts`); `actionDuration({ category, length, feed, dwell }, speeds, geometryUnitsPerMeter)` returns seconds = length / geometryUnitsPerMeter / speed x 60 for `cut` and `travel`, the action's numeric `feed` taking precedence over `speeds.cutting` and `speeds.rapid`, the action's numeric `dwell` taking precedence over `speeds.pierceDwellSeconds` for `pierce`, `0` for a zero length, and `null` when the speed or dwell it needs is absent or not greater than zero (never a guess)
- [X] T003 Implement `actionCategory` in `src/nesting/linking/actionCategory.ts` and `actionDuration` in `src/nesting/linking/actionDuration.ts`, each with its sibling `.doc.md`, by moving the category table and the per-action seconds logic out of `src/nesting/cost/collectUsage.ts` and `src/nesting/cost/estimateTimes.ts`; make those two files call the shared helpers with identical results; update their `.doc.md`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T002)
- [X] T004 Run the whole `test/unit/nesting/cost/` suite, `test/unit/nesting/linking/` and `test/integration/nesting/costRealParts.test.ts` and confirm the cost behavior is unchanged; fix any difference in the shared helpers, not in the cost tests (depends on T003)
- [X] T005 [P] Add tests for the shared output projection in `test/unit/nesting/erp/outputProjection.test.ts`: `outputProjection(contractVersion, plan, unplaced)` returns the same canonical projection that `createNestingArtifact` digests, so its SHA-256 equals the `outputDigest` of an artifact built from the same request and plan; identical input gives an identical projection; the plan and the unplaced list are never mutated
- [X] T006 Implement `outputProjection` in `src/nesting/erp/outputProjection.ts` with its sibling `.doc.md` by moving the projection out of `src/nesting/erp/artifact.ts` (taking the contract version instead of a request), make `createNestingArtifact` call it, update `src/nesting/erp/artifact.doc.md`, and run the whole `test/unit/nesting/erp/` suite and `test/integration/nesting/` to confirm every existing digest is unchanged; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T005)
- [X] T007 Define all public edit types in `src/nesting/edit/types.ts` exactly as in `specs/010-nesting-edit-physics/contracts/edit-risk-api.md` and `data-model.md`, with JSDoc and its sibling `.doc.md`; reuse `ErpNestingArtifact`, `CutLayout`, `CutPlanResult`, `Placement` and `Point2D`; constraints verbatim: `EditInput.limits.maxLogLength` is "default 100, must be an integer >= 100"; `EditConstraints.parts[shapeId].grainLocked` "requires `grainAngle`"; `PartEdit.partKey` is "key of the placed part (`shapeId#instanceIndex`), must exist on the sheet"; `PartEdit.delta` is "`move`: `{dx, dy}` finite; `rotate`: `{degrees}` finite; `mirror`: none"; `PlacementVerdict.valid` is "true only when `violations` is empty" and `violations` come "in fixed order: overlap, area, forbidden zone, spacing, orientation"; `Violation.code` is one of `OVERLAP`, `OUTSIDE_USABLE_AREA`, `FORBIDDEN_ZONE`, `SPACING_TOO_SMALL`, `ROTATION_NOT_ALLOWED`, `GRAIN_LOCKED`, `MIRROR_NOT_ALLOWED`, `CONSTRAINTS_UNKNOWN`, `GROUP_INVALID`; notice codes `APPROXIMATE_OUTLINE`, `RECOMPUTE_DISCARDED`, `EDIT_LOG_FULL`, `PLAN_RECOMPUTE_FAILED`, `COST_RECOMPUTE_FAILED`, `RISK_UNAVAILABLE`, `COMMON_LINE_BROKEN`, `NO_LAYOUT`, `INVALID_ARTIFACT`, `UNSUPPORTED_CONTRACT_VERSION`; `EditState.revision` is "an integer that increases on every commit, undo and redo"; `RecomputeStep.revision` is the revision the step started from and a step whose revision differs from the state's is discarded; `EditedArtifact.edit.log` holds "applied edits only (`edits[0..cursor)`), in order" (depends on T001)
- [X] T008 [P] Add message tests in `test/unit/nesting/edit/messages.test.ts`: every violation code and every edit notice code has a Brazilian Portuguese message builder, identifiers and values are interpolated, no builder returns an empty string, snapshot of the pt_BR text
- [X] T009 Implement `src/nesting/edit/messages.ts` as the single internal module holding every text the edit module produces (pt_BR), not exported through the barrel, with its sibling `.doc.md` (depends on T007, T008)
- [X] T010 [P] Add the edit test fixtures in `test/unit/nesting/edit/fixtures.ts`: a reference artifact with one sheet carrying a hole (a remnant exclusion), five placed parts including one part that encloses another in a hole and one part close to the edge, with `edgeClearance` and `partToPartClearance` set; the matching `CutLayout`; `EditConstraints` allowing 0 and 90 degrees with one grain-locked part and one mirrorable part; variants without `constraints`, without `layout` (approximate outlines), with an invalid artifact and with an unsupported contract version
- [X] T011 Define all public risk types in `src/nesting/risk/types.ts` exactly as in `specs/010-nesting-edit-physics/contracts/edit-risk-api.md` and `data-model.md`, with JSDoc and its sibling `.doc.md`; reuse `ErpNestingArtifact`, `CutLayout`, `CutPlanResult`, `ErpDigest` and the cost `speeds` shape; constraints verbatim: `CutRiskProfile.geometryUnitsPerMeter` is "finite, > 0, required for every rule"; `heat` is "`{ radius?, windowSeconds?, maxCutLength? }` meters, seconds, meters, each > 0"; `web.minimum` is "meters > 0"; `loosePart.maxArea` is "square meters > 0"; `headStrike.clearance` is "meters > 0"; `criticalFactor` is "number > 1; absent means findings are never graded `critical`"; `RiskFinding.category` is `heat` | `thin-web` | `loose-part` | `head-strike` and `severity` is `warning` | `critical`; `RiskReport.indicative` is always `true`; `RiskReport.status` is `partial` "when at least one rule is not assessable" and `unavailable` "when the profile is invalid or the plan has no actions" (depends on T001)
- [X] T012 [P] Add message tests in `test/unit/nesting/risk/messages.test.ts`: every finding message, mitigation text and risk notice code (`ESTIMATED_LIMIT`, `RULE_NOT_ASSESSABLE`, `SEVERITY_NOT_GRADED`, `PROFILE_INVALID`, `NO_ACTIONS`, `INDICATIVE`) has a pt_BR builder that interpolates the measured value, the limit and the unit, none returns an empty string, snapshot of the pt_BR text
- [X] T013 Implement `src/nesting/risk/messages.ts` as the single internal module holding every text the risk module produces (pt_BR), not exported through the barrel, with its sibling `.doc.md` (depends on T011, T012)
- [X] T014 [P] Add the risk test fixtures in `test/unit/nesting/risk/fixtures.ts`: a complete `CutRiskProfile` with every limit and `criticalFactor`; variants missing one limit each, with an estimated limit, with `geometryUnitsPerMeter` zero, and without `criticalFactor`; planted jobs built from an artifact, layout and cut plan: a dense cluster cut in sequence, a thin web between two parts, a small part freed early, a head path over a freed small part, a tab-held small part, and a safe job; every planted job names the finding it must produce
- [X] T015 Add the barrel scaffolds `src/nesting/edit/index.ts` and `src/nesting/risk/index.ts` and reserve the additive re-exports in `src/nesting/index.ts`, updating `src/nesting/index.doc.md` and writing the two barrel `.doc.md` files (depends on T007, T011)

**Checkpoint**: Shared duration extracted with the cost behavior unchanged; edit and risk types, messages, fixtures and barrels ready.

---

## Phase 3: User Story 1 - Reposition Parts With Instant Validity Feedback (Priority: P1) 🎯 MVP

**Goal**: A planner moves, rotates or mirrors a placed part and sees at once whether the spot is valid and why not; only valid edits can be confirmed; undo and redo restore exact states.

**Independent Test**: Open the reference artifact, move one part in small steps over a neighbour, past the edge, into a hole and closer than the spacing, and verify each step reports the right verdict and reason, that only valid positions can be confirmed, and that undo and redo return the exact layouts.

> Write each test first and confirm it fails for the expected reason before implementing.

### Tests for the edit model

- [X] T016 [P] [US1] Add transform tests in `test/unit/nesting/edit/transformPlacement.test.ts`: a move translates `transformedVertices`, `bbox`, `x` and `y` by the same delta; a rotation rotates the outline about `(x, y)` and adds to `rotation` modulo 360; a mirror reflects the outline about the vertical axis through `(x, y)` and the stored outline is normalized with `normalizeWinding` so the winding is the one the planner expects; a compound placement is transformed as one unit (its own `x`, `y`, `rotation` and `bbox`, its `outerPlacement` and every `holePlacements` entry); the relation `(x, y)` = centroid position is proven by comparing a rotated placement with the `transformedVertices` the true-shape search produces for the same shape (research "Open items"); the input placement is never mutated; the result is identical for identical input
- [X] T017 [P] [US1] Add neighbour index tests in `test/unit/nesting/edit/neighbourIndex.test.ts`: a query returns only the parts whose box intersects the candidate box expanded by a clearance, in a stable order; updating one part moves it between cells; a 500-part sheet answers a query without scanning all parts (count the visited candidates)
- [X] T018 [P] [US1] Add enclosed group tests in `test/unit/nesting/edit/enclosedGroup.test.ts`: parts whose outline lies inside a hole of the moved part are returned as its group, in a stable order, with the holes taken from the inner contours of the `CutLayout` and from the `holePlacements` of compound placements; without either source the group is empty and the result says the group is unknown; a part with no holes has an empty group; a part lying in the hole of a different part is not in the group
- [X] T019 [P] [US1] Add creation tests in `test/unit/nesting/edit/createEditState.test.ts`: a valid artifact gives a state with an empty log and the freshness of plan, cost, validation and risk `current` and `revision` 0; an artifact rejected by the 006 schema gives `state: null` with `INVALID_ARTIFACT`; an unsupported contract version gives `UNSUPPORTED_CONTRACT_VERSION`; an artifact without placements gives `NO_LAYOUT`; a missing `layout` input gives the `APPROXIMATE_OUTLINE` notice only when an outline is just a bounding box; `limits.maxLogLength` below 100 or not an integer is rejected; a grain-locked part without `grainAngle` is rejected; no input object is mutated
- [X] T020 [P] [US1] Add verdict tests in `test/unit/nesting/edit/judgePlacement.test.ts`: overlap with a neighbour, outside the usable area and margins, inside a stock hole and inside an `exclusions` area, closer than `partToPartClearance`, a rotation not in the allowed list, a grain-locked part rotated off its grain, and a mirror on a part that is not mirrorable each give their code, and every violation of one candidate is reported in the fixed order overlap, area, forbidden zone, spacing, orientation; a position exactly at a limit is valid within `EPSILON`; without `constraints` a rotation or mirror gives `CONSTRAINTS_UNKNOWN` while a move is judged normally; a part with an enclosed group is judged with its group and an invalid member gives `GROUP_INVALID`; a placement whose outline is only a bounding box, or a part whose enclosed group cannot be determined, marks the verdict `approximate`; the original state is never mutated and the verdict is identical for identical input (SC-002)
- [X] T021 [P] [US1] Add commit tests in `test/unit/nesting/edit/commitEdit.test.ts`: a valid edit is appended at the cursor, the redo branch is discarded, the cursor advances and every derived result becomes `outdated` and `revision` increases by one; an invalid edit returns the same state and its verdict, never applies; the log records part key, kind, `before` and `after`; a log longer than `limits.maxLogLength` returns the same state with `EDIT_LOG_FULL` instead of dropping history; moving a part with an enclosed group moves the whole group
- [X] T022 [P] [US1] Add undo, redo and materialization tests in `test/unit/nesting/edit/undoRedo.test.ts`: after 100 confirmed edits, undoing all and redoing all returns the layout of `editedLayout` and its canonical form identical to each recorded step (SC-003); undo at cursor 0 and redo at the end return the same state; a commit after an undo discards the redo branch; `editedLayout` never mutates the base artifact, updates `placements` and `compoundPlacements` together and gives the base layout for an empty log
- [X] T023 [P] [US1] Add freshness tests in `test/unit/nesting/edit/freshness.test.ts`: a commit marks plan, cost, validation and risk `outdated`; a recomputation marks only its own result `current`; undo or redo to a cursor for which a result was computed makes that result `current` again and any other `outdated`; a recomputation step whose `revision` differs from the state's is discarded, never marks a result `current` and gives `RECOMPUTE_DISCARDED`; no result is ever reported `current` for a layout it was not computed from (SC-005)
- [X] T024 [P] [US1] Add edited layout tests in `test/unit/nesting/edit/editedCutLayout.test.ts`: `editedCutLayout` returns `null` when the input had no `CutLayout`; every contour of an edited part (outer, and inner contours found by `parentContourId`) carries the edited placement and outline while the other contours, the sheets and `startPoint` are unchanged; the result is accepted by `validateCutLayout`; the input layout is never mutated; an empty log gives a layout equal to the input

### Implementation of the edit model

- [X] T025 [US1] Implement `transformPlacement` in `src/nesting/edit/transformPlacement.ts` with its sibling `.doc.md` using `rotatePolygon`, `translatePolygon` and `computeBoundingBox` from `src/nesting/polygonUtils.ts`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T016)
- [X] T026 [P] [US1] Implement `neighbourIndex` in `src/nesting/edit/neighbourIndex.ts` with its sibling `.doc.md` as a uniform grid of part boxes with stable ordering; keep every function small (depends on T017)
- [X] T027 [P] [US1] Implement `enclosedGroup` in `src/nesting/edit/enclosedGroup.ts` with its sibling `.doc.md` using `pointInPolygon` from `src/nesting/polygonUtils.ts`; keep every function small (depends on T018, T025)
- [X] T028 [US1] Implement `createEditState` in `src/nesting/edit/createEditState.ts` with its sibling `.doc.md`: validate with `erpNestingArtifactSchema`, resolve the placed parts with `placedParts` from `src/nesting/linking/placedParts.ts`, build the neighbour index per sheet, start with an empty log, cursor 0 and all freshness `current`; keep every function small (depends on T019, T009, T026)
- [X] T029 [US1] Implement `editedLayout` in `src/nesting/edit/editedLayout.ts` with its sibling `.doc.md`: materialize the layout, including `compoundPlacements`, from the base and `edits[0..cursor)` without mutating the base (depends on T022, T025, T028)
- [X] T030 [US1] Implement `editedCutLayout` in `src/nesting/edit/editedCutLayout.ts` with its sibling `.doc.md` reusing `transformPlacement` and `validateCutLayout` from `src/nesting/cutPath/validate.ts`; keep every function small (depends on T024, T029)
- [X] T031 [US1] Implement `judgePlacement` in `src/nesting/edit/judgePlacement.ts` with its sibling `.doc.md` reusing `isWithinBounds`, `isSeparatedFromAll` and `polygonDistance` from `src/nesting/trueShape/`, `checkCollision` from `src/nesting/collision.ts` and `effectiveRotations` from `src/nesting/trueShape/rotations.ts`; one small helper per violation kind, cheap box rejects before exact checks; keep every function small (depends on T020, T025, T026, T027, T028)
- [X] T032 [US1] Implement `freshness` in `src/nesting/edit/freshness.ts` with its sibling `.doc.md`: the freshness map, the revision counter and the discard rule, used by `commitEdit`, `undoEdit` and `redoEdit`; keep every function small (the pre-commit quality gate rejects high cyclomatic or cognitive complexity) (depends on T023, T007)
- [X] T033 [US1] Implement `commitEdit` in `src/nesting/edit/commitEdit.ts` with its sibling `.doc.md` (depends on T021, T029, T031, T032)
- [X] T034 [P] [US1] Implement `undoEdit` in `src/nesting/edit/undoEdit.ts` with its sibling `.doc.md` (depends on T022, T029, T032)
- [X] T035 [P] [US1] Implement `redoEdit` in `src/nesting/edit/redoEdit.ts` with its sibling `.doc.md` (depends on T022, T029, T032)
- [X] T036 [US1] Export `createEditState`, `judgePlacement`, `commitEdit`, `undoEdit`, `redoEdit`, `editedLayout`, `editedCutLayout` and the US1 types from `src/nesting/edit/index.ts` and `src/nesting/index.ts`, updating the barrel `.doc.md` files (depends on T033, T034, T035, T030, T015)
- [X] T037 [US1] Run the US1 edit suites (`yarn test:unit`) and fix failures in `test/unit/nesting/edit/` and `src/nesting/edit/`

### Tests for the review integration

- [X] T038 [P] [US1] Add overlay tests in `test/unit/nesting/review/editOverlay.test.ts`: the ghost carries the candidate outline, `valid` and the violations; every violation yields a mark with a text label and a pattern cue, never colour alone; an empty verdict yields a valid ghost; the builder is pure and identical for identical input
- [X] T039 [P] [US1] Add controller edit tests in `test/unit/nesting/review/controller.edit.test.ts`: `enterEdit`, `selectEditPart`, `proposeEdit`, `confirmEdit`, `cancelEdit`, `undo`, `redo` publish `EditPanelState` through `state$` (`mode`, `activePart`, `candidate`, `verdict`, `freshness`, `canUndo`, `canRedo`); `confirmEdit` of an invalid candidate changes nothing and keeps the reasons; a confirmed edit rebuilds the scene with `buildReviewScene` from the edited layout (`editedCutLayout`) and without the cut plan, `planVisible` is false and the old action paths are not drawn until the plan is recomputed; the input artifact is never mutated; commands outside edit mode are ignored
- [X] T040 [P] [US1] Add key map tests in `test/unit/nesting/review/keyMap.edit.test.ts`: in edit mode the arrow keys nudge the candidate by the configured step, `Enter` confirms, `Escape` cancels, `Ctrl+Z` undoes and `Ctrl+Y` or `Ctrl+Shift+Z` redoes; outside edit mode every existing binding behaves as before
- [X] T041 [P] [US1] Add the US1 browser specs in `test/integration-browser/review.edit.browser.spec.ts`: dragging a part over a neighbour, past the edge, into a hole and closer than the spacing shows each violation in text and refuses to confirm; a valid drop confirms; numeric offset and angle entry and the arrow keys give the same verdicts; refused rotation and mirror state which rule forbids them; undo and redo restore the layout; every verdict change is announced in pt-BR; the same in the static and the accelerated renderer; no violation is conveyed by colour alone; after a confirmed edit the old cut path is hidden and the plan is marked outdated in text (US1/AC1–AC5, FR-006)
- [X] T042 [US1] Add the SC-001 measurement to `test/integration-browser/review.edit.browser.spec.ts`: mount the 500-part reference sheet of the 007 fixtures, drag one part across the sheet in 60 steps through the verdict path, record the time of each step from the pointer move to the drawn verdict, repeat five times and assert the worst step is under 100 ms in the reference browser (SC-001) (depends on T041)

### Implementation of the review integration

- [X] T043 [US1] Add the review contract types in `src/nesting/review/types.ts`: `ReviewOverlay`, `EditPanelState`, `ReviewEditOptions` (`constraints?`, `step?: { move: number; rotate: number }`, `onChange?(state)`), the optional `ReviewRenderer.overlay?(overlay: ReviewOverlay): void`, the edit commands of `ReviewController` and `edit?` on the mount options, exactly as in `specs/010-nesting-edit-physics/contracts/edit-risk-api.md`, including every type the later stories use (`ReviewRiskOptions` with `profile`, `processProfile` and `costModel?`, the `risk?` mount option, `recompute()`, `seekToFinding(id)`, `showHeat(on)` and `planVisible` in `EditPanelState`); update `src/nesting/review/types.doc.md` (depends on T007)
- [X] T044 [US1] Implement the overlay builder in `src/nesting/review/overlay.ts` with its sibling `.doc.md` to satisfy T038 (depends on T038, T043, T031)
- [X] T045 [US1] Add the edit labels and announcements (pt_BR) to `src/nesting/review/messages.ts` and `src/nesting/review/announce.ts`: verdict changes, confirm, cancel, undo, redo and refusal reasons; update their `.doc.md` and `test/unit/nesting/review/messages.test.ts` first (depends on T043, T009)
- [X] T046 [US1] Implement the edit commands in `src/nesting/review/editCommands.ts` with its sibling `.doc.md` and wire them in `src/nesting/review/controller.ts`, delegating to the edit module and rebuilding the scene after a confirmed edit, to satisfy T039; keep `controller.ts` under 500 lines and every function small (depends on T039, T043, T036, T030)
- [X] T047 [US1] Add the edit mode bindings to `src/nesting/review/keyMap.ts` to satisfy T040, updating its `.doc.md` (depends on T040, T046)
- [X] T048 [P] [US1] Implement `overlay` in the static renderer `src/nesting/review/svgRenderer.ts`: ghost outline with a dashed pattern when invalid and a solid one when valid, violation marks with a text label, drawn above the sheet and below the tool head; update its `.doc.md` (depends on T044)
- [X] T049 [P] [US1] Implement `overlay` in the accelerated renderer through `src/nesting/review/three/updateOverlay.ts` with its sibling `.doc.md` and wire it in `src/nesting/review/three/renderer.ts` with the same cues as the static renderer; update the renderer `.doc.md` (depends on T044)
- [X] T050 [US1] Implement the edit panel in `src/nesting/review/editPanel.ts` with its sibling `.doc.md`: edit mode toggle, kind selector, numeric offset and angle fields, confirm, cancel, undo, redo, the violation list in text, a labelled live region; semantic HTML with landmarks and a heading hierarchy (depends on T043, T045, T046)
- [X] T051 [US1] Implement pointer dragging in `src/nesting/review/attachDrag.ts` with its sibling `.doc.md`: pointer down on the selected part starts a candidate, moves publish `proposeEdit` through `renderer.pointAt`, release proposes the final position without confirming; wire it in `src/nesting/review/attachSession.ts` (depends on T046, T048)
- [X] T052 [US1] Wire the `edit` mount option in `src/nesting/review/mount.ts` and `src/nesting/review/buildPanels.ts`, add the edit panel and the drag handler only when the option is supplied, and keep the review unchanged without it; update their `.doc.md` (depends on T050, T051, T047)
- [X] T053 [US1] Run `yarn test:unit`, `yarn dist` and `npx playwright test review.edit` for the US1 specs (including the SC-001 measurement), run `git checkout -- test/rendered`, and fix failures in `src/nesting/review/` and `test/`

**Checkpoint**: US1 is independently functional: parts can be moved, rotated and mirrored with live verdicts, confirmed only when valid, and undone and redone exactly, in the review and in the model.

---

## Phase 4: User Story 2 - Get an Edited, Traceable Result With Fresh Consequences (Priority: P1)

**Goal**: After editing, plan, cost and validations are recomputed on request, outdated results are never shown as current, and the edited layout leaves as a new artifact that refers to the original.

**Independent Test**: Edit one part, confirm plan, cost and risk are marked outdated, recompute them, and verify the edited artifact refers to the original digest, lists the edit and reproduces byte for byte when the same edits are replayed.

> Write each test first and confirm it fails for the expected reason before implementing.

- [X] T054 [P] [US2] Add edited result tests in `test/unit/nesting/edit/buildEditedArtifact.test.ts`: with an empty log `artifact.outputDigest` equals `edit.originalOutputDigest`; with edits the inner artifact keeps correlation, snapshots and `inputDigest` and gets a new `outputDigest` from the same canonical projection as `createNestingArtifact`; `edit.log` holds only the applied edits; `edit.digest` is the SHA-256 of the canonical JSON of the result without that field; the inner artifact is accepted by `erpNestingArtifactSchema`; the original artifact is unchanged; five consecutive builds are identical (SC-004)
- [X] T055 [P] [US2] Add recomputation tests in `test/unit/nesting/edit/recomputeEdited.test.ts`: steps `plan` then `cost` are emitted in that order and complete; `plan` runs `planCutPath` on the edited `CutLayout`; `cost` depends on `plan` and uses `buildCostBreakdown`; a planner failure gives `PLAN_RECOMPUTE_FAILED`, step `unavailable` and a skipped cost step, while the edited layout is kept; a cost failure gives `COST_RECOMPUTE_FAILED`; moving a part that shared a common line gives `COMMON_LINE_BROKEN`; each successful step marks only its own result `current`; every step carries the `revision` it started from, and a commit, undo or redo while a run is in progress makes the later steps of that run discarded with `RECOMPUTE_DISCARDED` and leaves the results `outdated`; a structurally invalid request rejects the Observable; no input is mutated (US2/AC1, AC4)
- [X] T056 [P] [US2] Add comparison tests in `test/unit/nesting/edit/compareLayouts.test.ts`: validity, cut seconds, cost and risk counts per category are reported before, after and as a delta; a figure that is outdated or unavailable on either side is `null` with a notice, never a number; an empty log gives zero deltas (US2/AC5)
- [X] T057 [P] [US2] Add the US2 browser specs to `test/integration-browser/review.edit.browser.spec.ts`: after a confirmed edit the plan, cost and risk figures show as outdated in text, recomputing makes them current, a forced planner failure shows the reasons and the plan as unavailable, the comparison summary lists the changes, an edit during a recomputation discards that run and tells the user, the old cut path stays hidden until the plan step succeeds and then the new plan is shown, building the edited result in the browser gives the same `outputDigest` and `edit.digest` as the values computed in Node for the same fixture (SC-004 browser leg), and every change is announced in pt-BR
- [X] T058 [US2] Implement `buildEditedArtifact` in `src/nesting/edit/buildEditedArtifact.ts` with its sibling `.doc.md` as a cold Observable using `digestCanonical`, `canonicalize` and `outputProjection` from `src/nesting/erp/outputProjection.ts` and `observeFlow` from `src/nesting/async/`; keep every function small (depends on T054, T029, T006)
- [X] T059 [US2] Implement `recomputeEdited` in `src/nesting/edit/recomputeEdited.ts` with its sibling `.doc.md` as a cold Observable composing `planCutPath` and `buildCostBreakdown` through `editedCutLayout`, stamping every step with the state's `revision`, with the failure and `COMMON_LINE_BROKEN` rules of T055; keep every function small (depends on T055, T029, T030, T032)
- [X] T060 [US2] Implement `compareLayouts` in `src/nesting/edit/compareLayouts.ts` with its sibling `.doc.md` (depends on T056, T032)
- [X] T061 [US2] Export `buildEditedArtifact`, `recomputeEdited`, `compareLayouts` and the US2 types from `src/nesting/edit/index.ts` and `src/nesting/index.ts`, updating the barrel `.doc.md` files (depends on T058, T059, T060)
- [X] T062 [US2] Add the freshness display, the `recompute()` command and the comparison summary to the edit panel and the controller in `src/nesting/review/editPanel.ts` and `src/nesting/review/editCommands.ts`, with the `onChange` hook, the pt-BR announcements and the `RECOMPUTE_DISCARDED` notice; a successful plan step rebuilds the scene with the new plan and sets `planVisible`; updating their `.doc.md` (depends on T057, T061, T050, T046)
- [X] T063 [US2] Run `yarn test:unit` and the US2 browser specs (`yarn dist && npx playwright test review.edit`), run `git checkout -- test/rendered`, and fix failures

**Checkpoint**: US2 is independently functional: edits yield a traceable edited artifact, derived results are never shown stale, and recomputation and comparison work.

---

## Phase 5: User Story 3 - Assess Thermal and Mechanical Cutting Risks (Priority: P2)

**Goal**: A planner gets an indicative report of heat accumulation, thin web, loose part and head strike risks from a cut plan and a caller-supplied risk profile, with a missing limit reported as not assessable.

**Independent Test**: Assess reference jobs built to contain each risk and one safe job, and verify each risk is found with category, location and reason, the safe job has no critical finding, and a profile missing a limit reports that rule as not assessable.

> Write each test first and confirm it fails for the expected reason before implementing. This phase does not depend on US1 or US2 and can run in parallel with them.

### Tests

- [X] T064 [P] [US3] Add profile tests in `test/unit/nesting/risk/validateRiskProfile.test.ts`: the schema and the checks accept the complete profile; `geometryUnitsPerMeter` zero, negative or not finite is rejected with `PROFILE_INVALID`; `heat.radius`, `heat.windowSeconds`, `heat.maxCutLength`, `web.minimum`, `loosePart.maxArea` and `headStrike.clearance` not greater than zero are rejected; `criticalFactor` not greater than 1 is rejected; a value marked `estimated: true` raises `ESTIMATED_LIMIT`; an unknown field is ignored; the profile is never mutated
- [X] T065 [P] [US3] Add freed moment tests in `test/unit/nesting/risk/freedMoments.test.ts`: a part becomes free at the action that closes its outer contour, with its plan time; a part with `tab` actions on that contour is `held`; `loose` is true when the area is at or below `loosePart.maxArea`; moments are linked with `linkActions` so they agree with the review and the cost; order is stable by action index then part key
- [X] T066 [P] [US3] Add heat tests in `test/unit/nesting/risk/heat.test.ts`: action times come from `actionDuration` with the profile `speeds` and `geometryUnitsPerMeter`, the `feed` and `dwell` metadata taking precedence; cut length is split by grid cell with cell size `heat.radius / 2` and its plan-time interval; `heatAt` sums the events inside the trailing `heat.windowSeconds` and divides by `heat.maxCutLength`, cells with value 0 are omitted, values above 1 are over the limit; seeking back and forth gives identical views; missing speeds make the view unavailable with the missing path named
- [X] T067 [P] [US3] Add heat rule tests in `test/unit/nesting/risk/assessHeat.test.ts`: the dense cluster of the fixtures produces a `heat` finding with region, plan time, measured length and limit; the same cuts spread apart produce none; a cooling gap longer than the window produces none; a missing `heat.*` limit gives the rule not assessable naming the path
- [X] T068 [P] [US3] Add thin web tests in `test/unit/nesting/risk/assessThinWeb.test.ts`: two outlines closer than `web.minimum` produce a `thin-web` finding with both part keys, the measured distance and the limit; a distance exactly at the limit produces none within `EPSILON`; the distance to a sheet edge and to a stock hole is also checked; only nearby pairs are compared (count the pair checks); missing `web.minimum` gives the rule not assessable
- [X] T069 [P] [US3] Add loose part tests in `test/unit/nesting/risk/assessLoosePart.test.ts`: a free part with area at or below `loosePart.maxArea` produces a `loose-part` finding with its freed action and measured area; a larger part, a `held` part and a part that stays attached produce none; missing `loosePart.maxArea` gives the rule not assessable
- [X] T070 [P] [US3] Add head strike tests in `test/unit/nesting/risk/assessHeadStrike.test.ts`: a cut or rapid path passing within `headStrike.clearance` of a loose part after it was freed produces a `head-strike` finding with the action index, the part and the distance; the same path before the part is freed, or over a `held` or large part, produces none; a path far from every freed part produces none; the check uses a spatial grid (count the segment checks); missing `headStrike.clearance` gives the rule not assessable
- [X] T071 [P] [US3] Add aggregation tests in `test/unit/nesting/risk/assessCutRisk.test.ts`: each planted job gives exactly its planted finding under the right category with `measured`, `limit` and `unit`; the safe job has no `critical` finding; a finding is `warning` when the measure reaches the limit and `critical` at limit x `criticalFactor`, and without `criticalFactor` all findings stay `warning` with `SEVERITY_NOT_GRADED`; `rules` lists every rule as assessable or not with the missing paths; `status` is `partial` when a rule is not assessable and `unavailable` for an invalid profile or a plan without actions; every report has `indicative: true`; findings are ordered by severity, category, sheet, action index and part key; identical inputs give identical results; no input is mutated (FR-009–FR-012, FR-017)
- [X] T072 [P] [US3] Add flow tests in `test/unit/nesting/risk/calculateRiskReport.test.ts`: the Observable emits one report and completes; the report carries `profileDigest` and `digest` (SHA-256 of the canonical JSON without the digest field); an invalid profile yields an `unavailable` report with `PROFILE_INVALID` notices instead of an error; a structurally invalid request rejects the Observable; five runs give identical digests
- [X] T073 [P] [US3] Add the performance test in `test/unit/nesting/risk/riskPerformance.test.ts` reusing `referenceFixture` from `test/unit/nesting/review/fixtures.ts`: `assessCutRisk` on the 500-part reference job with a profile that makes every rule assessable, worst of five runs under 2 s (SC-006), and the number of pair, cell and segment checks stays near-linear in the parts and actions

### Implementation

- [X] T074 [US3] Implement the Zod schema of the risk profile in `src/nesting/risk/schemas.ts` with its sibling `.doc.md`, aligned with the exported type, as the same caller-boundary use as ADR-0002 (depends on T064, T011)
- [X] T075 [US3] Implement `validateRiskProfile` in `src/nesting/risk/validateRiskProfile.ts` with its sibling `.doc.md` for the checks the schema cannot state cleanly; keep every function small (depends on T064, T074, T013)
- [X] T076 [P] [US3] Implement `actionTimes` in `src/nesting/risk/actionTimes.ts` with its sibling `.doc.md` as the start and end plan time of each action using `actionDuration` and `actionCategory`; keep every function small (depends on T066, T003)
- [X] T077 [P] [US3] Implement `freedMoments` in `src/nesting/risk/freedMoments.ts` with its sibling `.doc.md` on top of `linkActions` and `placedParts`; keep every function small (depends on T065, T076)
- [X] T078 [P] [US3] Implement `heatEvents` in `src/nesting/risk/heatEvents.ts` with its sibling `.doc.md` using `sampleActionPath` from `src/nesting/linking/actionPath.ts`; keep every function small (depends on T066, T076)
- [X] T079 [US3] Implement `heatAt` in `src/nesting/risk/heatAt.ts` with its sibling `.doc.md` (depends on T066, T078)
- [X] T080 [P] [US3] Implement `assessHeat` in `src/nesting/risk/assessHeat.ts` with its sibling `.doc.md` (depends on T067, T078)
- [X] T081 [P] [US3] Implement `assessThinWeb` in `src/nesting/risk/assessThinWeb.ts` with its sibling `.doc.md` using `polygonDistance` from `src/nesting/trueShape/bounds.ts` and a bounding-box prefilter (depends on T068)
- [X] T082 [P] [US3] Implement `assessLoosePart` in `src/nesting/risk/assessLoosePart.ts` with its sibling `.doc.md` (depends on T069, T077)
- [X] T083 [P] [US3] Implement `assessHeadStrike` in `src/nesting/risk/assessHeadStrike.ts` with its sibling `.doc.md` using a spatial grid of the loose parts; keep every function small (depends on T070, T077, T076)
- [X] T084 [US3] Implement the synchronous core `assessCutRisk` in `src/nesting/risk/assessCutRisk.ts` with its sibling `.doc.md`: validate the profile, run the four rules, grade severity, build `rules`, `status`, notices and the indicative statement, order findings as in T071; never mutate the request; keep every function small (depends on T071, T075, T080, T081, T082, T083)
- [X] T085 [US3] Implement `calculateRiskReport` in `src/nesting/risk/calculateRiskReport.ts` with its sibling `.doc.md` as a cold Observable using `digestCanonical`, `canonicalize` and `observeFlow` (depends on T072, T084)
- [X] T086 [US3] Export `assessCutRisk`, `calculateRiskReport`, `heatAt`, `validateRiskProfile` and the US3 types from `src/nesting/risk/index.ts` and `src/nesting/index.ts`, updating the barrel `.doc.md` files (depends on T085, T079)
- [X] T087 [US3] Extend `test/unit/nesting/edit/recomputeEdited.test.ts` with the `risk` step: it runs after `plan`, uses `assessCutRisk` on the edited layout and plan, is omitted when no `riskProfile` is supplied, gives `RISK_UNAVAILABLE` when the profile is invalid or the plan failed, and marks only the risk result `current` (depends on T059, T086)
- [X] T088 [US3] Add the `risk` step to `src/nesting/edit/recomputeEdited.ts` to satisfy T087, updating its `.doc.md` (depends on T087)
- [X] T089 [US3] Run the US3 suites (`yarn test:unit`) including the performance test and fix failures in `test/unit/nesting/risk/` and `src/nesting/risk/`

### Review integration

- [X] T090 [P] [US3] Add the US3 browser specs to `test/integration-browser/review.edit.browser.spec.ts`: with a risk profile the panel lists each finding with category, severity, part or area, moment, measured value, limit, reason and mitigation text; the not assessable rules name the missing input; the indicative statement and the assessed and not assessed counts are shown; with no findings the panel says what was assessed; a change in the findings after a recomputation is announced as text (US3/AC1–AC4, SC-008)
- [X] T091 [US3] Implement the risk panel in `src/nesting/review/riskPanel.ts` with its sibling `.doc.md`: findings list, rules assessed and not assessed, the indicative statement, mitigation text never applied; semantic HTML with a heading hierarchy and text severity (depends on T090, T086)
- [X] T092 [US3] Wire the `risk` mount option (`ReviewRiskOptions`: `profile`, `processProfile`, `costModel?`) in `src/nesting/review/mount.ts`, `src/nesting/review/buildPanels.ts` and `src/nesting/review/editCommands.ts`, running the risk assessment on request and on recompute and marking the risk result `current`; update their `.doc.md` (depends on T091, T088, T062)
- [X] T093 [US3] Run the US3 browser specs (`yarn dist && npx playwright test review.edit`), run `git checkout -- test/rendered`, and fix failures

**Checkpoint**: US3 is independently functional: `assessCutRisk` and `calculateRiskReport` return indicative, deterministic findings and the review lists them.

---

## Phase 6: User Story 4 - See the Risk Unfold During Playback (Priority: P2)

**Goal**: During playback the planner sees the accumulated heat, the parts that are free at that moment and markers for each finding on the timeline, and after an edit sees whether the risk went away.

**Independent Test**: Play a job with known risks, verify the heat view, the freed parts and the timeline markers appear at the right places in both renderers, then edit to remove a risk, recompute and verify the marker is gone.

> Write each test first and confirm it fails for the expected reason before implementing.

- [X] T094 [P] [US4] Add playback overlay tests in `test/unit/nesting/review/riskOverlay.test.ts`: at a position the overlay carries the `heatAt` cells of that plan time, the parts free at that moment (not the `held` ones) and the markers of the findings; seeking back and forth gives identical overlays; cells and marks carry a pattern and a text label as well as colour; with `prefers-reduced-motion` the overlay is the same without any animation field (FR-013, FR-015)
- [X] T095 [P] [US4] Add controller risk tests in `test/unit/nesting/review/controller.risk.test.ts`: `seekToFinding(id)` seeks to the finding's action, selects the part or area it concerns and publishes the position; `showHeat(on)` toggles the heat layer in `state$`; an unknown finding id changes nothing; a finding without an action index selects without seeking
- [X] T096 [P] [US4] Add the US4 browser specs to `test/integration-browser/review.edit.browser.spec.ts`: playing the planted job in the static and the accelerated renderer shows the heat view, the freed parts and the timeline markers at the right moments; activating a marker with the pointer and with the keyboard seeks and selects; with reduced motion nothing animates and the same information is present; the cues are readable without colour; moving the planted part, recomputing and replaying shows the finding gone and the comparison reporting it, counting the interactions (select the part, one drag or entry, confirm, recompute, replay) and asserting there are five or fewer; appearing and disappearing findings are announced as text (US4/AC1–AC4, SC-008, SC-009)
- [X] T097 [US4] Extend `src/nesting/review/overlay.ts` with the heat cells, the freed parts and the finding markers for a playback position, satisfying T094; update its `.doc.md` (depends on T094, T079, T044)
- [X] T098 [US4] Implement the timeline markers in `src/nesting/review/riskMarkers.ts` with its sibling `.doc.md` and add `seekToFinding` and `showHeat` to `src/nesting/review/editCommands.ts` and `src/nesting/review/controller.ts`, and the markers to `src/nesting/review/controlsPanel.ts`, satisfying T095; the markers are buttons reachable with `Tab` and labelled in pt-BR; update the `.doc.md` files and the pt-BR announcements (depends on T095, T097, T092)
- [X] T099 [P] [US4] Draw the heat cells, the freed parts and the markers in the static renderer `src/nesting/review/svgRenderer.ts` with patterns and labels in addition to colour and no animation under reduced motion; update its `.doc.md` (depends on T097)
- [X] T100 [P] [US4] Draw the same layers in the accelerated renderer through `src/nesting/review/three/updateOverlay.ts`; update its `.doc.md` (depends on T097)
- [X] T101 [US4] Run the US4 suites (`yarn test:unit`, `yarn dist && npx playwright test review.edit`), run `git checkout -- test/rendered`, and fix failures

**Checkpoint**: US4 is independently functional: risks unfold during playback in both renderers and an edit that resolves a finding is visible after recomputation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration over the real drawings, documentation check, repository gates and recorded evidence.

- [X] T102 Add the integration test `test/integration/nesting/editRealParts.test.ts` over the real drawings of `test/resources/nest-fixtures` using `test/integration/nesting/fixtures/realJob.ts`: nest, plan and cost the job, edit one part to a valid position, recompute plan, cost and risk, build the edited artifact, and assert the digests, the freshness, the comparison, that the edited artifact is accepted by the 006 schema and that an invalid edit is refused (depends on T063, T089)
- [X] T103 [P] Verify that every file in `src/nesting/edit/`, `src/nesting/risk/` and the changed files in `src/nesting/linking/` and `src/nesting/review/` has an up-to-date sibling `.doc.md` (pt-BR, consolidated, no changelog language), exports one public function (except `types.ts`, `schemas.ts` and barrels) and stays under 500 lines; no other documentation is created or edited
- [X] T104 [P] Confirm that the source structure in `specs/010-nesting-edit-physics/plan.md` still matches the files created, record each file added while implementing that the plan does not list, with its justification, and keep `contracts/edit-risk-api.md` identical to the exported signatures
- [X] T105 Run `yarn type-check` and resolve all TypeScript errors, including signature parity between the contract and `src/nesting/edit/` and `src/nesting/risk/`
- [X] T106 Run `yarn lint` and `yarn quality:gate` and resolve every error and warning in the changed source files (the gate rejects high complexity; split functions instead of disabling it)
- [X] T107 Run `yarn test:unit` and `yarn test:integration:node` and confirm no regression, including the whole `review`, `cost` and `linking` suites
- [X] T108 Run `yarn build` and `yarn dist` and confirm the edit and risk modules are in `lib/` and the browser bundle has no new dependency and no reference to `three` outside `dist/dxf-review-three.js`
- [X] T109 Record the measured SC-001 to SC-009 evidence (date, environment, worst case) in `specs/010-nesting-edit-physics/quickstart.md`, replacing the pending cells including the SC-001 measurement of T042 and the SC-004 browser leg (depends on T053, T063, T089, T101)
- [X] T110 Update `specs/010-nesting-edit-physics/checklists/requirements.md` notes and confirm every success criterion has a passing test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 can start immediately.
- **Foundational (Phase 2)**: depends on T001. T002, T005, T008, T010, T012 and T014 are parallel; T003
  follows T002 and T004 closes the extraction of the action helpers; T006 follows T005 and extracts the
  output projection from the ERP artifact builder; T007 and T011 can run in parallel with both
  extractions; T009 follows T007 and T008; T013 follows T011 and T012; T015 follows T007 and T011.
- **User Stories (Phases 3–6)**: all depend on Phase 2.
  - US1 is the MVP and has no other dependency.
  - US2 depends on US1 (it extends the edit state and the edit panel); the freshness model and the
    revision counter belong to US1 because commit, undo and redo use them.
  - US3 core (T064–T086) depends only on Phase 2 and can run in parallel with US1 and US2; T087, T088
    and T092 need US2.
  - US4 depends on US1 (overlay, controller and edit panel) and US3 (findings and heat).
- **Polish (Phase 7)**: depends on all stories being complete.

### Within Each Story

- Test tasks first and failing, then implementation, then the story run task.
- `src/nesting/review/overlay.ts`, `editCommands.ts`, `controller.ts`, `editPanel.ts`, `svgRenderer.ts`
  and `three/updateOverlay.ts` are touched by several stories and are therefore sequential across
  stories; everything else marked [P] can run in parallel.

## Parallel Execution Examples

### Foundational

```text
T002 actionDuration.test.ts | T005 outputProjection.test.ts | T008 messages.test.ts | T010 fixtures.ts | T012 messages.test.ts | T014 fixtures.ts
then: T007 types.ts | T011 types.ts | T003 actionDuration.ts | T006 outputProjection.ts
```

### User Story 1

```text
T016 | T017 | T018 | T019 | T020 | T021 | T022 | T023 | T024  (model tests)
then: T026 neighbourIndex.ts | T027 enclosedGroup.ts   (after T025)
then: T034 undoEdit.ts | T035 redoEdit.ts
review tests: T038 | T039 | T040 | T041
then: T048 svg overlay | T049 three overlay
```

### User Story 2

```text
T023 | T054 | T055 | T056 | T057  (tests)
```

### User Story 3

```text
T064 | T065 | T066 | T067 | T068 | T069 | T070 | T071 | T072 | T073  (tests)
then: T076 | T077 | T078   then: T080 | T081 | T082 | T083
```

### User Story 4

```text
T094 | T095 | T096  (tests)
then: T099 svg layers | T100 three layers
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2 (extraction first, with the cost suites as the regression guard).
2. Complete Phase 3 and stop: live validity, exact undo and redo and the review editing are releasable
   and cover SC-001, SC-002, SC-003 and SC-008 for editing.
3. Validate with T037 and T053 before the traceability work.

### Incremental Delivery

1. Add US2 for freshness, recomputation, the edited artifact and the comparison (SC-004, SC-005).
2. Add US3 for the risk assessment (SC-006, SC-007); it can start in parallel after Phase 2.
3. Add US4 for the playback views and timeline markers (SC-008, SC-009).
4. Finish with Polish and the recorded evidence; a gate may not be skipped or narrowed to pass.
