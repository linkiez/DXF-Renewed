# Data Model: Nesting Edit and Cut Risk Simulation

Types are described by fields and rules, not by code. Geometry is unitless (as in the artifact) and
angles are degrees. Risk limits are SI and converted with `geometryUnitsPerMeter`.

## Edit module

### EditInput
| Field | Rule |
|---|---|
| `artifact` | `ErpNestingArtifact` accepted by the 006 schema; contract version supported |
| `layout?` | `CutLayout`; when absent, the placement outlines are used and verdicts that depend on them are approximate |
| `cutPlan?` | `CutPlanResult` of the original layout, used for the comparison |
| `constraints?` | `EditConstraints` (below) |
| `limits?` | `{ maxLogLength?: number }`, default 100, must be an integer >= 100 |

### EditConstraints
| Field | Rule |
|---|---|
| `allowedRotations?` | list of degrees applied to every part unless overridden |
| `parts?` | map from shape id to `{ allowedRotations?, grainLocked?, grainAngle?, mirrorable? }`; `grainLocked` requires `grainAngle` |
| `exclusions?` | list of `{ sheetId, outline }` areas that no part may enter (earlier jobs, flaws) |

### PartEdit
| Field | Rule |
|---|---|
| `partKey` | key of the placed part (`shapeId#instanceIndex`), must exist on the sheet |
| `kind` | `move` \| `rotate` \| `mirror` |
| `delta` | `move`: `{dx, dy}` finite; `rotate`: `{degrees}` finite; `mirror`: none |
| `before` / `after` | placement transform before and after (`x`, `y`, `rotation`, `mirrored`) |

### EditState
`{ base, edits, cursor, revision, freshness }`. `revision` is an integer that increases on every commit,
undo and redo. `edits` is the ordered log of confirmed edits; `cursor` is how many
are applied (`0..edits.length`); the layout is the base with `edits[0..cursor)` applied. `freshness` maps
`plan | cost | validation | risk` to `current` or `outdated`.

State transitions: `commit` at cursor `c` truncates `edits` to `c`, appends the edit, sets cursor `c+1`
and marks every derived result `outdated`; `undo` sets cursor `c-1`; `redo` sets cursor `c+1`; any
cursor change marks the derived results `outdated` unless the cursor returns to the position that a
current result was computed for; a recomputation marks only its own result `current`.

A compound placement is edited as one unit: its own `x`, `y`, `rotation` and `bbox`, its
`outerPlacement` and every `holePlacements` entry are transformed together. A mirror normalizes the
winding of the stored outline.

### PlacementVerdict
| Field | Rule |
|---|---|
| `valid` | true only when `violations` is empty |
| `violations` | list of `Violation`, in fixed order: overlap, area, forbidden zone, spacing, orientation |
| `approximate` | true when a verdict depends on a placement outline that is only a bounding box |
| `group` | keys of the enclosed parts that move together with the part |

### Violation
`{ code, message, partKey?, otherPartKey?, zoneId? }`. Codes: `OVERLAP`, `OUTSIDE_USABLE_AREA`,
`FORBIDDEN_ZONE`, `SPACING_TOO_SMALL`, `ROTATION_NOT_ALLOWED`, `GRAIN_LOCKED`, `MIRROR_NOT_ALLOWED`,
`CONSTRAINTS_UNKNOWN`, `GROUP_INVALID`.

### EditNotice codes
`APPROXIMATE_OUTLINE`, `RECOMPUTE_DISCARDED`, `EDIT_LOG_FULL`, `PLAN_RECOMPUTE_FAILED`, `COST_RECOMPUTE_FAILED`,
`RISK_UNAVAILABLE`, `COMMON_LINE_BROKEN`, `NO_LAYOUT`, `INVALID_ARTIFACT`,
`UNSUPPORTED_CONTRACT_VERSION`. Severity `info`, `warning` or `error`.

