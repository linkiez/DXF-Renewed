# Nesting Review Quickstart

## Prerequisites

- Node.js 18 or newer; dependencies installed with `yarn install` (includes the `three`
  devDependency used by tests).
- For browser checks: Playwright browsers installed; `yarn dist` is run by the Playwright web
  server automatically. Browser runs use software-rendered graphics (no graphics card), which is
  the baseline environment of the spec.

## Focused validation

```bash
yarn test:unit            # includes test/unit/nesting/review/
yarn test:integration:browser   # test/integration-browser/review.browser.spec.ts
```

The feature tests must cover (contracts: `contracts/nesting-review-api.md`, entities:
`data-model.md`):

1. A complete artifact shows every sheet, placement and status; multi-sheet switching shows only
   the selected sheet's items (US1, FR-010).
2. A partial artifact lists unplaced items, warnings and rejections with their reasons and never
   draws them as placements (FR-008).
3. Identity shows status, contract version, correlation and both digests (FR-007).
4. Playback, pause, reset, speed and step-to-next-pierce follow the ordered actions (FR-003).
5. Seeking to every sampled action equals playing from the start to it (SC-005, FR-013).
6. Action kinds differ by more than color in both renderers (FR-002).
7. Part and action selection show identity, rotation, placement, owning part and metadata values;
   planning problems appear on the affected part or action (FR-004, FR-009).
8. No cut plan, rejected artifact, unsupported version and invalid artifact each yield a specific
   notice and no blank view (FR-011, SC-006).
9. Degenerate action, unknown part, empty sheet and overlap-pick order behave as in the spec edge
   cases.
10. Frozen inputs: the artifact and its digests are identical before and after a session
    (FR-006, SC-008).
11. No automatic playback in any configuration; with `matchMedia` stubbed to reduced-motion on and
    off, seek, sheet switch, pan and zoom apply immediately (FR-012).
11a. After a forced renderer failure the static view shows the same trail, head, selection and
    notices at the same position, and play, pause and seek still work (FR-005).
11b. Placements without `sheetId`, `transformedVertices` or `instanceIndex`, and compound
    placements, are drawn or reported with the notices in `data-model.md`.
12. Keyboard-only run completes every function in SC-007, including selecting a part and an
    action (ArrowLeft/ArrowRight, ArrowUp/ArrowDown), seeking to any action (`,` `.`, PageUp,
    PageDown, Home, End, Enter on the selection) and the go-to-action field; the summary region
    is present and all review-produced text is in Brazilian Portuguese.
13. Without `three` or without WebGL2, and on simulated context loss, the static renderer shows
    the same placements, statuses and identity, keeping position and selection (FR-005, SC-003).
14. The main entry (`src/index.ts` and the `dist` bundle) contains no reference to `three`.
15. Real drawings from `test/resources/nest-fixtures` nest, plan and review without unlinked actions or unresolved placements.

## Repository gates

```bash
yarn type-check
yarn lint
yarn test:unit
```

## Acceptance scenarios

Build the seeded reference artifact (500 parts with holes, its `CutLayout` and `CutPlanResult`)
with the fixture builder. Open it, play a few actions, pause, seek to the last action, select a part
and an action, switch off WebGL2 and confirm the static view keeps position and selection.

## Performance measurement

On the baseline environment from the spec (the browser-test Chromium with software-rendered
graphics on the reference machine; record the browser version, processor model and core count),
run the browser spec's timing test five times and record the worst case:

- SC-002: from the start of the `buildReviewScene` call to the first frame after `render`,
  measured with `performance.now()` in the page, < 2 s.
- SC-004: from `seek` to the next rendered frame < 500 ms for 20 evenly spaced actions plus the
  first and last.

A failing gate fails the feature; the calibration is the defect to fix.

## Measured acceptance evidence

Recorded during implementation and linked from `tasks.md`.

### SC-002 and SC-004 (2026-11-16)

- Environment: headless Chromium 153 with software-rendered WebGL (ANGLE over SwiftShader), reference
  machine Intel Core i9-12900K, 24 logical cores, Linux x86_64.
- Procedure: `test/integration-browser/review.browser.spec.ts` ("measures opening and seeking of
  the 500-part reference sheet"), five runs, 500 parts with holes and a 5,001-action plan; open
  measured from the start of `mountReview` to the first frame after `render`; seek measured from
  `seekToAction` to the next frame for 22 positions per run (first, last and 20 evenly spaced).
- Result: SC-002 worst open 69 ms (threshold 2,000 ms); SC-004 worst seek 143 ms (threshold
  500 ms), across the runs recorded on 2026-11-16.

### Success criteria coverage (2026-11-16)

| Criterion | Evidence |
|---|---|
| SC-001 | `buildScene.test.ts`, `renderSvg.test.ts`, browser "static view" specs; real parts in `test/integration/nesting/reviewRealParts.test.ts` |
| SC-002, SC-004 | Browser spec "measures opening and seeking of the 500-part reference sheet" (figures above) |
| SC-003 | Browser specs without an accelerated renderer and after a forced context loss; `threeRenderer.test.ts` (`GRAPHICS_UNAVAILABLE`) |
| SC-005 | `stateAt.test.ts` (seek equals play-to for every action, including the 500-part sample) |
| SC-006 | `buildScene.test.ts` (no plan, rejected, unsupported version, invalid, unplaced) and browser rejected-artifact spec |
| SC-007 | Browser spec "keyboard only" |
| SC-008 | `buildScene.test.ts` and `controller.test.ts` (deeply frozen inputs unchanged) |

Real drawings: `test/resources/nest-fixtures/LPEL-*.dxf` go through `prepareParts`, the ERP flow,
`planCutPath` and the review (placements drawn and linked, inspection with layer and handle, picking
and replay), in `test/integration/nesting/reviewRealParts.test.ts`.
