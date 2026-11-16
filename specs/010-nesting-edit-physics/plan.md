# Implementation Plan: Nesting Layout Editing and Cut Risk Simulation

**Branch**: `010-nesting-edit-physics` | **Date**: 2026-11-16 | **Spec**: `spec.md`

## Summary

Two new stateless modules and a thin integration in the review (the playback controller is not changed). `src/nesting/edit/` holds an immutable,
deterministic edit model over the placements of an `ErpNestingArtifact`: it judges a candidate move,
rotation or mirror of one placed part (overlap, usable area and margins, forbidden zones, minimum
spacing, allowed rotations, grain, mirroring), commits only valid edits, keeps the ordered log with undo
and redo, marks the derived results outdated, recomputes the cut plan, cost and risk on request and
produces the edited result as a new artifact that refers to the original. `src/nesting/risk/` assesses a
cut plan for four indicative risk categories (heat accumulation, thin web, loose part, head strike) from
a caller-supplied risk profile and returns findings, a time-resolved heat view and the moments each part
becomes free. The review gains an edit panel, drag handling, a risk panel, timeline markers and an
overlay drawn by the static and accelerated renderers. Nothing is stored and no dependency is added.

## Technical Context

**Language/Version**: TypeScript 6, Node.js >=18, strict compiler settings.

**Primary Dependencies**: existing `rxjs` (flows), `zod` (risk profile at the caller boundary, the
same exception as ADR-0002); reuse of `trueShape` (`isWithinBounds`, `isSeparatedFromAll`,
`polygonDistance`, `effectiveRotations`), `collision`, `polygonUtils`, `linking` (`placedParts`,
`linkActions`, `actionPath`, `actionLength`), `cutPath` (`planCutPath`), `cost` (`buildCostBreakdown`,
time estimation), `erp` (`digestCanonical`, `canonicalize`, the artifact schema) and the review scene,
controller and renderers. `three` stays the existing optional peer. No new dependency.

**Storage**: N/A. Edit state lives in memory in the session; nothing is persisted and no input object is
mutated.

**Testing**: Mocha + `tsx` unit tests in `test/unit/nesting/edit/` and `test/unit/nesting/risk/`; a node
integration test over the real drawings of `test/resources/nest-fixtures`
(`test/integration/nesting/editRealParts.test.ts`); Playwright specs for the review integration in
`test/integration-browser/`. Gates: `yarn type-check`, `yarn lint`, `yarn test:unit`,
`yarn quality:gate`, plus the measured SC gates in `quickstart.md`.

**Target Platform**: Node.js for the models and flows (Web Crypto for digests); browsers for the review
integration, in the static and the accelerated renderers.

**Project Type**: TypeScript library.

**Performance Goals**: SC-001 verdict per drag step on the 500-part reference sheet under 100 ms in the
reference browser (a neighbour index keeps it near O(neighbours)); SC-006 risk assessment of the
reference job under 2 s in Node.js (O(actions x nearby cells) with a spatial grid); worst of five runs.

**Constraints**: additive public API (`ReviewRenderer.overlay` optional, new `ReviewController` methods,
new mount options); no input mutation; geometry stays unitless and the risk profile declares
`geometryUnitsPerMeter`; no invented limit (a missing limit makes that rule not assessable); no wall
clock or randomness; fixed iteration order; every gap is a notice; user text is Brazilian Portuguese
from one module per feature, codes and fields English; one public function per source file; every `src`
change updates its sibling `.doc.md` in the same task; no other documentation is created; files under
500 lines.

**Scale/Scope**: one artifact per session; reference size 500 parts and about 10^4 actions; larger jobs
stay correct and complete; the time targets are acceptance gates for the reference size only.

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1.*

- **I. Library-First, Additive Public API**: PASS. `edit/` and `risk/` are new modules re-exported from
  `src/nesting/index.ts`; the review changes are additive options, optional methods and new controller
  commands; no existing signature changes.
- **II. Reuse Before Rewrite**: PASS. Validity reuses the true-shape bounds, separation and rotation
  rules the nesting itself applied, so an edit is judged by the rules that placed the part. Planning,
  costing, digests, linking and the review scene are reused (research D1, D2, D7). New algorithms exist
  only where nothing computes the property: heat accumulation, loose-part and head-strike detection.
