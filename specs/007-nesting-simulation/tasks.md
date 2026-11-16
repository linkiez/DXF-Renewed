---

description: "Implementation tasks for nesting simulation and review"
---

# Tasks: Nesting Simulation and Review

**Input**: Design documents from `/specs/007-nesting-simulation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/nesting-review-api.md`, `quickstart.md`,
`.specify/adr/ADR-0003-review-three-peer-dependency.md`

**Tests**: Required by the project constitution (Principle III). Every behavior task follows
Red → Green → Refactor: the test task for a behavior is written first and must fail for the
expected reason before the matching implementation task starts.

**Documentation**: Every task that changes a file under `src/` also creates or updates that file's
sibling `.doc.md` in the same task and commit. No other documentation is created or edited;
`docs/nesting/VIEWER-THREEJS.md` is intentionally left untouched (see `research.md`).

**Organization**: Tasks are grouped by user story. US1 is the MVP: a complete static review that
already works without `three`, without playback and without a controller.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story of the task (US1–US4); Setup, Foundational and Polish have none
- Source paths are under `src/nesting/review/`; unit tests under `test/unit/nesting/review/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Resolve the governance gate for `three` and create the feature skeleton.

- [X] T001 Obtain maintainer confirmation of the Principle V reading in `.specify/adr/ADR-0003-review-three-peer-dependency.md` (optional peer plus devDependency, no `dependencies` entry, no major bump), then set its Status to Accepted and amend Principle V in `.specify/memory/constitution.md` in the same change with a version bump (2.1.0 → 2.2.0), amendment history and the scope of the exception ("`three`, optional peer, `src/nesting/review/three/` only"); if the maintainer requires a major bump, record it in the ADR and plan the `package.json` version instead
- [X] T002 Create `src/nesting/review/`, `src/nesting/review/three/` and `test/unit/nesting/review/` per `specs/007-nesting-simulation/plan.md`
- [X] T003 [P] Add `three` to `peerDependencies` with `peerDependenciesMeta.three.optional = true` and to `devDependencies` (via `yarn add -D three`) in `package.json`; confirm `three` is NOT in `dependencies`; record the tested major in the peer range (depends on T001)
- [X] T004 [P] Add the additive subpath export `./review/three` to `package.json` `exports` and make `build.mjs` emit its JavaScript and declarations to match how `.` resolves `types` and `import`; do not change the `.` entry (depends on T002)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, message module, deterministic fixtures and the timeline builder required by every story.

**Critical**: No user story work starts until this phase is complete.

- [X] T005 Define all public review types in `src/nesting/review/types.ts` exactly as in `specs/007-nesting-simulation/contracts/nesting-review-api.md` and `data-model.md`, with JSDoc and with its sibling `.doc.md`; reuse `Point2D`, `Placement`, `CompoundPlacement`, `StockItem`, `CutActionKind`, `CutActionMetadata`, `CutCurve`, `CutLayout`, `CutPlanResult`, `ErpNestingArtifact`, `ErpDigest`. Constraints verbatim: `ReviewPart.key` is `shapeId#instanceIndex` and unique within the scene; `ReviewPart.status` is `'placed' | 'flagged'` (`flagged` when any notice of severity `warning` or `error` is recorded against the part or one of its actions); `ReviewPosition.actionIndex` is an integer in `[0, actions.length]` where `actions.length` means finished; `ReviewPosition.progress` is in `[0, 1)` and `0` at an exact action start; `ReviewScene.status` is `'ready' | 'partial' | 'unavailable'`; notice `severity` is `'info' | 'warning' | 'error'`; notice `origin` is `'artifact' | 'planning' | 'review'`; review notice codes are exactly `UNSUPPORTED_CONTRACT_VERSION`, `INVALID_ARTIFACT`, `NO_LAYOUT`, `NO_CUT_PLAN`, `EMPTY_SHEET`, `UNLINKED_ACTION`, `UNKNOWN_PART`, `PLAN_SHEET_MISSING`, `DEGENERATE_ACTION`, `PLACEMENT_SHEET_UNRESOLVED`, `PLACEMENT_GEOMETRY_APPROXIMATE`, `GRAPHICS_UNAVAILABLE`, `GRAPHICS_LOST`; no `any` and no `unknown` in the domain types (depends on T002)
- [X] T006 [P] Add message-module tests in `test/unit/nesting/review/messages.test.ts`: every review notice code has a Brazilian Portuguese message builder; labels, legend entries, ARIA names, live-region announcements and summary templates exist; no function returns an empty string; snapshot of the pt_BR text
- [X] T007 Implement `src/nesting/review/messages.ts` as the single module that holds every user-facing string the review produces (pt_BR), internal to the module (not exported through the barrel), with its sibling `.doc.md` (depends on T005, T006)
- [X] T008 [P] Add the deterministic fixture builders in `test/unit/nesting/review/fixtures.ts`: a small artifact (two sheets, parts with holes, a cut plan), a partial artifact (unplaced items, warnings, rejections), a layout-only artifact, a rejected artifact (`layout: null`), an artifact whose placements lack `sheetId`, `transformedVertices` and `instanceIndex`, an artifact with `compoundPlacements`, and a seeded 500-part reference sheet with holes plus its `CutLayout` and `CutPlanResult` built with `planCutPath` and `createNestingArtifact`; no checked-in large files, no `Math.random`
- [X] T009 [P] Add timeline construction tests in `test/unit/nesting/review/buildTimeline.test.ts`: cumulative `startLength` and `length` for linear, arc and bezier actions, `totalLength`, `pierceIndices`, zero-length actions kept in order, identical output for identical input
- [X] T010 Implement `buildTimeline` in `src/nesting/review/buildTimeline.ts` with its sibling `.doc.md`, measuring arcs and beziers along their curve and using `EPSILON` from `src/nesting/config.ts` for degenerate detection (depends on T005, T009)
- [X] T011 Add the review barrel scaffold in `src/nesting/review/index.ts` and reserve the additive re-export in `src/nesting/index.ts`, updating `src/nesting/index.doc.md`; the barrel and everything it imports MUST NOT import `three` (depends on T005)
- [X] T012 [P] Add `test/unit/nesting/review/entryIsolation.test.ts` asserting that no source file reachable from `src/index.ts` imports `three` (the `dist` bundle check runs in T060)

