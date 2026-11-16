# Implementation Plan: Nesting Simulation and Review

**Branch**: `007-nesting-simulation` | **Date**: 2026-11-16 | **Spec**: `spec.md`

## Summary

Add a read-only review capability under `src/nesting/review/`. A pure, dependency-free **review
model** turns an `ErpNestingArtifact` (006), plus an optional `CutLayout` and `CutPlanResult`
(004), into an immutable `ReviewScene` with notices, a deterministic playback timeline, a stable
hit-test and a text summary. Two renderers consume the same scene: a **static SVG renderer**
(always available, zero dependencies, also the fallback and the accessible view) and a
**three.js renderer** (top-down orthographic, GPU-accelerated, lazy and caller-injected). A
framework-neutral controller (play, pause, reset, step, seek, select, keyboard) drives either
renderer. `three` is added only as an **optional peer dependency** governed by ADR-0003; nothing in
the main entry point imports it.

## Technical Context

**Language/Version**: TypeScript 6, Node.js >=18, strict compiler settings.

**Primary Dependencies**: existing `rxjs` (controller state stream) and `zod` (artifact contract
check); existing nesting, `cutPath` and `erp` modules. New: `three` as an **optional peer
dependency** plus a `devDependency` for tests, used only by the three.js renderer (ADR-0003).

**Storage**: N/A. No persistence, no network I/O; the artifact is never mutated.

**Testing**: Mocha + `tsx` unit tests in `test/unit/nesting/review/` (model, timeline, picking,
SVG, controller; three.js renderer against a stub namespace). Playwright browser spec in
`test/integration-browser/review.browser.spec.ts` for real WebGL, fallback and keyboard flows.
Gates: `yarn type-check`, `yarn lint`, `yarn test:unit`, plus the measured SC gates in
`quickstart.md`.

**Target Platform**: model, SVG renderer and controller run in Node.js and browsers; the three.js
renderer and DOM mount run in browsers only.

**Project Type**: TypeScript library.

**Performance Goals**: SC-002 open the 500-part reference sheet in <2 s; SC-004 seek to any action
in <500 ms; both on the reproducible baseline defined in the spec (software-rendered Chromium on a
recorded reference machine, worst of five runs). Internal design target: seek is O(log n) lookup
plus an O(1) draw-range update.

**Constraints**: additive public API; no input mutation (inputs frozen in tests); reuse existing
types, `polygonUtils` and `EPSILON`; geometry stays unitless; no wall-clock dependence in the
model (the controller receives an injected clock); no static `import 'three'` anywhere reachable
from `src/index.ts`; every unavailable capability yields a `ReviewNotice`; all text the review
produces is Brazilian Portuguese from one module (`messages.ts`), identifiers and JSDoc English;
one public function per source file; every `src` change updates its sibling `.doc.md` in the same
task and commit; no documentation outside `.doc.md` and `specs/` is created or edited.

**Scale/Scope**: one artifact per scene; reference size 500 parts and the cut plan derived from
them (roughly 10^4 actions); larger artifacts must stay complete, though they are not gated.

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1.*

- **I. Library-First, Additive Public API**: PASS. New `review/` module re-exported through
  `src/nesting/index.ts`. The three.js renderer ships on a separate additive subpath so the main
  entry has no `three` types or code.
- **II. Reuse Before Rewrite**: PASS. Reuses `ErpNestingArtifact` and `erpNestingArtifactSchema`,
  `CutPlan`/`CutAction`/`CutPathProblem`, `Placement`, `StockItem`, `polygonUtils`
  (`pointInPolygon`, `computeBoundingBox`, `distance`) and `EPSILON`. New code exists only for the
  timeline, hit-testing and rendering, which no existing module provides (recorded in
  `research.md`).
- **III. Test-First**: PASS. Each module has failing tests before implementation; tasks keep
  checkboxes tied to gates.
- **IV. Determinism**: PASS. Scene, timeline and picking are pure functions of the input; ties are
  broken by a fixed kind/index order, never by object identity or map order; the controller's
  clock is injected.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: **DEVIATION, justified.** `three` is a
  new peer dependency. It is optional, absent from `dependencies`, never imported by the main
  entry, and recorded in ADR-0003. See Complexity Tracking.
- **Unit discipline / precision / silent failure**: PASS. Geometry stays unitless, comparisons use
  `EPSILON`, and every refusal, gap, unresolved placement or inconsistency is a visible
  `ReviewNotice`.
- **Documentation, coding and comment discipline**: PASS. `.doc.md` siblings are part of each
  implementation task; no other documentation is created; strings are pt_BR from `messages.ts`;
  no `unknown` in the domain (`ThreeNamespace` is `typeof import('three')`); one public function
  per file; files under 500 lines.

## Phase 0: Research Summary

`research.md` resolves: input shape (artifact vs plan vs layout), part-to-action linking, rendering
split, three.js integration without breaking the iife bundle, picking, playback semantics,
accessibility and the performance approach. No `NEEDS CLARIFICATION` remains.

## Phase 1: Design Summary

- `data-model.md`: scene, notice, timeline, selection and state entities with validation rules.
- `contracts/nesting-review-api.md`: public functions, renderer interface and controller surface.
- `quickstart.md`: runnable gates, acceptance scenarios and measurement procedure.
- `.specify/adr/ADR-0003-review-three-peer-dependency.md`: dependency decision record.