- **III. Test-First**: PASS. Every module has failing tests before implementation.
- **IV. Determinism**: PASS. No time or random input; heat windows use plan time, not the clock; ties
  and iteration order are fixed; digests use canonical JSON.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: PASS. No dependency added; Zod validates the
  caller-supplied risk profile at the boundary like ADR-0002; no `unknown` in the domain; no persistence,
  no network, no input mutation.
- **Unit discipline / precision / silent failure**: PASS. The profile declares the length conversion,
  comparisons use `EPSILON`, and every gap is a notice.
- **Documentation, coding and comment discipline**: PASS. `.doc.md` siblings per task; messages in one
  module per feature; JSDoc on public functions; no narrative comments.

## Phase 0: Research Summary

`research.md` resolves: module boundaries, what an edit changes, the validity rules and where they come
from, undo and redo, the edited artifact contract, stale tracking and recomputation, the four risk
rules and their profile, the heat view, performance, the review integration and accessibility. No
`NEEDS CLARIFICATION` remains.

## Phase 1: Design Summary

- `data-model.md`: edit state, edits, verdicts, edited artifact, risk profile, findings, heat view,
  comparison, with validation rules and state transitions.
- `contracts/edit-risk-api.md`: public functions, review options, renderer overlay and report contracts.
- `quickstart.md`: runnable gates, acceptance scenarios and the measurement procedure.

## Project Structure

### Documentation

```text
specs/010-nesting-edit-physics/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── edit-risk-api.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/nesting/edit/                  # immutable edit model, no DOM
├── types.ts            # EditInput, EditState, PartEdit, PlacementVerdict, EditedArtifact, ...
├── messages.ts         # pt_BR texts of violations and notices (internal)
├── createEditState.ts  # start a session from artifact, layout, plan and constraints
├── transformPlacement.ts  # move, rotate, mirror a placement, its outline and compound parts (internal)
├── judgePlacement.ts   # verdict of a candidate edit (violations, approximate flags)
├── commitEdit.ts       # apply a valid edit, drop the redo branch, mark results outdated
├── undoEdit.ts         # step back in the log
├── redoEdit.ts         # step forward in the log
├── enclosedGroup.ts    # parts enclosed in the holes of a part move together (internal)
├── editedLayout.ts     # materialize the edited artifact layout, placements and compound placements
├── editedCutLayout.ts  # the edited CutLayout (every contour of a moved part) for planning and the review
├── freshness.ts        # which derived results are outdated after which edit (internal)
├── buildEditedArtifact.ts  # Observable: new artifact, reference to the original, edit log, digest
├── recomputeEdited.ts  # Observable: cut plan, cost and risk of the edited layout
├── compareLayouts.ts   # comparison summary against the original
└── index.ts            # barrel

src/nesting/risk/                  # indicative thermal and mechanical rules, no DOM
├── types.ts            # CutRiskProfile, RiskFinding, RiskReport, HeatView, FreedMoment, ...
├── schemas.ts          # Zod schema of the risk profile
├── messages.ts         # pt_BR texts of findings and notices (internal)
├── validateRiskProfile.ts  # checks beyond the schema (units, ranges)
├── actionTimes.ts      # start and end time of each action from the profile speeds (internal)
├── freedMoments.ts     # the action at which each part becomes free, tabs keep it held (internal)
├── heatEvents.ts       # cut length per cell and time (internal)
├── heatAt.ts           # heat view at a plan time
├── assessHeat.ts       # rule 1: heat accumulation (internal)
├── assessThinWeb.ts    # rule 2: thin web (internal)
├── assessLoosePart.ts  # rule 3: small part that can move or tip up (internal)
├── assessHeadStrike.ts # rule 4: head over a freed loose part (internal)
├── assessCutRisk.ts    # sync core: rules -> findings, assessed and not assessed rules
├── calculateRiskReport.ts  # Observable: validates, assesses, adds the digest
└── index.ts            # barrel

src/nesting/linking/
├── actionCategory.ts   # cut, travel or pierce category of an action kind, moved from cost
├── neighbourIndex.ts   # spatial grid of the sheet outlines for fast verdicts and the thin-web rule
└── actionDuration.ts   # per-action duration extracted from cost/estimateTimes, shared with risk

src/nesting/erp/
└── outputProjection.ts # projection of the output digest, extracted from artifact.ts, shared with edit

src/nesting/review/                # integration, thin
├── editCommands.ts     # edit and risk commands of the controller, delegating to the pure modules
├── editPanel.ts        # edit controls: kind, numeric entry, confirm, undo, redo, freshness
├── riskPanel.ts        # findings list, assessed and not assessed rules, mitigation text
├── attachDrag.ts       # pointer drag with live verdict
├── overlay.ts          # overlay data: ghost, violations, heat cells, freed parts, markers
├── riskMarkers.ts      # timeline markers that seek and select
└── (controller, mount, controlsPanel, renderers, messages, announce: additive changes)

src/nesting/review/three/ updateOverlay.ts   # accelerated overlay drawing

src/nesting/index.ts    # re-export edit and risk public surface (additive)
<each file above>.doc.md  # sibling documentation, updated in the same task as its source

test/unit/nesting/edit/       fixtures.ts, judgePlacement, commitEdit, undoRedo, buildEditedArtifact,
                              recomputeEdited, compareLayouts, enclosedGroup, neighbourIndex tests
test/unit/nesting/risk/       fixtures.ts, validateRiskProfile, assessHeat, assessThinWeb,
                              assessLoosePart, assessHeadStrike, assessCutRisk, calculateRiskReport tests
test/unit/nesting/review/     edit and risk integration unit tests
test/integration/nesting/editRealParts.test.ts
test/integration-browser/review.edit.browser.spec.ts
```