**Checkpoint**: Types, messages, fixtures, timeline and the isolation guard are ready; stories can start.

---

## Phase 3: User Story 1 - Review a Sheet Before Release (Priority: P1) 🎯 MVP

**Goal**: A planner opens an artifact and sees sheets, placements, statuses, all planned actions by kind, notices and the artifact identity, with a static review that needs no acceleration.

**Independent Test**: Load a completed artifact (plus layout and plan) and verify every placement and planned action is visible and traceable to its part, multi-sheet switching works, unplaced items and unavailable states show reasons, and identity is displayed.

> Write each test first and confirm it fails for the expected reason before implementing.

- [X] T013 [P] [US1] Add scene-building tests in `test/unit/nesting/review/buildScene.test.ts` for: complete artifact (every sheet, placement and status present; `flagged` when a planning problem is recorded); several sheets; partial artifact (unplaced, warnings, rejections listed with reasons and not drawn as placements); identity (status, contract version, correlation, both digests); unsupported contract version; schema-invalid artifact; rejected artifact with `layout: null`; layout without cut plan (`NO_CUT_PLAN`, `capabilities.playback === false`); empty sheet (`EMPTY_SHEET`); degenerate action (`DEGENERATE_ACTION`, kept in order); placement resolution rules of `data-model.md` (`sheetId` fallback to the only sheet, `PLACEMENT_SHEET_UNRESOLVED`, deterministic `instanceIndex`, `bbox` fallback with `PLACEMENT_GEOMETRY_APPROXIMATE`, compound placements as one part with outer and hole outlines); built from the original object, not the schema's stripped output; review-produced notice messages come from the pt_BR message module; deep-frozen inputs unchanged after the call (FR-006, SC-008)
- [X] T014 [P] [US1] Add part-linking tests in `test/unit/nesting/review/linkParts.test.ts`: `CutLayout` contour to placement resolution; fallback by `partId` equal to `shapeId` or `shapeId#instanceIndex`; one `UNLINKED_ACTION` or `UNKNOWN_PART` notice per distinct unresolved id; action stays in the timeline
- [X] T015 [P] [US1] Add static renderer tests in `test/unit/nesting/review/renderSvg.test.ts`: sheet boundary and all placements of the selected sheet only; placed and flagged parts differ by more than color; each action kind (`cut`, `rapid`, `pierce`, `lead-in`/`lead-out`, `overcut`, `tab`) differs by line style or marker shape and not only by color (FR-002); unplaced items absent; accessible `<title>`/`<desc>` and legend text in pt_BR; output needs no DOM and is identical for identical input
- [X] T016 [P] [US1] Add the static-review browser spec in `test/integration-browser/review.browser.spec.ts`: `mountReview` from the `dist` bundle renders identity, notices, sheet switcher and the SVG; covers an environment where no accelerated renderer is supplied (SC-003)
- [X] T017 [P] [US1] Implement part and action linking in `src/nesting/review/linkParts.ts` with its sibling `.doc.md` (order: `CutLayout` contours, then `partId` key rules from `research.md`), returning links plus notices (depends on T014)
- [X] T018 [P] [US1] Implement placement resolution in `src/nesting/review/resolvePlacements.ts` with its sibling `.doc.md`: sheet, instance, outline and compound rules exactly as in the "Placement resolution" section of `data-model.md`, never dropping or guessing a placement (depends on T005, T007, T013)
- [X] T019 [US1] Implement `buildReviewScene` in `src/nesting/review/buildScene.ts` with its sibling `.doc.md`: check `contractVersion` against `ERP_CONTRACT_VERSION`, validate with `erpNestingArtifactSchema.safeParse`, never throw for expected outcomes, build from the caller's original object, map artifact warnings/rejections/unplaced and `CutPlanResult.problems` to `ReviewNotice` with `origin`, build sheets, parts, `status` (`placed`/`flagged`), timelines and `summary` from supplied values (no recomputing of yield), set `capabilities` and `status`; `plans` takes precedence over `plan`; a plan for an unknown sheet yields `PLAN_SHEET_MISSING` (depends on T010, T017, T018, T013)
- [X] T020 [US1] Implement `renderReviewSvg` in `src/nesting/review/renderSvg.ts` with its sibling `.doc.md`: top-down view, Y-up convention centralized in one local transform function, merged `<path>` per action kind, `bbox`-fallback parts visibly marked, legend, ARIA `role="img"` with title and description, all text from the message module (depends on T015, T019, T007)
- [X] T021 [US1] Implement the static `mountReview` in `src/nesting/review/mount.ts` and `src/nesting/review/panels.ts` with its sibling `.doc.md`: identity panel, notices list, sheet switcher, SVG view, explicit unavailable-state message instead of a blank view (FR-011); no controller yet (depends on T016, T020)
- [X] T022 [US1] Complete the US1 exports in `src/nesting/review/index.ts` and `src/nesting/index.ts`, updating `src/nesting/index.doc.md` (depends on T019, T020, T021)
- [X] T023 [US1] Run the US1 suites (`yarn test:unit`, `yarn test:integration:browser -g "static"`) and fix failures in `test/unit/nesting/review/` and `src/nesting/review/`

