# Cut-Path Planning Data Model

## `CutLayout`

The immutable planning input for one or more nested sheets.

| Field | Type | Rules |
|---|---|---|
| `sheets` | `StockItem[]` | Each sheet has a stable `id`, positive dimensions and optional material metadata. |
| `contours` | `CutContour[]` | Ordered input sequence used as the SC-002 baseline. |
| `startPoint` | `Point2D` | Optional deterministic origin; defaults to the sheet origin when omitted. |

## `CutContour`

Associates an existing nesting shape with a completed placement.

| Field | Type | Rules |
|---|---|---|
| `id` | `string` | Unique within the layout. |
| `partId` | `string` | Stable part identity used for grouping and traceability. |
| `sheetId` | `string` | Must reference a sheet in `CutLayout.sheets`. |
| `shape` | `NestableShape` | Reuses the existing public nesting geometry type. |
| `placement` | `Placement` | Provides the sheet position and rotation. |
| `parentContourId` | `string \| undefined` | Links an inner contour to its associated outer contour. |
| `isOuter` | `boolean` | Outer contours are sequenced after associated inner contours. |

## `CutProcessProfile`

The process rules used to create actions and validate geometry.

| Field | Type | Rules |
|---|---|---|
| `sequence` | `SequenceOptions` | Stable strategy and input-derived search budget. |
| `lead` | `LeadSpec` | Lead type, length, angle and placement rule. |
| `pierce` | `PierceSpec` | Pierce clearance and small-hole rule. |
| `tabs` | `TabSpec` | Optional tab width, count and placement constraints. |
| `overcut` | `OvercutSpec` | Optional closure extension. |
| `clearance` | `ClearanceRules` | Minimum distance from contours, tabs and kept material. |
| `commonLine` | `CommonLineOptions` | Opt-in shared-edge cutting with geometric validation. |

All distances use the unitless geometry convention already used by nesting. A future unit-bearing
profile may be added additively; mixed-unit arithmetic is not permitted.

## `CutAction`

An ordered, machine-independent operation aligned with the post-processor contract:

`rapid`, `pierce`, `lead-in`, `cut`, `lead-out`, `overcut`, `tab`, or `end`.

Actions contain ordered `Point2D[]`, optional contour/part references, and process metadata. They
must not contain vendor-specific commands.

## `CutPlan`

The generated sequence for a sheet or job:

- `actions`: ordered `CutAction[]`.
- `stats`: cut length, rapid length, pierce count and tab count.
- `sheetId`: stable sheet identity.
- `baselineRapidLength`: rapid distance for the original `CutLayout.contours` order.
- `optimizedRapidLength`: rapid distance for the generated order.

## `CutPathProblem`

An actionable validation result:

- `code`: stable category such as `OUT_OF_BOUNDS`, `RAPID_OVER_PART`,
  `LEAD_CROSSES_GEOMETRY`, `TAB_TOO_WIDE`, `COMMON_LINE_REJECTED` or `ENTRY_INVALID`.
- `severity`: `error` or `warning`.
- `message`: correction-oriented explanation.
- Optional `sheetId`, `partId`, `contourId` and `actionIndex` references.

## `CutPlanResult`

The public planner result:

- `valid`: whether the plan is releasable.
- `plan`: present when a valid plan was generated.
- `plans`: complete plans for every referenced sheet; `plan` remains the first-plan compatibility
  view.
- `problems`: all detected validation problems.
- `metrics`: baseline and optimized rapid distances plus improvement ratio.

Structurally invalid inputs throw explicit errors. Geometric and process validation failures are
returned in `problems`.
