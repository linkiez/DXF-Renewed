# Nesting Edit and Cut Risk Research

## D1. Decision: Two pure modules, `edit/` and `risk/`, and a thin review integration

**Rationale:** Editing a layout and assessing a cut plan are independent computations. Keeping them as
pure, DOM-free modules makes each testable without a browser (Principle III), lets the ERP or another UI
reuse them, and keeps the review as the only place that touches the DOM. The edit module never imports
`risk/` and the reverse; the edit recomputation flow composes them. Both follow the shape of `cost/`: a
synchronous core and an Observable flow when digests are needed.

**Alternatives considered:** Putting everything in `review/` (couples the models to the DOM and blocks
reuse); one combined module (the two have different inputs, tests and release value).

## D2. Decision: An edit changes the placement transform of one part, validated with the rules that placed it

**Rationale:** The artifact stores each placement with `x`, `y`, `rotation` and the transformed outline
(`transformedVertices`), where `(x, y)` is the bounding-box minimum of the outline (the convention of the
true-shape search, confirmed by a test). A move translates the outline and `(x, y)` by the same delta;
a rotation turns the outline about the center of its bounding box, adds to `rotation` (modulo 360) and
sets `(x, y)` to the new bounding-box minimum; a mirror reflects the outline about the vertical axis
through that center and is recorded only in the edit log and the outline, because the cut plan reads `transformedVertices` when present. This keeps the
006 placement schema unchanged. Validity reuses what the true-shape search applied: `isWithinBounds`
(usable area, edge clearance and stock holes, which are the remnant exclusions),
`isSeparatedFromAll` with `partToPartClearance` (minimum spacing), `checkCollision` for overlap, and
`effectiveRotations` for allowed rotations and grain. An edit is therefore judged by the same rules that
produced the layout, with no second definition of "valid".

A part can also be stored as a compound placement (`compoundPlacements`: an outer placement and hole
placements with their own `x`, `y`, `rotation` and `bbox`); an edit transforms the compound's own
fields, the outer placement and every hole placement together. A mirror reverses the winding of the
outline, so the transformed outline is normalized with `normalizeWinding` before it is stored and the
planner receives a consistent orientation. The edited `CutLayout` is produced by updating the
`placement` of every contour of the moved part (outer and inner, found by `partId` and
`parentContourId`) from the same transform, so planning, linking and the review agree. Parts enclosed
in the holes of a moved part are found from the layout's inner contours and the compound hole
placements; without either, the group is empty and the verdict is marked approximate.

