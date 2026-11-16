# Nesting review viewer (three.js)

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §12. Specification:
[`specs/007-nesting-simulation`](../../specs/007-nesting-simulation/spec.md).

## Goal

Review a calculated nesting before release: sheets, placed parts, the ordered cut plan, notices and
the artifact identity. The viewer is read-only. It consumes an `ErpNestingArtifact` plus an optional
`CutLayout` and `CutPlanResult`, never recomputes layout, sequence or metrics, and never changes
them.

## Architecture

| Layer | Module (`src/nesting/review/`) | Needs the DOM |
|---|---|---|
| Model | `buildReviewScene`, `stateAt`, `nextPierce`, `pickAt`, `inspect`, `summarize` | no |
| Static view (always available) | `renderReviewSvg`, `createSvgRenderer` | no (string) / yes (adapter) |
| Accelerated view (optional) | `three/` (`createThreeRenderer`) | yes, WebGL2 |
| Session | `createReviewController` (RxJS `state$`, injected clock) | no |
| Mount | `mountReview` | yes |

The model is pure and shared by both views, so the displayed state at a position is identical in
the accelerated and the static view (`stateAt` is the only place it is derived).

## `three` is an optional peer dependency

Governed by [ADR-0003](../../.specify/adr/ADR-0003-review-three-peer-dependency.md).

- Declared in `peerDependencies` (optional) and `devDependencies`; never in `dependencies`.
- Nothing reachable from `src/index.ts` imports it. The renderer lives on the subpath
  `@linkiez/dxf-renew/review/three` and receives the `three` namespace (or an async loader) from the
  caller:

```ts
import { mountReview } from '@linkiez/dxf-renew'
import { createThreeRenderer } from '@linkiez/dxf-renew/review/three'

const review = await mountReview(host, { artifact, layout, cutPlan }, {
  acceleratedRenderer: (view) => createThreeRenderer({ container: view, three: () => import('three') }),
})
```

- Without `three`, without WebGL2, or after a context loss, the static view takes over at the same
  position, selection and viewport, with a `GRAPHICS_UNAVAILABLE` or `GRAPHICS_LOST` notice.
- The renderer types need `@types/three` in the consumer.

## Accelerated renderer

- Top-down orthographic camera that fits the whole sheet; redraws when the container resizes.
- Static content is merged into a constant number of objects (sheet, placed and flagged parts, one
  line batch per action kind in two copies, pierce and tab markers, current action, selection, head).
- The trail is a draw-range prefix of each merged buffer; the not yet executed part is the rest of
  the same buffer, drawn faintly. Seeking only updates draw ranges, one instance count and the head.
- Action kinds differ by more than color: `rapid` dashed, leads with their own dash patterns,
  `overcut` short dashes, `tab` square markers, `pierce` circular markers.
- Picking is done by the shared model (`pickAt`), not by ray casting. The renderer only converts the
  pointer into sheet coordinates (`pointAt`).

## Playback

Every action has a positive span on the playback axis (its length, or a dwell for actions without
length such as a pierce), so a position and a playback distance map one to one and seeking to an
action shows exactly what playing to it shows. Playback never starts automatically; view changes
(seek, sheet, pan, zoom) apply immediately. Time comes only from the injected `ReviewClock`.

Controls (each also has a labeled control reachable with Tab): Space play/pause; `r` reset; `n`
next pierce; `<` `>` speed; `[` `]` sheet; `,` `.` previous/next action; PageUp/PageDown ten
actions; Home/End first/last action; ArrowLeft/ArrowRight previous/next part; ArrowUp/ArrowDown
previous/next action; Enter seek to the selected action; Esc clear the selection; Shift+arrows pan;
`+` `-` zoom; `0` reset the view.

## Coordinates

DXF/nesting uses XY with Y up. The SVG renderer flips Y once, in one group transform; the
accelerated renderer uses the coordinates as they are. Geometry is unitless.

## Accessibility and language

A written summary (sheets, parts, unplaced items, yield, cut and rapid length, pierces), the notices
list and a `role="status"` region are real DOM beside the view. All text produced by the review is
Brazilian Portuguese and comes from `messages.ts`; messages carried by the artifact or the cut plan
are shown as received.

## Performance

Measured gates (500-part reference sheet, software-rendered Chromium): open in under 2 s and seek to
any action in under 500 ms; the figures are in
[`specs/007-nesting-simulation/quickstart.md`](../../specs/007-nesting-simulation/quickstart.md).

## Testing

- Unit: model, timeline, picking, inspector, SVG, controller (fake clock) and the renderer against a
  stub `three` namespace (`test/unit/nesting/review/`).
- Real drawings: `test/integration/nesting/reviewRealParts.test.ts` uses `test/resources/nest-fixtures`.
- Browser: `test/integration-browser/review.browser.spec.ts` covers WebGL, fallback after a lost
  context, reduced motion, pointer and keyboard-only use, and the timing gates.