**Structure Decision**: feature-local modules beside `erp/`, `cutPath/`, `cost/` and `review/`. `edit/`
and `risk/` are pure and have no DOM; neither depends on the other (the edit recomputation composes them
at the flow level). The review owns every DOM concern and calls the pure modules. `types.ts`,
`schemas.ts` and barrels are the only multi-export files. Internal helpers are not exported through the
barrels.

## Files added while implementing

Files the structure above does not list, with their reason (each has its own `.doc.md`):

- `src/nesting/edit/`: `pivotOf`, `transformMembers`, `applyEdit`, `replayEdits`, `moveCursor`,
  `layoutKey`, `markComputed`, `notice`, `violation`, `orientationViolations`, `geometryViolations`,
  `commonLinesBroken`, `originalResults`: the public functions stay one per file, so each step of the
  judge, the replay and the recomputation is its own small module.
- `src/nesting/linking/`: `neighbourIndex` (moved from `edit/` so `risk/` can reuse it without
  depending on `edit/`), `metadataNumber`, `formatQuantity`.
- `src/nesting/risk/`: `riskContext`, `buildFinding`, `gradeSeverity`, `neighbourhoodLength`,
  `pathDistance`, `heatViewOf`, `planTimeAt`: shared by several rules and by the playback views.
- `src/nesting/review/`: `editKeyMap` (pure key bindings, so `keyMap.ts` is untouched),
  `populateReview`, `mountEditable`, `overlaySvg`, `overlayHub`, `riskPlayback`, `seekTargetOf`,
  `createRiskView`, `startRecompute`: they keep the mount, the rebuild after an edit and the risk views
  out of `controller.ts` and `mount.ts`.
- `ReviewController` is not changed: the edit and risk commands live in `ReviewMount.edit` and in the
  risk panel, which keeps the playback controller additive.

## Complexity Tracking

No constitution violations require justification. The extraction of `actionDuration` and
`actionCategory` from the cost estimation and of `outputProjection` from the ERP artifact builder
changes no public behavior or digest and exists to satisfy Principle II; existing cost and ERP suites
are the regression guard.

## Terminology

The spec says *Edit Session* and *Technology Profile (risk limits)*; the code says `EditState` and
`CutRiskProfile`. They are the same concepts.