**Alternatives considered:** Re-running the nesting search to validate (slow and not a verdict about the
user's position); inventing separate clearance rules (violates Principle II).

## D3. Decision: Constraints that the artifact does not carry come from an optional input

**Rationale:** The artifact keeps stock snapshots, echoed clearances and placements, but not the
allowed rotations, grain or mirroring of each part. The edit input therefore takes an optional
`constraints` object (allowed rotations, per-part grain lock and angle, per-part mirrorable flag). When
it is absent, free movement is judged normally, rotation and mirror are refused with the reason
`CONSTRAINTS_UNKNOWN` instead of being guessed (FR-018). Forbidden zones beyond stock holes and extra
exclusions (parts already cut in an earlier job) come from the same input.

**Alternatives considered:** Assuming all rotations are allowed (could produce an invalid cut); reading
the original request (the review must work from what the ERP stored, as in 007 and 008).

## D4. Decision: Fast verdicts with a neighbour index and early exit

**Rationale:** SC-001 needs a verdict per drag step on a 500-part sheet in under 100 ms. A uniform grid
of the sheet's outlines, built once per sheet and updated per committed edit, returns only the parts whose
box intersects the candidate expanded by the clearance, so a step costs about the number of neighbours,
not the number of parts. All violations of the candidate are reported (not only the first) because the
user needs every reason; the cheap box rejects run before the exact SAT and distance checks.

**Alternatives considered:** Checking against all parts each step (O(n) with exact geometry, too slow at
500 parts); a quadtree (more code than a grid for evenly sized parts).

## D5. Decision: Immutable edit state with a log and a cursor

**Rationale:** The state holds the base artifact, the ordered list of confirmed edits, a cursor into it
and the freshness of derived results. Commit appends at the cursor and discards the redo branch; undo and
redo move the cursor; the layout is materialized from the base plus the edits up to the cursor, so any
position in the log reproduces the layout exactly (SC-003) and the digest depends only on the base and the
applied edits (SC-004). No mutation of caller objects (Principle V); depth is bounded by the 100-step
requirement and a configurable cap that reports `EDIT_LOG_FULL` instead of dropping history silently.

**Alternatives considered:** Snapshots of the whole layout per step (memory grows with parts x steps);
mutating the artifact (forbidden).

## D6. Decision: The edited result wraps an unchanged 006 artifact

**Rationale:** `EditedArtifact` is `{ artifact, edit }`. `artifact` is an `ErpNestingArtifact` with the
edited `layout`, the same correlation, snapshots and `inputDigest`, and a new `outputDigest` computed
with the same canonical projection that `createNestingArtifact` uses. `edit` carries the digest of the
original output, the original `inputDigest`, the ordered edit log and a digest of the whole edited
result. The 006 schema and contract version stay unchanged, so existing consumers and the review still
accept the inner artifact, and the reference to the original stays outside the frozen contract. Utilization,
waste and total area are not recomputed because edits keep the same parts on the same sheets. The
canonical projection moves from `erp/artifact.ts` to `erp/outputProjection.ts`, taking the contract
version instead of a request, so the artifact builder and the edited result share one definition and the
existing digests do not change; the projection is verified by a test against the original digest for the empty log (SC-004, no edits equal
the original).

**Alternatives considered:** Adding fields to the 006 artifact (changes the contract and its digest
projection); a separate unlinked file (loses traceability).

## D7. Decision: Freshness is explicit and recomputation reuses existing planners

**Rationale:** The first confirmed edit marks plan, cost, validations and risk as `outdated`; each
recomputation marks only its own result `current` (SC-005). Recomputation runs `planCutPath` on the
edited `CutLayout` (contour placements updated from the edit), then `buildCostBreakdown` and the risk
assessment, as an Observable that emits step results so the review can show each as it completes. A
failure of a step yields a notice and `unavailable` for that step and keeps the edited layout (FR-007,
US2/AC4). The caller still supplies the process profile and the cost model; this feature owns neither.

Every commit, undo and redo increments a `revision` of the state; a recomputation step carries the
revision it started from and is discarded, with `RECOMPUTE_DISCARDED`, when the state has moved on, so
results of a stale run never become `current`. Until the plan step succeeds, the review rebuilds its
scene from the edited layout without the cut plan (the old action paths no longer match the parts) and
says that the plan is outdated; a successful plan step rebuilds the scene with the new plan.

**Alternatives considered:** Recomputing automatically at every commit (expensive during a drag session
and surprising); keeping stale values visible with a badge (violates FR-006).

## D8. Decision: Risk assessment is rule based on a caller-supplied profile

**Rationale:** The requester chose indicative rule-based risk. Every number comes from the
`CutRiskProfile`: SI units (meters, square meters, seconds) with `geometryUnitsPerMeter` to convert, each
limit an optional field so a missing one makes only that rule `not assessable` with the missing path named
(FR-010). The library ships no material data. Severity: a finding is `warning` when the measured value
reaches the limit and `critical` when it reaches the limit times the profile's `criticalFactor`; without
`criticalFactor` all findings stay `warning` and a notice says the grading is unavailable. Reports always
state they are indicative (FR-012).

The four rules:

| Rule | Measure | Compared with |
|---|---|---|
| Heat accumulation | cut length performed inside a disc of `heat.radius` around a point during the trailing `heat.windowSeconds` of plan time | `heat.maxCutLength` |
| Thin web | smallest distance between a part outline and a neighbouring outline, a sheet edge or a hole | `web.minimum` |
| Loose part | area of a part that becomes free (outer contour finished, no tab) | `loosePart.maxArea` |
| Head strike | head path (cut or rapid) passing within `headStrike.clearance` of a loose part after it was freed | the clearance itself |

**Alternatives considered:** A numerical thermal model (rejected by the requester, needs material data the
repository does not have); fixed built-in limits (invents values, forbidden).

## D9. Decision: Plan time comes from the action durations, not from the clock

**Rationale:** Heat windows and the "after it was freed" ordering need a time axis. Each action's duration
is the same function the cost uses (length over the cutting or rapid speed, pierce dwell), extracted to
`linking/actionDuration.ts` and shared, so cost time and risk time agree and the review's cost and risk
views describe one schedule. The profile supplies `speeds`, `pierceDwellSeconds` and
`geometryUnitsPerMeter`; metadata `feed` and `dwell` take precedence, as in 008. Missing speeds make the
time-dependent rules `not assessable`.

**Alternatives considered:** Duplicating the duration logic in `risk/` (violates Principle II); wall-clock
playback time (non-deterministic, depends on playback speed).

## D10. Decision: Parts become free at the end of their outer contour unless a tab holds them

**Rationale:** A part is free once the action that closes its outer contour finishes. A part with `tab`
actions on that contour stays held and is reported `held` instead of free. Only a part that is free and
loose (area at or below `loosePart.maxArea`) can be struck; larger free parts are reported as free in the
playback but raise no head-strike finding, which keeps findings meaningful. Freed moments are computed
from the same linking as the review and the cost (`linkActions`), so all three agree on which part an
action belongs to.

**Alternatives considered:** Treating every freed part as a strike target (noise on every job); modelling
tip-up mechanics (outside the indicative scope).

## D11. Decision: The heat view is computed on demand from time-sorted events

**Rationale:** `heatEvents` produces, per sheet, the cut length of each action split by grid cell with its
plan-time interval. `heatAt(time)` sums the events inside the trailing window per cell and divides by
`heat.maxCutLength`, so a seek costs about the events in one window, with no precomputed grid per action
(which would be cells x actions in memory). The grid cell is `heat.radius / 2`; a cell's value includes
the cells within the radius. Values above 1 are over the limit.

**Alternatives considered:** Precomputing a field per action (memory heavy at 10^4 actions); a continuous
diffusion (needs thermal constants not provided).

## D12. Decision: Review integration through an optional overlay and controller commands

**Rationale:** `ReviewRenderer` gains an optional `overlay(overlay: ReviewOverlay)` so third-party
renderers keep working; the static and accelerated renderers implement it, drawing the ghost position,
violation marks, heat cells, free parts and risk markers with pattern, outline and text cues in addition
to colour (FR-015). The playback controller is not changed: the edit commands live in a separate handle
(`ReviewMount.edit`) and the risk actions in the risk panel, which delegate to the pure modules. When the edited layout changes, the scene is rebuilt with the existing `buildReviewScene` from
the edited input, so the viewer and the edit never disagree. Keyboard editing uses the existing key map
with an edit mode: arrow keys nudge by a step, numeric fields accept exact offsets and angles, Enter
confirms, Escape cancels, Ctrl+Z and Ctrl+Y undo and redo. Every verdict and finding change is announced
through the existing live region.

**Alternatives considered:** A separate edit viewer (duplicates the scene and the renderers); drawing the
overlay in the DOM above the canvas (not available to the accelerated renderer's coordinate system and
breaks fallbacks).

## D13. Decision: Messages and units

**Rationale:** Same rule as 007 and 008: every user text is built in one messages module per feature, in
Brazilian Portuguese, with English stable codes. Text carried by the artifact is copied as received. Edit
numbers are in geometry units and degrees as the artifact uses; risk limits are SI through the profile.

## D14. Decision: Performance and measurement

**Rationale:** Beyond the reference size the results stay correct and complete; the time targets are
gates for the reference size only. SC-001 is measured in the reference browser on the 007 reference sheet (500 parts) by
dragging a part across it in 60 steps and taking the worst step of five runs. SC-006 is measured in Node
on the reference job with a profile that makes every rule assessable, worst of five runs. Both
procedures are in `quickstart.md`.

## Open items (not blocking, resolved during implementation)

- Resolved: `(x, y)` is the bounding-box minimum, not the centroid; `transformPlacement.test.ts` proves it
  against the placement the true-shape search produces.
- Whether `ReviewController` additions need a `.doc.md` update per file touched (yes).
