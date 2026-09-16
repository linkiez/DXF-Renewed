# Phase 1 — Data Model: Nesting Optimization & GPU Acceleration

The additions are additive against the feature-002 model: existing `NestRequest` / `NestResponse`
shapes keep working, and every new field is optional.

## Optimization Objective (new, request-side)

| Field | Type | Rules |
|-------|------|-------|
| `materialUse` | `number` | finite, >= 0 |
| `travel` | `number` | finite, >= 0 |
| `sheetCount` | `number` | finite, >= 0 |
| `remnant` | `number` | finite, >= 0 |
| (derived) normalized weights | `number` x4 | sum to 1 within `EPSILON` |

Validation: negative, `NaN`, non-finite, or all-zero weights produce an explicit error; no silent
coercion. Normalization divides by the sum when it exceeds `EPSILON`.

## Execution Backend Report (new, response-side)

| Field | Type | Notes |
|-------|------|-------|
| `backend` | `'cpu' \| 'webgpu'` | path actually used |
| `requested` | `boolean` | echo of `acceleration` after defaulting |
| `accelerated` | `boolean` | `backend === 'webgpu'` |
| `fallbackReason?` | `string` | explicit reason when acceleration was not used |
| `timings` | `{ scoringMs: number; totalMs: number }` | measurement only, never a search budget |

## Acceleration Request (new, request-side)

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `acceleration` | `boolean` | `true` | `false` pins the run to the CPU baseline |

## NestRequest / NestResponse (additive)

- `NestRequest` gains optional `objective?: OptimizationObjective` and `acceleration?: boolean`.
- `NestResponse` gains optional `backend?: ExecutionBackendReport`.

Neither change breaks an existing feature-002 caller.

## Constraints & Invariants

- Same `seed` + same input ⇒ identical `placements` and `sheets` on any backend (FR-003/SC-001).
- Every placement is validated by the CPU baseline before being emitted (FR-002/FR-005/SC-002).
- The budget is a count of candidate evaluations derived from the input, never wall-clock
  (Constitution IV).
- Unplaceable parts remain in `unplaced[]` with an explicit reason; the accelerator never drops
  input silently.
- `acceleration: false`, or `true` without an adapter, completes on the CPU baseline and reports the
  selected backend and any fallback reason (SC-003/SC-005).
