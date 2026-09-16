# Data Model: Async Nesting Flows

This feature introduces **no new domain entities and changes no result fields**. It changes the
*delivery* of existing payloads: each in-scope flow returns an `Observable<T>` instead of a
`Promise<T>`. That constraint is what keeps FR-002/SC-002 (identical results) satisfiable — the
inner pipeline is reused verbatim.

## Layer 1 — Domain result types (unchanged)

Each flow emits exactly one of these per subscription; every field keeps its current meaning.

### `NestingResult` — `src/nesting/types.ts` (flows `nest`, `nestFromDxf`, `NestingHelper.nest`)

| Field | Type | Notes |
|-------|------|-------|
| `placements` | `Placement[]` | Flattened across sheets; order is part of the frozen baseline |
| `compoundPlacements?` | `CompoundPlacement[]` | Optional |
| `sheets` | `StockSheet[]` | Sheets used |
| `unplacedShapes` | `NestableShape[]` | Carried on the emission, never an `error` (FR-004) |
| `utilization` | `number` | Percent 0–100 |
| `wasteArea`, `totalArea`, `shapesTotalArea` | `number` | Areas |
| `sheetCount` | `number` | Sheets used |
| `processingTimeMs` | `number` | **Measurement only**, never a search bound (FR-003) |

### `NestResponse` — `src/nesting/types.ts` (flow `nestTrueShape`)

Picks `placements`, `compoundPlacements?`, `sheets`, `utilization`, `wasteArea`, `totalArea` from
`NestingResult`, plus:

| Field | Type | Notes |
|-------|------|-------|
| `unplaced` | `UnplacedPart[]` | Each carries a `reason` (FR-004) |
| `budget.iterations` | `number` | Deterministic budget actually consumed |
| `seed` | `number` | Echoed for reproducibility |
| `edgeClearance`, `partToPartClearance` | `number` | Echoed so the result is self-describing |
| `backend?` | `ExecutionBackendReport` | Path used, `requested`, `accelerated`, `fallbackReason` (FR-008) |
| `objective?` | `OptimizationObjective` | Normalized objective actually applied |

`ExecutionBackendReport.timings` is measurement only; `fallbackReason` is the FR-008 fallback.

### `NestResult` — `src/nest/types.ts` (flows `nestDXF`, `nestWithPreset`, `quickNest`)

| Field | Type | Notes |
|-------|------|-------|
| `placements` | `NestPlacement[]` | |
| `unplaced` | `NestPart[]` | Explicit, never silently dropped |
| `metrics` | `NestMetrics` | `processingTimeMs`, `gaIterations`, `bestFitness` are measurement |
| `svg()`, `dxf()`, `metricsSummary()` | functions | Part of the **emitted value**; output formatters stay synchronous (FR-001) |

`nestDXF` currently prints `metricsSummary()` to stdout — a side effect of *running*, so it occurs on
`subscribe`, not at the call site.

### `PrepareResult` — `src/nesting/pro/types.ts` (flow `prepareParts`)

| Field | Type | Notes |
|-------|------|-------|
| `parts` | `PreparedPart[]` | |
| `issues` | `PreparationIssue[]` | `code`, `severity: 'rejection' \| 'warning'`, `source`, `detail` — the explicit reason (FR-004) |
| `unit` | `Unit` (`'mm'`) | Resolved unit |

### Flow inventory

| Flow | Current form | Emitted payload |
|------|--------------|-----------------|
| `nest`, `nestFromDxf` (`src/nesting/applyNesting.ts`) | `Promise<NestingResult>` | `NestingResult` |
| `NestingHelper.nest` (`src/nesting/NestingHelper.ts`) | `Promise<NestingResult>` | `NestingResult` |
| `nestTrueShape` (`src/nesting/trueShape/index.ts`) | `Promise<NestResponse>` | `NestResponse` |
| `prepareParts` (`src/nesting/pro/partPrep/index.ts`) | `Promise<PrepareResult>` | `PrepareResult` |
| `nestDXF`, `nestWithPreset`, `quickNest` (`src/nest/index.ts`) | `Promise<NestResult & generators>` | `NestResult` + `svg`/`dxf`/`metricsSummary` |

## Layer 2 — Observable delivery contract (new)

| Property | Rule | Requirement |
|----------|------|-------------|
| Type | RxJS 7 `Observable<T>` | FR-001 |
| Emissions | exactly one `next`, then `complete`; never a partial value | FR-001 |
| `error` | only programmer/contract violations, with a descriptive message | FR-009 |
| Laziness | no pipeline work before `subscribe` | FR-001, SC-007 |
| Coldness | each `subscribe` re-runs; identical result for same input + seed | FR-011, SC-008, SC-002 |
| Cache / multicast | forbidden — no `shareReplay`, no hot `Subject` fan-out | FR-011 |
| Teardown | `unsubscribe` suppresses `next`, `complete` and `error` | FR-007, SC-006 |
| Residual state | none that a later flow could observe | FR-007, SC-006 |

### Subscription state machine (per subscription)

```text
created ──subscribe──▶ running ──pipeline done──▶ next(result) ──▶ complete
                          │
                          └──unsubscribe──▶ torn-down (no notification of any kind)
```

1. `created → running` only on `subscribe`; teardown is registered up front so an unsubscribe can
   interrupt the pipeline at the next stage boundary (cooperative cancellation).
2. `running → next + complete` exactly once.
3. `running → torn-down`: completed work is not emitted; no shared/global state is left behind.
4. `running → error`: only invalid arguments / impossible contracts. Expected outcomes (unplaceable
   items, accelerator fallback) travel as value fields.

## Validation rules

| Requirement | Rule encoded |
|-------------|--------------|
| FR-001 | each flow returns `Observable<T>`; one `next` then `complete`; no work pre-`subscribe` |
| FR-002 | emitted payload equals the 7.7.6 baseline for the same input + seed |
| FR-003 | no `Date.now()`/wall-clock budget inside flows (measurement-only timings allowed) |
| FR-004 | unplaceable items are fields on the emission, never `error` |
| FR-006 | caller input is not mutated |
| FR-007 | teardown emits nothing and leaves no shared state |
| FR-008 | fallback reason survives into the emission |
| FR-009 | `error` reserved for programmer/contract violations |
| FR-010 | `rxjs` declared in `dependencies` (applied: `^7.8.2`) |
| FR-011 | no `share`/`shareReplay`; a new cold Observable per call |

## Frozen baseline (SC-002)

Baseline = the pre-change `7.7.6` promise resolution values: `NestingResult` / `NestResponse` /
`NestResult` / `PrepareResult`, per the inventory above. Only the container changes
(`Promise<T>` → `Observable<T>`); field values stay equivalent for the same input and seed, with
elapsed-time fields (`processingTimeMs`, `backend.timings`) excluded as measurement-only — the same
convention already used by feature 003.
