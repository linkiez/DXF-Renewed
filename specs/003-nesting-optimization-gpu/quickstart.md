# Quickstart / Validation — Nesting Optimization & GPU Acceleration

Runnable scenarios that prove the feature end-to-end. Types and fields referenced below are defined
in [contracts/nesting-api.ts](./contracts/nesting-api.ts) and [data-model.md](./data-model.md); this
file is a validation guide, not implementation code.

## Prerequisites

- Node.js >= 18, `yarn install` already run.
- No WebGPU hardware is required. On a machine without `navigator.gpu`, every scenario must still
  pass on the CPU baseline.

## Commands

```bash
npm run type-check
npm run test:unit
npm run test:integration:node
```

## Scenario 1 — Cross-backend determinism (FR-003 / SC-001)

Nest the reference job (100 parts / 5 sheets, feature 002) twice with the same seed, once with
`acceleration: false` and once with `acceleration: true`, and compare the serialized `placements`
and `sheets`.

- **Expected**: byte-identical geometry and metrics across both runs, on any machine.

## Scenario 2 — Weight validation and normalization (FR-001)

Submit an objective with a negative, `NaN` or all-zero weight.

- **Expected**: an explicit error reason; no silent coercion, no partial result.
- Submit four valid weights and confirm they are normalized to sum 1 within `EPSILON`.

## Scenario 3 — Transparent fallback (FR-006 / SC-003 / SC-005)

Run with `acceleration: true` on a machine without a WebGPU adapter.

- **Expected**: the job completes on the CPU baseline; `backend.backend === 'cpu'`,
  `backend.requested === true`, and `backend.fallbackReason` is populated.

## Scenario 4 — Explicit opt-out (FR-004)

Run with `acceleration: false`.

- **Expected**: `backend.backend === 'cpu'`, `backend.requested === false`, and no adapter probe is
  attempted.

## Scenario 5 — Performance gate (SC-004)

On a machine with a working WebGPU adapter, run the reference job with the baseline and with
acceleration.

- **Expected**: the accelerated path is at least 2x faster; the baseline run stays under 2 s.
  Where no adapter is present, record the measurement as skipped — the baseline is still the only
  required path.

## Scenario 6 — Placement validity (FR-002 / SC-002)

Validate every accelerated result with the existing placement validator.

- **Expected**: zero overlaps, clearances respected, every unplaced part carries an explicit reason.