## Project Structure

### Documentation

```text
specs/007-nesting-simulation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nesting-review-api.md
└── checklists/
    └── requirements.md

.specify/adr/
└── ADR-0003-review-three-peer-dependency.md
```

### Source Code

```text
src/nesting/review/
├── types.ts            # public types (ReviewInput, ReviewScene, ReviewNotice, ...)
├── messages.ts         # every pt_BR string the review produces (internal)
├── buildScene.ts       # buildReviewScene: validate, resolve placements, notices (pure)
├── linkParts.ts        # actions/contours -> placements resolution (internal)
├── resolvePlacements.ts  # sheet, instance, outline and compound rules (internal)
├── buildTimeline.ts    # cumulative-length timeline of one sheet
├── stateAt.ts          # tool position, trail and current action at a ReviewPosition
├── nextPierce.ts       # position of the next pierce action
├── pick.ts             # stable hit-test over parts and actions
├── inspect.ts          # selection -> inspector details
├── summary.ts          # summarize: text summary (sheets, parts, yield, cut length)
├── renderSvg.ts        # static, position-aware SVG renderer (fallback, accessible view)
├── keyMap.ts           # key event -> controller command (internal)
├── controller.ts       # play/pause/reset/step/seek/select/viewport state machine
├── identityPanel.ts, noticesPanel.ts, sheetSwitcher.ts, controlsPanel.ts,
│   inspectorPanel.ts, summaryPanel.ts, shortcutsPanel.ts, panelText.ts   # DOM panels (internal, one function each)
├── actionPath.ts       # sampleActionPath: arcs and beziers to polylines (internal; shared by timeline, prefix, pick, buffers)
├── actionPrefix.ts     # polyline of an action up to a fraction (internal; head and partial trail)
├── positionAtDistance.ts, distanceAtPosition.ts  # playback axis <-> position (internal; every action has a positive span)
├── sameState.ts        # typed ReviewState comparison (internal)
├── svgRenderer.ts      # ReviewRenderer adapter over renderReviewSvg (internal)
├── domClock.ts         # createAnimationClock over requestAnimationFrame
├── graphicsNotice.ts   # notice for GRAPHICS_UNAVAILABLE / GRAPHICS_LOST (internal)
├── announce.ts         # live-region announcement for a state change (internal)
├── mount.ts            # mountReview: scene, root and static panels
├── attachSession.ts, startRenderers.ts, buildPanels.ts, attachPointer.ts, bindState.ts  # interactive session (internal, one function each)
├── index.ts            # barrel (no three import)
└── three/
    ├── renderer.ts     # three.js top-down renderer (namespace injected)
    ├── buffers.ts      # merged line/marker buffers and draw-range trail
    ├── lineKinds.ts    # LINE_KINDS and LineKind (internal)
    ├── palette.ts, threeNamespace.ts, sheetObjects.ts, fitCamera.ts, updateTrail.ts, updatePartial.ts, updateSelection.ts  # internal, one function each
    ├── graphicsError.ts  # ReviewGraphicsError (internal)
    └── index.ts        # subpath entry for the renderer factory

src/nesting/index.ts    # re-export review public surface (additive)
package.json            # optional peer + devDependency, subpath export
<each file above>.doc.md  # sibling documentation, updated in the same task as its source

test/unit/nesting/review/
├── fixtures.ts
├── messages.test.ts
├── buildScene.test.ts
├── linkParts.test.ts
├── buildTimeline.test.ts
├── stateAt.test.ts
├── pick.test.ts
├── inspect.test.ts
├── summary.test.ts
├── renderSvg.test.ts
├── controller.test.ts
├── threeRenderer.test.ts
└── entryIsolation.test.ts
test/integration-browser/review.browser.spec.ts
```

**Structure Decision**: a feature-local module beside `cutPath/` and `erp/`. The model has no
rendering knowledge; renderers have no domain logic; the controller depends only on the model and
a renderer interface. Each source file gets a source-adjacent `.doc.md`, written in the same task as
the file. Files stay under 500 lines; `types.ts` and the barrels are the only multi-export files,
following the existing `cutPath/types.ts` convention. The internal modules listed above were added
while implementing, each justified by reuse (one geometry sampler, one position mapping, one state
comparison) or by the one-function-per-file rule; `src/nesting/toNestedSvg.ts` also exports its
existing `escapeXml` so the review does not duplicate it. `docs/nesting/VIEWER-THREEJS.md` is not
edited: it is not a sibling `.doc.md` and no explicit request exists, so it stays known-stale
(recorded in `research.md`).

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| New `three` peer dependency (Principle V) | The required accelerated top-down review at 500 parts and ~10^4 actions with O(1) seek needs a GPU renderer; three.js is the project's chosen stack (ROADMAP-NESTING §12) | Canvas 2D / SVG-only: redraw cost grows with actions and does not give the O(1) seek and smooth playback targeted by SC-002/SC-004 on a GPU-less baseline. SVG is kept, as the mandatory fallback, not as the primary view |
| Separate `review/three` subpath export | Keeps `three` types and code out of the main entry and the iife `dist` bundle | Re-exporting from the main barrel would make `three` a hard requirement for every consumer and bloat `dist` |
