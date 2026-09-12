# Phase 1 — Data Model

Entities are the existing `src/nesting/types.ts` types plus the fields the clarified requirements
require. Extensions are marked **new**; nothing is renamed, so existing consumers keep compiling.

## Stock Item (extends `StockSheet`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | **new** — FR-006 reporting and FR-007 tie-breaking |
| `kind` | `'sheet' \| 'remnant'` | **new** — full sheet vs. remnant |
| `width`, `height` | `number` | existing |
| `thickness?`, `material?`, `grainAngle?` | existing | |
| `holes?` | `NestableShape[]` | **new** — inner contours; FR-001 edge clearance applies to these |

Validation: `width > 0`, `height > 0`; `id` unique per job; a hole must be strictly inside the
sheet boundary. A `kind: 'remnant'` item whose bounding-box area is below the caller-supplied
`remnantThreshold` is excluded before search (FR-008); no implicit default applies.

## Part Input (from feature 001 `PreparedPart`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | existing |
| geometry | `Point2D[]` outer + holes (`CompoundShape`) | existing |
| `allowedRotations` | `number[]` | existing on `NestableShape`; default `DEFAULT_ALLOWED_ROTATIONS` |
| `grainLocked?` | `boolean` | **new** — restricts rotation to grain-aligned subset (FR-004) |
| `grainAngle?` | `number` | **new** — declared grain direction in degrees; required when `grainLocked` is true (FR-004) |
| `quantity` | `number` | **new** — a part may be requested more than once (FR-006, scenario 3) |

## Placement (extends `Placement`)

| Field | Type | Notes |
|-------|------|-------|
| `shapeId` | `string` | existing |
| `sheetId` | `string` | **new** — which stock item (FR-006) |
| `x`, `y`, `rotation` | `number` | existing |
| `instanceIndex` | `number` | **new** — distinguishes repeated quantity |
| `bbox`, `transformedVertices?` | existing | |

Invariant: `rotation ∈ allowedRotations(part)`; no instance has scale applied.

## Unplaced Part

| Field | Type | Notes |
|-------|------|-------|
| `shapeId` | `string` | |
| `quantity` | `number` | **new** — requested but not placed |
| `reason` | `string` | **new** — explicit non-placement reason (scenario 3) |

Extends `NestingResult.unplacedShapes`, which today carries no reason or quantity.

## Nesting Result (extends `NestingResult`)

Existing: `placements`, `compoundPlacements?`, `sheets`, `unplacedShapes`, `utilization`,
`wasteArea`, `totalArea`, `shapesTotalArea`, `sheetCount`.

**new**: `unplaced: UnplacedPart[]`, `edgeClearance: number`, `partToPartClearance: number`,
`budget: { iterations: number }`, `seed: number`.

`unplacedShapes` remains for legacy consumers that only count misses. `unplaced` is the reporting
surface: it carries the requested quantity and an explicit reason per part. The two MUST agree in
count — every element of `unplacedShapes` has a corresponding `unplaced` entry.

## Clearances

| Field | Type | Notes |
|-------|------|-------|
| `edgeClearance` | `number` | instance vs. outer edge and vs. hole contours |
| `partToPartClearance` | `number` | instance vs. instance |

Both absolute distances in the same unit as the input geometry.

## Invariants

1. Every placement satisfies `edgeClearance` against the outer edge and every hole contour.
2. Every pair of placed instances is separated by at least `partToPartClearance` (FR-002).
3. Sum of placed quantities plus unplaced quantities equals requested quantity per part.
4. `rotation ∈ allowedRotations`; for a grain-locked part `rotation` aligns with `grainAngle`
   modulo 180°; no scaling transform exists in the placement path.
5. Same input plus same seed produces identical placements (FR-007).
6. Material use = placed part area / consumed stock area; on the benchmark fixture ≥ 85% (SC-003).
7. A `kind: 'remnant'` item is absent from `sheets` when its bounding-box area is below
   `remnantThreshold` (FR-008).
