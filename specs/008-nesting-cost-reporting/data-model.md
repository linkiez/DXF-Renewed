# Nesting Cost Reporting Data Model

All entities are immutable value objects. Geometry stays unitless. Money is held as integers of the
smallest unit of the report's currency ("minor units"). Nothing is persisted.

## `CostRequest`

| Field | Type | Rules |
|---|---|---|
| `artifact` | `ErpNestingArtifact` | Required. Must have a supported `contractVersion` and a layout, else the report is `unavailable`. |
| `layout` | `CutLayout \| undefined` | Optional. Supplies part shapes (net area) and contour to part links. |
| `cutPlan` | `CutPlanResult \| undefined` | Optional. `plans` is used when present, else `plan`. |
| `costModel` | `CostModel` | Required. |

## `CostModel`

| Field | Type | Rules |
|---|---|---|
| `contractVersion` | `number` | Positive integer; `1` is the only supported version. |
| `currency` | `{ code: string; minorUnitDigits: number }` | `code` three upper-case letters; `minorUnitDigits` integer in `[0, 4]`. One currency per report. |
| `geometryUnitsPerMeter` | `number` | Finite and greater than zero (for example `1000` for millimetres). |
| `material.fullSheet` | `Record<string, Estimable<number>>` | Price of one full sheet per stock id, in major units; `>= 0`. |
| `material.remnant` | `Record<string, Estimable<number>>` | Caller-supplied value of one remnant per stock id, in major units; `>= 0`. |
| `speeds.cutting` | `Estimable<number> \| undefined` | Meters per minute; `> 0`. |
| `speeds.rapid` | `Estimable<number> \| undefined` | Meters per minute; `> 0`. |
| `speeds.pierceDwellSeconds` | `Estimable<number> \| undefined` | Seconds per pierce; `>= 0`. |
| `rates.cuttingPerHour` | `Estimable<number> \| undefined` | Major units per hour; `>= 0`. |
| `rates.travelPerHour` | `Estimable<number> \| undefined` | Major units per hour; `>= 0`. |
| `rates.piercePerUnit` | `Estimable<number> \| undefined` | Major units per pierce; `>= 0`. |
| `rates.labourPerHour` | `Estimable<number> \| undefined` | Major units per hour; `>= 0`. |
| `handling.secondsPerSheet` | `Estimable<number> \| undefined` | Seconds; `>= 0`. |
| `handling.secondsPerJob` | `Estimable<number> \| undefined` | Seconds; `>= 0`. |
| `consumables` | `Consumable[]` | Each id unique. |

`Estimable<T>`: `{ value: T; estimated?: boolean }`. Monetary values (`material.*`, `rates.*`, consumable `cost`) are `Money`: `Estimable<number>` plus an optional `currency` code; a `currency` different from `currency.code` of the model is rejected with `MIXED_CURRENCY`. A value marked `estimated: true` is used and makes
every component that depends on it `estimated`. An absent optional field is not the same as zero: it
makes the components that need it `incomplete`. A zero value is valid and yields a zero amount.

`Consumable`: `{ id: string; cost: Estimable<number>; life: Estimable<{ unit: 'pierces' | 'cuttingSeconds'; amount: number }> | undefined }`,
`cost >= 0`, `life.amount > 0`. A missing `life` makes the consumable component `incomplete`.

## `PartUsage` (internal)

One per placed part (`key` = `shapeId#instanceIndex`, the same key as the review).

| Field | Type | Rules |
|---|---|---|
| `key`, `shapeId`, `instanceIndex`, `sheetId` | | From the resolved placement. |
| `netArea` | `number` | When the layout is supplied: the sum over the part's contours of `+Math.abs(area)` for the contour with `isOuter` true and `-Math.abs(area)` for every other contour (the sign stored in `NestableShape.area` is never relied on, because drawings may store hole areas as positive numbers); else the area of the placed outline, with an info notice `AREA_WITHOUT_HOLES`. A part whose net area is not greater than zero gets `PART_WITHOUT_AREA`. |
| `cutLength`, `travelLength` | `number` | Sums of the linked cutting-like and rapid actions, in geometry units. |
| `pierceCount` | `number` | Linked pierce actions. |
| `cuttingSeconds`, `travelSeconds`, `pierceSeconds` | `number \| null` | `null` when the speed or dwell it needs is missing. |

Actions that cannot be linked to a part are accumulated per sheet as unallocated usage and raise
`UNLINKED_ACTION` or `UNKNOWN_PART` (same codes as the review).

Material share rule: the price of a sheet is distributed over its placed parts in proportion to net area;
parts without positive net area receive no share, except that when **no** placed part of the sheet has a
positive net area the price is split equally among the placed parts of that sheet, so a sheet with parts
is always fully charged.

## `CostComponent`

| Field | Type | Rules |
|---|---|---|
| `status` | `'complete' \| 'estimated' \| 'incomplete'` | See status rules. |
| `amount` | `number \| null` | Integer minor units; `null` exactly when `status` is `incomplete`. |
| `reasons` | `string[]` | Stable codes of the missing or estimated inputs (for example `MISSING_RATE:cuttingPerHour`, `ESTIMATED:speeds.cutting`). Empty when `complete`. |

Categories, in this fixed order: `material`, `cutting`, `pierce`, `travel`, `consumable`, `labour`.

