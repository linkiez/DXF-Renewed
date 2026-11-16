# Nesting Review Data Model

All entities are immutable value objects. Geometry is unitless and reuses `Point2D`, `Placement`,
`CompoundPlacement` and `StockItem`. Nothing here is persisted. The spec's **Action Marker** is the
visible form of a `ReviewAction`; the spec's **Playback Position** is `ReviewPosition`.

## `ReviewInput`

| Field | Type | Rules |
|---|---|---|
| `artifact` | `ErpNestingArtifact` | Required. Checked against `erpNestingArtifactSchema` and `ERP_CONTRACT_VERSION`; the scene is built from the caller's original object, never from the schema's stripped output. |
| `layout` | `CutLayout \| undefined` | Optional. Supplies contour to placement identity and part shapes. |
| `cutPlan` | `CutPlanResult \| undefined` | Optional. `plans` is used when present, else `plan`. |

## `ReviewScene`

Result of `buildReviewScene`; never throws for expected outcomes.

| Field | Type | Rules |
|---|---|---|
| `status` | `'ready' \| 'partial' \| 'unavailable'` | `unavailable` when no valid layout exists (rejected, bad version, invalid). `partial` when notices of severity `warning` or `error` exist. |
| `identity` | `ReviewIdentity \| null` | Artifact status, contract version, correlation, input/output digests; `null` when the artifact is invalid or its contract version is unsupported. |
| `sheets` | `ReviewSheet[]` | Order follows the artifact; empty only when `unavailable`. |
| `notices` | `ReviewNotice[]` | Warnings, rejections, unplaced, planning problems, gaps, inconsistencies. |
| `summary` | `ReviewSummary` | Sheets, part count, yield, total cut length. |
| `capabilities` | `{ playback: boolean; actionInspection: boolean }` | `false` always accompanied by a notice (FR-011). |

## `ReviewSheet`

| Field | Type | Rules |
|---|---|---|
| `id` | `string` | Stable sheet identity. |
| `stock` | `StockItem` | Boundary and size. |
| `parts` | `ReviewPart[]` | Empty sheet is valid and has an explicit `EMPTY_SHEET` notice. |
| `timeline` | `ReviewTimeline \| undefined` | Present only when a plan exists for the sheet. |

## `ReviewPart`

| Field | Type | Rules |
|---|---|---|
| `key` | `string` | `shapeId#instanceIndex`; unique within the scene. |
| `shapeId`, `instanceIndex` | `string`, `number` | From the placement. |
| `placement` | `Placement \| CompoundPlacement` | Position, rotation, `bbox`. |
| `outlines` | `Point2D[][]` | Polygons drawn for the part (see placement resolution). |
| `source` | `{ layer?: string; originalHandle?: string; area?: number; perimeter?: number }` | Only when a shape is available through the layout; never invented. |
| `status` | `'placed' \| 'flagged'` | `flagged` when any notice of severity `warning` or `error` is recorded against the part or one of its actions. Unplaced items are not parts; they are notices (FR-008). |
| `notices` | `ReviewNotice[]` | Planning problems recorded against this part. |

### Placement resolution (no silent drops)

Applied in this order for each entry of `layout.placements` and `layout.compoundPlacements`:

1. **Sheet**: `placement.sheetId` when present; otherwise the only sheet when exactly one exists;
   otherwise the placement is not drawn and `PLACEMENT_SHEET_UNRESOLVED` is raised, naming it.
2. **Instance**: `instanceIndex` when present; otherwise the 0-based order among placements of the
   same `shapeId` in artifact order (deterministic).
3. **Outline**: `transformedVertices` when present; the outline is never guessed: the
   part is drawn as its `bbox` rectangle and `PLACEMENT_GEOMETRY_APPROXIMATE` (severity `info`) is
   raised.
4. **Compound placement**: one part keyed by the compound `shapeId` whose `outlines` are the outer
   placement followed by each hole placement, each resolved by rule 3.

## `ReviewTimeline`

Ordered, flattened actions of one sheet with precomputed cumulative length.