**Checkpoint**: US1 is independently functional: a complete, accessible static review of any artifact, with explicit reasons for every gap.

---

## Phase 4: User Story 2 - Replay the Cut Plan (Priority: P2)

**Goal**: Play, pause, reset, change speed, step to next pierce and seek through the ordered actions with an accelerated renderer, falling back to the position-aware static view without losing state.

**Independent Test**: Load an artifact with a plan, play, pause, step and seek; the displayed tool position always matches the ordered actions, seek equals play-to-position, nothing starts automatically, and graphics failure keeps a usable static view with the same position.

- [X] T024 [P] [US2] Add `stateAt` and `nextPierce` tests in `test/unit/nesting/review/stateAt.test.ts`: head position along each action kind, `completed` count, finished state, next pierce from any position, and SC-005 (for every sampled action `k`, `stateAt` at `{k, 0}` equals the state reached by advancing from the start through the controller's step function)
- [X] T025 [P] [US2] Extend `test/unit/nesting/review/renderSvg.test.ts` with position-aware tests: trail of completed actions, the partially completed current action, the head marker, identical output for the same `ReviewPosition` regardless of how it was reached, and the same information as the accelerated review (FR-005)
- [X] T026 [P] [US2] Add controller tests in `test/unit/nesting/review/controller.test.ts` with a fake `ReviewClock`: no automatic playback in any configuration (FR-012); play, pause, reset, speed change, step to next pierce, `seek`, `seekToAction`, `seekBy`, end of plan stops playback; sheet change resets position and clears selection; `state$` emits distinct states; renderer failure switches to `static` with `GRAPHICS_UNAVAILABLE` or `GRAPHICS_LOST` and keeps position, selection and viewport
- [X] T027 [P] [US2] Add accelerated-renderer tests in `test/unit/nesting/review/threeRenderer.test.ts` against a stub `three` namespace: constant draw-call count independent of action count, trail implemented as a draw-range prefix, no per-frame allocation after warm-up, dispose releases buffers, missing WebGL2 reports `GRAPHICS_UNAVAILABLE`
- [X] T028 [P] [US2] Extend `test/integration-browser/review.browser.spec.ts` with playback in a real WebGL context (animation advances, seek updates the view), forced renderer failure after the review has started (static view keeps position, trail, selection and notices, and play, pause and seek still work), `matchMedia` stubbed to reduced-motion on and off (no automatic playback, immediate view changes), and the SC-002 and SC-004 timing procedure from `quickstart.md` (software-rendered Chromium, `performance.now()`, five runs, worst case, processor model and core count recorded)
- [X] T029 [P] [US2] Implement `stateAt` in `src/nesting/review/stateAt.ts` with its sibling `.doc.md`, using binary search over cumulative `startLength` (depends on T010, T024)
- [X] T030 [P] [US2] Implement `nextPierce` in `src/nesting/review/nextPierce.ts` with its sibling `.doc.md` (depends on T010, T024)
- [X] T031 [US2] Make `renderReviewSvg` position-aware in `src/nesting/review/renderSvg.ts` and its `.doc.md`: trail, current partial action and head marker from `stateAt` (depends on T025, T029)
- [X] T032 [US2] Implement `createReviewController` in `src/nesting/review/controller.ts` with its sibling `.doc.md` with an RxJS `state$`, injected `ReviewClock`, speed multiplier, optional feed weighting from action `metadata` only when numeric, `seek`, `seekToAction`, `seekBy`, sheet switching and renderer-failure handling; there is no autoplay option (depends on T026, T029, T030)
- [X] T033 [P] [US2] Implement merged position buffers, per-kind line batches, instanced marker data and the draw-range trail in `src/nesting/review/three/buffers.ts` with its sibling `.doc.md` (depends on T003, T027, T029)
- [X] T034 [US2] Implement `createThreeRenderer` in `src/nesting/review/three/renderer.ts` with its sibling `.doc.md`: orthographic top-down camera, dashed material for `rapid`, distinct marker geometry per kind, head marker, injected `three` namespace typed `typeof import('three')` or an async loader, WebGL2 and context-loss detection reported through `onFailure`, `dispose`; every view change applies immediately (depends on T033)
- [X] T035 [US2] Add `src/nesting/review/three/index.ts` as the subpath entry with its sibling `.doc.md`, add an esbuild step producing an IIFE of the renderer only (global `dxfReviewThree`, `three` not bundled) in `package.json` scripts or `build.mjs`, and extend `tools/browser_test_server.js` to serve the module build of `three` from `node_modules` for the browser spec (depends on T004, T034)
- [X] T036 [US2] Extend `src/nesting/review/mount.ts` and `src/nesting/review/panels.ts` and their `.doc.md` files with: optional accelerated renderer factory, controller wiring, labeled play/pause/reset/speed/step controls, a labeled go-to-action number field, automatic fallback to `renderReviewSvg` on renderer failure with a visible `GRAPHICS_*` notice and unchanged state; all text from the message module (depends on T032, T035, T031, T028)
- [X] T037 [US2] Run the US2 suites and fix failures (depends on T036)
- [X] T038 [US2] Measure SC-002 and SC-004 on the baseline environment with the 500-part reference sheet using the procedure in `quickstart.md`, fix any calibration failure before continuing, and record browser version, processor model, core count and worst-of-five results in `specs/007-nesting-simulation/quickstart.md` (depends on T037)

**Checkpoint**: US2 delivers deterministic replay with accelerated rendering and a safe fallback.

---

## Phase 5: User Story 3 - Inspect a Part or Action (Priority: P2)

**Goal**: Select a part or action and see identity, orientation, placement, process values and recorded planning problems; clear or replace the selection.

**Independent Test**: Select a part and an action in the reference artifact and check the shown values against the artifact data; selection never changes the artifact.

- [X] T039 [P] [US3] Add hit-test tests in `test/unit/nesting/review/pick.test.ts`: part by containment using `pointInPolygon`, action by tolerance, deterministic tie-break order when a part and an action overlap (action before part, then lower index) with a way to reach the other item, no result outside the sheet, identical results for identical input
- [X] T040 [P] [US3] Add inspector tests in `test/unit/nesting/review/inspect.test.ts`: part rows (key, `shapeId`, `instanceIndex`, rotation, position, `bbox`, layer and handle only when a shape is available) plus the artifact's correlation values (order, revision, request); action rows (kind, owning part, every `metadata` entry verbatim); planning problems with code and message on the affected part or action; unlinked actions explained; labels in pt_BR
- [X] T041 [P] [US3] Extend `test/unit/nesting/review/controller.test.ts` with `select`, replace, clear, `moveSelection` order (parts in sheet order, actions in timeline order, wraps explicitly), `seekToSelectedAction`, and artifact deep-equality before and after (FR-006)
- [X] T042 [P] [US3] Extend `test/integration-browser/review.browser.spec.ts` with pointer selection on both renderers and the inspector panel contents
- [X] T043 [P] [US3] Implement `pickAt` in `src/nesting/review/pick.ts` with its sibling `.doc.md`, reusing `pointInPolygon` and `distance` from `src/nesting/polygonUtils.ts` and `EPSILON` (depends on T039, T019)
- [X] T044 [P] [US3] Implement `inspect` in `src/nesting/review/inspect.ts` with its sibling `.doc.md` (depends on T040, T019, T007)
- [X] T045 [US3] Add `select`, clear, `moveSelection` and `seekToSelectedAction` to `src/nesting/review/controller.ts`, and selection highlight to `src/nesting/review/renderSvg.ts` and `src/nesting/review/three/renderer.ts`, updating their `.doc.md` files (depends on T041, T032, T034)
- [X] T046 [US3] Add pointer picking and the inspector panel to `src/nesting/review/mount.ts` and `src/nesting/review/panels.ts` and their `.doc.md` files, converting pointer coordinates to sheet coordinates with the same transform used for drawing (depends on T042, T043, T044, T045, T036)
- [X] T047 [US3] Run the US3 suites and fix failures (depends on T046)

**Checkpoint**: US3 makes every problem traceable from the view to its part and source.

---

## Phase 6: User Story 4 - Review Without Pointer or Motion (Priority: P3)

**Goal**: The full review is operable by keyboard, including selecting and seeking, with a written summary and announced changes.

**Independent Test**: Complete a full review of the reference artifact using only the keyboard and the written summary.

- [X] T048 [P] [US4] Add summary tests in `test/unit/nesting/review/summary.test.ts`: sheets, part count, unplaced count, yield (as supplied by the artifact), total cut length, total rapid length, pierce count; deterministic pt_BR text
- [X] T049 [P] [US4] Add key-map tests in `test/unit/nesting/review/keyMap.test.ts` and controller tests for the full map in `contracts/nesting-review-api.md`: Space, `r`, `n`, `<`, `>`, `[`, `]`, `,`, `.`, PageUp, PageDown, Home, End, ArrowLeft/ArrowRight (parts), ArrowUp/ArrowDown (actions), Enter, Esc, Shift+arrows pan, `+`, `-`, `0`; unhandled keys return `false`; viewport state changes
- [X] T050 [P] [US4] Extend `test/integration-browser/review.browser.spec.ts` with a keyboard-only run covering every function in SC-007 (switch sheet, play, pause, reset, step, seek to any action by keys and by the go-to-action field, select a part and an action, clear selection), the summary region, notices list, live-region announcements and pt_BR text
- [X] T051 [P] [US4] Implement `summarize` in `src/nesting/review/summary.ts` with its sibling `.doc.md`, text from the message module (depends on T048, T019, T007)
- [X] T052 [P] [US4] Implement the key map in `src/nesting/review/keyMap.ts` with its sibling `.doc.md`, internal to the module (depends on T049)
- [X] T053 [US4] Implement `handleKey`, `pan`, `zoomBy`, `resetViewport`, viewport state and `seekToAction`/`seekBy` bindings in `src/nesting/review/controller.ts` and its `.doc.md` (depends on T049, T052, T045)
- [X] T054 [US4] Add the summary region, ARIA live status, focus management and keyboard handlers to `src/nesting/review/mount.ts` and `src/nesting/review/panels.ts` and their `.doc.md` files (depends on T050, T051, T053, T046)
- [X] T055 [US4] Run the US4 suites and the keyboard-only browser spec and fix failures (depends on T054)

**Checkpoint**: Every review function is available without a pointer or animation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation check, repository gates and recorded evidence.

- [X] T056 [P] Verify that every file in `src/nesting/review/` and `src/nesting/review/three/` has an up-to-date sibling `.doc.md` (pt-BR, consolidated, no changelog language) and update `src/nesting/index.doc.md` for the final public surface; no other documentation is created or edited
- [X] T057 Run `yarn type-check` and resolve all TypeScript errors, including signature parity between `specs/007-nesting-simulation/contracts/nesting-review-api.md` and `src/nesting/review/`
- [X] T058 Run `yarn lint` and resolve all lint errors in changed source files; confirm every new file is under 500 lines and exports one public function (except `types.ts` and barrels)
- [X] T059 Run `yarn test:unit` and confirm no regression against the recorded baseline
- [X] T060 Run `yarn build`, `yarn dist` and `yarn test:integration:browser`; confirm the `review/three` subpath resolves from `lib` and that neither the main entry nor the `dist` bundle contains a reference to `three`
- [X] T061 Record the measured SC-001 to SC-008 evidence (date, environment, worst case) in `specs/007-nesting-simulation/quickstart.md` and link it from this file (depends on T060, T038)
- [X] T062 Update `specs/007-nesting-simulation/checklists/requirements.md` notes and confirm ADR-0003 consequences are satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 first (human gate). T002 can start immediately. T003 depends on T001.
  T004 depends on T002.
- **Foundational (Phase 2)**: depends on T002. T006, T008, T009 and T012 are
  parallel; T007 follows T005 and T006; T010 follows T005 and T009; T011 follows
  T005.
- **User Stories (Phases 3–6)**: all depend on Phase 2. US1 is the MVP. US2 depends on US1 for
  `mount.ts` and `renderSvg.ts`; its model and renderer work (T024–T030, T033–T034) can start
  after Phase 2. Every task that imports types from `three` (T027, T033, T034, T035) needs
  T003, and therefore T001. US3 depends on the US2 controller (T032) for selection wiring; its model
  tasks (T043, T044) are independent. US4 depends on US2 for the controller and on US3 for the
  inspector panel; its summary and key-map tasks (T051, T052) are independent.
- **Polish (Phase 7)**: depends on all stories being complete.

### User Story Dependencies

- **US1 (P1)**: Foundational only.
- **US2 (P2)**: Foundational; integrates into the US1 mount and static renderer.
- **US3 (P2)**: Foundational; integrates into the US2 controller and renderers.
- **US4 (P3)**: Foundational; integrates into the US2 controller and the US3 mount.

### Within Each Story

- Test tasks first and failing, then implementation, then the story run task.
- `mount.ts`, `panels.ts`, `controller.ts` and `renderSvg.ts` tasks are sequential across stories
  (shared files); everything else marked [P] can run in parallel.

## Parallel Execution Examples

### Foundational

```text
T006 messages.test.ts | T008 fixtures.ts | T009 buildTimeline.test.ts | T012 entryIsolation.test.ts
```

### User Story 1

```text
T013 buildScene.test.ts | T014 linkParts.test.ts | T015 renderSvg.test.ts | T016 browser spec
then: T017 linkParts.ts | T018 resolvePlacements.ts
```

### User Story 2

```text
T024 | T025 | T026 | T027 | T028  (tests)
then: T029 stateAt.ts | T030 nextPierce.ts | T033 three/buffers.ts
```

### User Story 3

```text
T039 pick.test.ts | T040 inspect.test.ts | T041 | T042
then: T043 pick.ts | T044 inspect.ts
```

### User Story 4

```text
T048 summary.test.ts | T049 keyMap.test.ts | T050
then: T051 summary.ts | T052 keyMap.ts
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 (governance) in parallel with T002, then Phase 2.
2. Complete Phase 3 and stop: a complete static, accessible review with explicit reasons for every
   gap is releasable and satisfies SC-001, SC-003, SC-006 and SC-008.
3. Validate with T023 before any renderer work.

### Incremental Delivery

1. Add US2 for accelerated replay; gate on SC-002, SC-004 and SC-005 (T038).
2. Add US3 for inspection (FR-004, FR-009).
3. Add US4 for keyboard and summary (SC-007).
4. Finish with Polish and the recorded evidence; a gate may not be skipped or narrowed to pass.

---

## Phase 8: Convergence

**Purpose**: Remaining work found by comparing the current code with `spec.md`, `plan.md`, `tasks.md` and the constitution. Ordered by severity; constitution violations first.

- [X] T063 CRITICAL: remove `unknown` from the core domain by replacing `sameValue(a: unknown, b: unknown)` in `src/nesting/review/controller.ts` with a typed comparison of the `ReviewState` fields (position, viewport, selection, notices) and keep `test/unit/nesting/review/controller.test.ts` passing per Constitution Coding Conventions (contradicts)
- [X] T064 CRITICAL: remove the narrative comment `/* the static view cannot fail */` in `src/nesting/review/svgRenderer.ts` (use `onFailure: () => undefined`) per Constitution Comment Discipline (contradicts)
- [X] T065 One public function per source file: split the seven exported panel builders of `src/nesting/review/panels.ts` into one internal file each (`identityPanel.ts`, `noticesPanel.ts`, `sheetSwitcher.ts`, `controlsPanel.ts`, `inspectorPanel.ts`, `summaryPanel.ts`, `shortcutsPanel.ts`), move `LINE_KINDS` out of `src/nesting/review/three/buffers.ts` and `ReviewGraphicsError` out of `src/nesting/review/three/renderer.ts` into their own files, update imports and every sibling `.doc.md`, and keep all unit and browser suites passing per plan: Technical Context constraint "one public function per source file" and T058 (contradicts)
- [X] T066 [P] Make the fallback tests prove "same information at the same position": extend `test/unit/nesting/review/controller.test.ts` ("falls back to the static renderer") to assert that selection and viewport are kept, and extend `test/integration-browser/review.browser.spec.ts` ("falls back to the static view after the graphics context is lost") to select a part before the loss and assert the selection highlight (`data-selected`), the trail (`data-trail`) and the notices after it, per FR-005, SC-003 and quickstart item 11a (partial)
- [X] T067 [P] Verify the `review/three` subpath automatically: add to `test/unit/nesting/review/entryIsolation.test.ts` an assertion that the `package.json` `exports["./review/three"]` targets exist under `lib/` when `lib/` has been built (skipped when it has not), per T060 and ADR-0003 decision 2 (partial)
- [X] T068 [P] Record in `specs/007-nesting-simulation/plan.md` (project structure) and `data-model.md` (`ReviewAction.playStart`, `ReviewAction.playSpan`, `ReviewTimeline.playTotal`) the internal modules and fields added during implementation (`actionPath.ts`, `actionPrefix.ts`, `positionAtDistance.ts`, `distanceAtPosition.ts`, `svgRenderer.ts`, `domClock.ts`, `graphicsNotice.ts`, `announce.ts`) and the `escapeXml` export added to `src/nesting/toNestedSvg.ts`, each with its justification, per plan: Project Structure (unrequested)