## `CostTotal`

`{ status; amount: number | null; partialSubtotal: number }`. `amount` is the sum of the six components
and is `null` when any is `incomplete`; `partialSubtotal` is always the sum of the components that have
an amount.

## `CostBreakdown`

| Field | Type | Rules |
|---|---|---|
| `job` | `{ components: Record<Category, CostComponent>; total: CostTotal }` | Component amounts equal the sum of the part amounts (FR-002, SC-001). |
| `sheets` | `{ sheetId; kind: 'sheet' \| 'remnant'; components; total }[]` | Material for a sheet is priced as full sheet or remnant (FR-003). |
| `parts` | `{ key; shapeId; instanceIndex; sheetId; usage; components; total }[]` | Artifact order. |
| `partTypes` | `{ shapeId; quantity; components; total }[]` | The copies of one part type added up. |
| `distributed` | `{ category; scope: 'sheet' \| 'job'; scopeId?: string; amount: number }[]` | Every amount that had no owner part (unlinked actions, handling per sheet and per job) and was distributed over the parts of its scope; integer minor units; empty when nothing was distributed. Makes the distribution visible at job level (spec edge cases). |

## `ProductionReport` (part of `CostReport`)

| Field | Type | Rules |
|---|---|---|
| `sheetsUsed` | `number` | Sheets with at least one placed part. |
| `yield`, `wasteArea`, `totalArea` | `number` | Exactly as supplied by the artifact. |
| `time` | `{ job, sheets }` | Seconds by category (cutting, travel, pierce, handling, total) for the job and each sheet; `null` for an incomplete time. |
| `unplaced` | `{ itemId; quantity; reasonCode; reason }[]` | Copied from the artifact; never charged (FR-011). |

## `CostReport`

| Field | Type | Rules |
|---|---|---|
| `contractVersion` | `number` | `1`. |
| `status` | `'complete' \| 'estimated' \| 'incomplete' \| 'unavailable'` | `unavailable` when no report can be built (FR-017). |
| `correlation` | `ErpCorrelation` | From the artifact. |
| `artifactDigests` | `{ input: ErpDigest; output: ErpDigest }` | From the artifact. |
| `costModelDigest` | `ErpDigest` | SHA-256 of the canonical cost model. |
| `currency` | `{ code; minorUnitDigits }` | From the model. |
| `breakdown` | `CostBreakdown \| null` | `null` when `unavailable`. |
| `production` | `ProductionReport \| null` | `null` when `unavailable`. |
| `notices` | `CostNotice[]` | Ordered by severity then by code then by part key. |
| `reportDigest` | `ErpDigest` | SHA-256 of the canonical report without this field. |

An artifact that does not pass the ERP artifact schema has no correlation or digests to report, so it does
not produce a report: the flow rejects, like the ERP nesting flow. There is therefore no
`INVALID_ARTIFACT` notice.

`CostReport` is the serializable artifact of the spec's "Production Report" and "Cost Breakdown":
`breakdown` is the Cost Breakdown and `production` is the Production Report.

## `CostNotice`

| Field | Type | Rules |
|---|---|---|
| `severity` | `'info' \| 'warning' \| 'error'` | |
| `code` | `string` | Stable. |
| `message` | `string` | Specific and actionable; Brazilian Portuguese when produced here, as received when copied from the artifact. |
| `component`, `sheetId`, `partKey` | optional | Where it applies. |

Codes: `UNSUPPORTED_CONTRACT_VERSION`, `NO_LAYOUT`, `NO_CUT_PLAN`,
`INVALID_COST_MODEL`, `MISSING_RATE`, `MISSING_SPEED`, `MISSING_DWELL`, `MISSING_CONSUMABLE_LIFE`,
`MISSING_SHEET_PRICE`, `MIXED_CURRENCY`, `ESTIMATED_INPUT`, `UNLINKED_ACTION`, `UNKNOWN_PART`,
`PART_WITHOUT_AREA`, `PART_WITHOUT_CUTTING`, `AREA_WITHOUT_HOLES`, `UNALLOCATED_DISTRIBUTED` (its message states component, scope and amount),
`UNPLACED_NOT_CHARGED`, `PLAN_SHEET_MISSING`, `PLACEMENT_SHEET_UNRESOLVED`.

## `CostTables` (export)

Two tables, each `{ columns: string[]; rows: (string | number | null)[][] }`, plus `toCsv` text per table.
The columns are fixed in `contracts/cost-reporting-api.md`.

## Status rules

1. A component is `incomplete` if any input it needs is absent; it has `amount = null` and one reason per
   missing input.
2. Otherwise it is `estimated` if any input it used is marked `estimated: true`, with one reason per
   estimated input; else `complete`.
3. A total is `incomplete` if any component is; else `estimated` if any component is; else `complete`.
4. A report is `unavailable` only when no breakdown can be built; otherwise it takes the status of the
   job total.
5. Statuses depend only on the inputs, never on the amounts.

## Reconciliation rules

1. For every component, the job amount is the rounded sum of the exact part amounts.
2. Part amounts of that component are integers produced by largest-remainder apportionment of the job
   amount over the exact part amounts; ties go to the earlier part in artifact order.
3. A sheet amount is the sum of its parts' amounts; the job amount is the sum of the sheet amounts.
4. An `incomplete` component is not apportioned for any part (all `null`).