### EditedArtifact
| Field | Rule |
|---|---|
| `artifact` | `ErpNestingArtifact`: edited `layout`, same correlation, snapshots and `inputDigest`, new `outputDigest` (same canonical projection as the 006 artifact) |
| `edit.originalOutputDigest` | `outputDigest` of the original artifact |
| `edit.originalInputDigest` | `inputDigest` of the original artifact |
| `edit.log` | applied edits only (`edits[0..cursor)`), in order |
| `edit.digest` | SHA-256 of the canonical JSON of the edited result without this field |
| `edit.notices` | notices raised while building |

Invariants: an empty log gives `artifact.outputDigest === edit.originalOutputDigest`; the original
artifact object is never mutated; the same base and the same ordered edits give the same result.

### RecomputeStep
`{ step, revision, status, result?, notices }`. A step whose `revision` differs from the state's is
discarded: it never marks a result `current` and raises `RECOMPUTE_DISCARDED`.

### ComparisonSummary
`{ validity: {before, after}, cutSeconds: {before, after, delta}, cost: {before, after, delta, status},
risk: {byCategory: {before, after}} }`. A figure that is outdated or unavailable on either side is
reported as `null` with a notice, never as a number.

## Risk module

### CutRiskProfile (caller supplied)
| Field | Rule |
|---|---|
| `geometryUnitsPerMeter` | finite, > 0, required for every rule |
| `speeds` | `{ cutting?, rapid?, pierceDwellSeconds? }` as in the cost model (m/min, m/min, s) |
| `heat?` | `{ radius?, windowSeconds?, maxCutLength? }` meters, seconds, meters, each > 0 |
| `web?` | `{ minimum? }` meters > 0 |
| `loosePart?` | `{ maxArea? }` square meters > 0 |
| `headStrike?` | `{ clearance? }` meters > 0 |
| `criticalFactor?` | number > 1; absent means findings are never graded `critical` |
| `source?` | text naming where the limits come from, copied into the report |

A value marked `estimated: true` raises an `ESTIMATED_LIMIT` info notice, as in 008.

### RiskFinding
| Field | Rule |
|---|---|
| `category` | `heat` \| `thin-web` \| `loose-part` \| `head-strike` |
| `severity` | `warning` \| `critical` |
| `sheetId`, `partKey?`, `otherPartKey?` | location |
| `actionIndex?`, `planSeconds?` | moment in the cut sequence |
| `region?` | `{ x, y, radius }` for heat |
| `measured`, `limit`, `unit` | numbers with their SI unit |
| `message` | pt_BR reason with the numbers |
| `mitigation` | pt_BR suggestion, never applied |

### RiskReport
`{ status: 'assessed' | 'partial' | 'unavailable', indicative: true, findings, rules: [{ category,
assessable, missing: string[] }], freedMoments, notices, profileDigest, digest }`.
`status` is `partial` when at least one rule is not assessable; `unavailable` when the profile is invalid
or the plan has no actions. `digest` is the SHA-256 of the canonical report without the digest field.

### FreedMoment
`{ sheetId, partKey, actionIndex, planSeconds, held: boolean, loose: boolean, area }`.

### HeatView (on demand)
`heatAt(report-input, sheetId, planSeconds) -> { cells: [{ x, y, size, value }], max }` where `value` is
the windowed cut length divided by `heat.maxCutLength` (above 1 is over the limit). Cells with value 0
are omitted.

## Terminology

Spec *Edit Session* is `EditState`; spec *Technology Profile (risk limits)* is `CutRiskProfile`.

## Review integration

### ReviewOverlay
`{ ghost?: { outline, valid, violations }, heat?: HeatView, freed?: partKeys[], markers?: [{ id,
category, severity, x, y }], selection? }`. Drawn by every renderer that implements `overlay`; cues use
outline pattern and text as well as colour.

### EditPanelState (controller state, additive)
`{ mode: 'off' | 'edit', activePart: string | null, candidate: PartEdit | null, verdict:
PlacementVerdict | null, freshness, planVisible, canUndo, canRedo, riskStatus }`. `planVisible` is false
from the first confirmed edit until the plan is recomputed; the scene is then built without the cut plan.
