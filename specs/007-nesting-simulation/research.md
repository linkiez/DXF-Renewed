# Nesting Review Research

## Decision: Review input is `ErpNestingArtifact` plus optional `CutLayout` and `CutPlanResult`

**Rationale:** The 006 artifact carries the layout (`NestResponse`: placements with
`transformedVertices`, sheets, unplaced), status, warnings, rejections, correlation and digests,
but **no cut plan** and **no part metadata** (layer, handle, area live in the request's parts).
Cut actions and planning problems come from 004's `CutPlanResult`; contour-to-placement identity
comes from 004's `CutLayout` (each `CutContour` holds its `NestableShape` and `Placement`). Making
the plan and layout optional lets a layout-only artifact still be reviewed (spec edge case).

**Alternatives considered:** Extending `ErpNestingArtifact` with a cut plan was rejected: it would
change the 006 contract and digest projection. Requiring the original `ErpNestingRequest` was
rejected: the review must work from what ERP stored.

## Decision: Link actions to placements through the layout, then by key

**Rationale:** Resolution order: (1) `CutLayout.contours[].partId`/`id` to its `placement`
(`shapeId` + `instanceIndex`); (2) `partId` equal to `shapeId` or `shapeId#instanceIndex`.
Anything unresolved produces one `ReviewNotice` per distinct id and stays in the timeline.

**Alternatives considered:** Guessing by geometric containment was rejected as non-deterministic
under overlap. Dropping unlinked actions violates the silent-failure rule.

## Decision: Pure review model separate from renderers

**Rationale:** Scene, timeline, picking, inspector data and summary are pure and
renderer-independent, so the SVG and three.js views share one source of truth (DRY), determinism
(FR-013, SC-005) is testable in Node, and picking never depends on a GPU. A `ReviewPosition`
(`sheetId`, `actionIndex`, `progress`) fully determines the display; seek and play share the same
`stateAt` function, which is what makes SC-005 hold by construction.

**Alternatives considered:** Renderer-owned state (three.js `Raycaster`, scene graph as truth) was
rejected: not testable headlessly and different between fallback and accelerated paths.

## Decision: three.js is an optional peer dependency, lazy and caller-injected

**Rationale:** The user chose three.js for the accelerated renderer. Constitution Principle V
forbids new `dependencies` entries without an ADR; an optional peer plus a devDependency keeps
consumers who never open a review free of the cost. The renderer factory takes the `three`
namespace (or an async loader) from the caller, so library code never contains `import 'three'`
reachable from `src/index.ts`; the iife `dist` bundle and `lib` for non-review users are
unaffected. The renderer ships on the additive subpath `review/three`, keeping its `three` type
imports out of the main `.d.ts` graph. Decision recorded in ADR-0003.

**Alternatives considered:** A hard `dependencies` entry (major bump, every consumer pays). A bare
`import('three')` inside the main bundle (esbuild inlines it into the iife and fails without the
package). Canvas 2D as the primary view (see Complexity Tracking in `plan.md`).

## Decision: Top-down orthographic view only; extruded 3D is out of scope

**Rationale:** The spec requires a top-down two-dimensional view. An orthographic camera over a
planar scene also keeps picking exact (hit-test in sheet coordinates, not ray casting).
`docs/nesting/VIEWER-THREEJS.md` describes an optional 3D perspective mode and the Raycaster; both
are superseded for this feature. That document is not edited by this feature: the documentation
rules allow only sibling `.doc.md` files without an explicit request, so it stays stale until the
maintainer asks for its update.

**Alternatives considered:** Perspective/extrusion mode: deferred, additive later.

## Decision: Merged buffers, draw-range trail, instanced markers

**Rationale:** One `LineSegments` per action kind (dashed material for rapid) and `InstancedMesh`
markers for pierce, lead and tab keep draw calls constant. Actions are flattened once into
preallocated position buffers in timeline order; the cut trail is a prefix of that buffer, so seek
and playback only change `drawRange` and the head position. No per-frame allocation.

**Alternatives considered:** One mesh per part or action (draw calls scale with plan size);
rebuilding geometry on seek (fails SC-004).

## Decision: Non-color-alone action distinction

**Rationale:** FR-002 forbids color-only coding. Kinds differ by line style (rapid dashed, cut
solid, lead thinner), marker shape (pierce disc/cross, tab bracket, lead arrow, overcut distinct)
and color, plus a legend; the same encoding is used by the SVG renderer.

## Decision: Playback is a controller concern with an injected clock

**Rationale:** The model has no time. The controller maps elapsed time to a length along the
timeline (speed multiplier, optional feed weighting from `metadata` only when numeric) and exposes
`ReviewState` as an RxJS `Observable` (rxjs is already a runtime dependency). Injecting the clock
makes playback tests deterministic and keeps wall-clock out of results. Playback never starts
automatically in any configuration, so `prefers-reduced-motion` needs no separate code path: seek,
sheet switch, pan and zoom are always applied immediately and no animated transition exists. A mount
test with `matchMedia` stubbed to both values asserts this.

**Alternatives considered:** `requestAnimationFrame` inside the controller (not testable in Node).

## Decision: Contract validation by the existing Zod schema; digests are displayed, not recomputed

**Rationale:** `erpNestingArtifactSchema` and `ERP_CONTRACT_VERSION` already define a valid
artifact; review reports an unsupported version or a schema failure as a notice and renders
nothing as valid. Recomputing digests is outside the spec (display only) and would duplicate 006.

## Decision: Accessibility via summary region, keyboard map and ARIA live status

**Rationale:** The mount layer renders the text summary and the notices list as real DOM beside
the canvas. Every function has both a labeled control reachable with Tab and a key. Keyboard map
(defined in the controller contract): Space play/pause; `r` reset; `n` next pierce; `<`/`>`
slower/faster; `[`/`]` previous/next sheet; `,`/`.` previous/next action; PageUp/PageDown -10/+10
actions; Home/End first/last action; ArrowLeft/ArrowRight previous/next part (selects);
ArrowUp/ArrowDown previous/next action (selects); Enter seek to the selected action; Esc clear
selection; Shift+arrows pan; `+`/`-` zoom; `0` reset view. There is no pointer-dependent
function: selection and seeking to any action are reachable from the keyboard (SC-007). A live
region announces playback and selection changes.

## Decision: Static renderer is position-aware

**Rationale:** FR-005 requires the fallback to carry the same information as the accelerated
review. `renderReviewSvg` therefore draws the trail (completed actions), the current partial
action, the head marker and the selection from the same `stateAt` result the accelerated renderer
uses, so playback, seek and step keep working after a graphics failure. Static renders stay cheap
because action kinds are merged into one `<path>` each.

**Alternatives considered:** A position-less SVG used only for the initial view (loses playback
after a failure, contradicting FR-005).

## Decision: Placement resolution never drops or guesses

**Rationale:** The 006 schema makes `sheetId`, `transformedVertices` and `instanceIndex` optional
and allows `compoundPlacements`. The rules in `data-model.md` (sheet from `sheetId` or the single
sheet; deterministic instance order; `bbox` rectangle with an `info` notice instead of guessed
geometry; one part per compound placement) keep every placement visible or explicitly reported,
as the constitution's silent-failure rule requires.

## Decision: User-facing language is pt_BR from one message module

**Rationale:** The constitution fixes user-facing strings to Brazilian Portuguese. All text the
review produces (labels, legend, ARIA names, live announcements, summary text, notice messages)
lives in `src/nesting/review/messages.ts` and nowhere else, so language is testable in one place.
Messages carried by the artifact or the cut plan are displayed exactly as received, because they
are caller data.

## Decision: One public function per file

**Rationale:** The architecture rule of one public export per source file is followed:
`buildTimeline.ts`, `stateAt.ts`, `nextPierce.ts`, `buildScene.ts`, `pick.ts`, `inspect.ts`,
`summary.ts`, `renderSvg.ts`, `controller.ts`, `mount.ts`. `types.ts` and the barrels are the
exceptions already used by `cutPath/types.ts`. Internal helpers (`panels.ts`, `keyMap.ts`,
`messages.ts`, `linkParts.ts`, `three/buffers.ts`) are not exported through the barrel.

## Decision: Typed `three` through the injected namespace

**Rationale:** `ThreeNamespace` is `typeof import('three')`, referenced only inside
`src/nesting/review/three/`, so no `unknown` or loose record types are needed and the main `.d.ts`
graph stays free of `three`.

## Decision: Performance approach and measurement

**Rationale:** Build cost is O(placements + actions) with cumulative lengths precomputed; seek is a
binary search plus a draw-range update. The baseline environment is reproducible: the Playwright
Chromium used by the browser tests with software-rendered graphics (the no-graphics-card worst
case) on the reference machine, recording processor model and core count with each result. "Open"
means from the start of the `buildReviewScene` call to the first frame after `render`, measured
with `performance.now()` in the page. SC-004 runs from the `seek` call to the next rendered frame.
A gate passes only when the worst of five consecutive runs meets the threshold. The 100 ms
first-render figure in the old viewer notes is an internal target only; the spec gates are 2 s and
500 ms.

## Open items (not blocking, resolved during implementation)

- Reference artifact: generate the 500-part sheet with holes and its plan deterministically in a
  fixture builder (seeded), not a checked-in large file.
- Whether `three` should additionally be pinned in the peer range to a tested major; settled at
  implementation by the tested version.
