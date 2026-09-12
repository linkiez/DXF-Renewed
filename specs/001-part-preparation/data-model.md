# Phase 1 Data Model: Part Preparation

All lengths are canonical millimetres after normalization (FR-009). Types live in
`src/nesting/pro/types.ts`; the public contract is `contracts/preparation-api.ts`.

## SourceRef

Traceability back to the drawing (FR-002).

| Field | Type | Notes |
|---|---|---|
| `handle` | `string` | DXF entity handle; stable identity of the source |
| `layer` | `string` | entity layer |
| `entityType` | `string` | e.g. `LWPOLYLINE`, `CIRCLE` |

## Contour (raw, internal)

Produced by `partPrep/extract.ts`.

| Field | Type | Notes |
|---|---|---|
| `source` | `SourceRef` | |
| `vertices` | `[number, number][]` | open ring as extracted (not yet closed) |
| `closed` | `boolean` | DXF closure flag / chain actually closed |
| `unit` | `'mm'` | after R2 normalization |

## Boundary

A closed contour that carries classification (FR-001, FR-011).

| Field | Type | Notes |
|---|---|---|
| `classification` | `'outer' \| 'hole' \| 'island'` | parity of `depth` |
| `depth` | `number` | `0` outer, odd hole, even `≥ 2` island; unlimited |
| `source` | `SourceRef` | |
| `vertices` | `[number, number][]` | closed ring, first point repeated at the end |
| `area` | `number` | signed magnitude, mm² |
| `perimeter` | `number` | mm |
| `bbox` | `BBox` | `{minX,minY,maxX,maxY}` |

**Rules**: `depth === 0` ⇒ `outer`; odd ⇒ `hole`; even `≥ 2` ⇒ `island`. A closed contour is never
flattened, merged or rejected for depth alone (SC-006). Zero-area boundary ⇒ `ZERO_AREA` rejection.
A remaining self-intersection ⇒ `SELF_INTERSECTION` rejection (FR-010).

## Repair / Warning records

| Field | Type | Notes |
|---|---|---|
| `Repair.kind` | `'gap-close' \| 'orientation'` | only automatic repairs allowed (FR-004) |
| `Repair.source` | `SourceRef` | |
| `Repair.detail` | `string` | e.g. gap distance |
| `Warning.code` | `'MIN_FEATURE' \| 'MIN_AREA' \| 'ORIENTATION_REPAIRED' \| 'GAP_CLOSED'` | FR-006 |
| `Warning.source` | `SourceRef` | |

## PreparedPart

One per depth-0 contour.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | stable, derived from the outer `SourceRef.handle` |
| `outer` | `Boundary` | |
| `holes` | `Boundary[]` | odd depth, attached to nearest depth-0 ancestor |
| `islands` | `Boundary[]` | even depth `≥ 2`; each keeps its `depth` |
| `bbox` | `BBox` | combined part extent |
| `area` | `number` | net area: outer − holes + islands |
| `repairs` | `Repair[]` | |
| `warnings` | `Warning[]` | |

## PreparationIssue

| Field | Type | Notes |
|---|---|---|
| `code` | `'OPEN_BOUNDARY' \| 'SELF_INTERSECTION' \| 'ZERO_AREA' \| 'GAP_TOO_LARGE' \| 'UNSUPPORTED_UNIT' \| 'UNSUPPORTED_ENTITY'` | |
| `severity` | `'rejection' \| 'warning'` | |
| `source` | `SourceRef` | affected geometry (FR-002) |
| `depth` | `number?` | when the contour had already been classified |
| `detail` | `string` | human-readable, e.g. the open endpoints |

## PrepareOptions

| Field | Type | Notes |
|---|---|---|
| `unit` | `string?` | `mm` only; absent ⇒ `mm`; other ⇒ `UNSUPPORTED_UNIT` (FR-008) |
| `tolerance` | `number` | gap-close + simplification tolerance, in the request unit |
| `cutWidthAllowance` | `number` | total kerf, in the request unit (FR-005) |
| `minArea` | `number?` | warning threshold |
| `minFeatureSize` | `number?` | warning threshold (FR-006) |

## PrepareResult

| Field | Type | Notes |
|---|---|---|
| `parts` | `PreparedPart[]` | sorted by `(outer.source.handle)` |
| `issues` | `PreparationIssue[]` | sorted by `(source.handle, code)` |
| `unit` | `'mm'` | canonical output unit |

**Invariant (SC-003 / FR-007)**: identical `(dxf, options)` ⇒ deep-equal `PrepareResult`.

## State transitions

None persisted. Per contour: `raw → (unit normalize) → (gap close) → (close ring) → (simplify) →
(winding normalize) → (classify depth) → (cut-width offset)`. A failure at any step emits an issue
and drops that contour; the remaining contours still produce parts.