| Field | Type | Rules |
|---|---|---|
| `actions` | `ReviewAction[]` | Same order as `CutPlan.actions`; zero-length actions kept. |
| `totalLength` | `number` | Sum of segment lengths (arc and bezier measured along their curve). |
| `playTotal` | `number` | Total span of the playback axis: every action spans its length, or a dwell when it has none, so positions map one to one to playback distances. |
| `pierceIndices` | `number[]` | Indices of `pierce` actions, for step-to-next-pierce. |

`ReviewAction`: `index`, `kind` (`CutActionKind`), `points`, `curve?`, `startLength`, `length`,
`playStart`, `playSpan`, `partKey?` (undefined means unlinked and carries a notice), `contourId?`, `metadata?` (scalar
values copied verbatim), `notices[]`.

## `ReviewPosition`

| Field | Type | Rules |
|---|---|---|
| `sheetId` | `string` | Must exist in the scene. |
| `actionIndex` | `number` | Integer in `[0, actions.length]`; `actions.length` means finished. |
| `progress` | `number` | In `[0, 1)` within the action; `0` at an exact action start. |

`stateAt(scene, position)` is the only function that derives the displayed tool position, the set
of completed actions (trail) and the current action, for every renderer. Seeking to `{k, 0}` and
playing from the start until the position equals `{k, 0}` give identical results (SC-005).

## `ReviewSelection`

| Field | Type | Rules |
|---|---|---|
| `kind` | `'part' \| 'action'` | |
| `sheetId` | `string` | |
| `partKey` / `actionIndex` | `string` / `number` | One of them, matching `kind`. |

Selection is controller state only. Selecting an action also exposes its owning part. Clearing or
replacing a selection releases the previous one. Selection order for keyboard navigation is
deterministic: parts in sheet order, actions in timeline order.

## `ReviewNotice`

| Field | Type | Rules |
|---|---|---|
| `severity` | `'info' \| 'warning' \| 'error'` | |
| `code` | `string` | Stable. Artifact and planning issues keep their code; review codes are listed below. |
| `message` | `string` | Specific and actionable. Brazilian Portuguese when produced by the review; shown exactly as received when carried by the artifact or cut plan. |
| `origin` | `'artifact' \| 'planning' \| 'review'` | |
| `sheetId`, `partKey`, `actionIndex` | optional | Where the notice applies. |

Review codes: `UNSUPPORTED_CONTRACT_VERSION`, `INVALID_ARTIFACT`, `NO_LAYOUT`, `NO_CUT_PLAN`,
`EMPTY_SHEET`, `UNLINKED_ACTION`, `UNKNOWN_PART`, `PLAN_SHEET_MISSING`, `DEGENERATE_ACTION`,
`PLACEMENT_SHEET_UNRESOLVED`, `PLACEMENT_GEOMETRY_APPROXIMATE`, `GRAPHICS_UNAVAILABLE`,
`GRAPHICS_LOST`.

## `ReviewInspection`

`title`, `rows` (`label`, `value`) and `notices`. A part inspection always includes: key,
`shapeId`, `instanceIndex`, rotation, position, `bbox`, `source` fields when available, and the
artifact's correlation values (order, revision, request). An action inspection includes: kind,
owning part, and every `metadata` entry verbatim.

## `ReviewSummary`

`sheetCount`, `partCount`, `unplacedCount`, `yield` (artifact `utilization` as supplied, not
recomputed), `totalCutLength`, `totalRapidLength`, `pierceCount`. Rendered as text (FR-012).

## `ReviewState` (controller)

`position`, `playing`, `speed`, `sheetId`, `selection | null`, `viewport`,
`renderer: 'accelerated' | 'static'`, `notices` (scene notices plus runtime ones such as
`GRAPHICS_LOST`).

## State transitions

- `playing`: `play` from paused or finished-restart; `pause`, reaching the end, and `reset` leave it.
  Never entered automatically, in any configuration (FR-012).
- `renderer`: `accelerated` to `static` on missing WebGL2, missing `three` or context loss; adds a
  `GRAPHICS_*` notice; position, selection and viewport are kept, and the static renderer shows the
  same position (trail and head), selection and notices.
- `sheetId` change: position resets to the new sheet's `{0, 0}`; selection is cleared.
- View changes (seek, sheet switch, zoom, pan) are applied immediately; no animated transition
  exists, so the reduced-motion preference needs no separate path.
