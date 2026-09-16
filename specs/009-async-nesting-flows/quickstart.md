# Quickstart: Async Nesting Flows (feature 009)

Validation guide only. Contracts live in
[`contracts/nesting-observable-api.ts`](./contracts/nesting-observable-api.ts); entity rules in
[`data-model.md`](./data-model.md). This file says how to prove the feature works.

## Prerequisites

- Node.js `>=18`; `rxjs@^7.8.2` in `dependencies`; `package.json` at `8.0.0`.
- `yarn install` already run.
- `npm run type-check` passes on the current tree.

## Validation scenarios

### 1. Observable surface (US1, FR-001, FR-011, SC-001, SC-007)

For each of `nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`,
`NestingHelper.nest`, `nestTrueShape`, `prepareParts`:

- call the flow and assert the return value is an RxJS `Observable` (has `subscribe`, is not a
  `Promise`);
- assert no pipeline work runs before `subscribe` (SC-007);
- `subscribe`, collect notifications, assert exactly one `next` then `complete`, no `error`;
- `subscribe` again on the same Observable; assert the pipeline re-runs and emits an identical
  result for the same input and seed (FR-011, SC-008).

### 2. Baseline parity (US2, FR-002, SC-002)

- Freeze the pre-change outputs (`7.7.6`) for the enumerated reference job set (see `spec.md`
  Assumptions) into `test/integration/nesting/fixtures/` — `parsed-dxf-simple`, `raw-dxf-preset`,
  `true-shape-mixed`, `part-prep-boundary`, seed `20260101` — before touching any flow.
- Run the same jobs through the Observable surface, take the single emission, diff placements,
  `unplaced`/`issues` reasons and metrics. Expected: zero mismatches (SC-002).
- Excluded from comparison: `processingTimeMs` and `backend.timings` (measurement only).

### 3. Determinism (FR-003, SC-003)

- Run every in-scope flow twice with identical input and seed and diff the emissions.
- Inspect each flow for wall-clock search bounds; expected: none (SC-003). `processingTimeMs` and
  `backend.timings` are measurement only and must not affect placement decisions.

### 4. Silent cancellation (US3, FR-007, SC-006)

- Start a flow, `unsubscribe` before completion, record all notifications. Expected: none — no
  `next`, no `complete`, no `error`.
- Run a fresh flow afterwards and assert its result matches the no-cancellation baseline.

### 5. Explicit outcomes, never errors (FR-004, FR-008, FR-009, SC-005)

- Feed input with unplaceable items; assert each affected item is returned with a specific reason
  and the Observable **completes** instead of erroring.
- Request acceleration where WebGPU is unavailable; assert completion on the baseline path with
  the fallback reason in the result, no error.
- Trigger a programmer/contract violation; assert an `error` notification with a descriptive
  message.

### 6. Input immutability (FR-006)

- Pass frozen input objects to every in-scope flow; assert the call site succeeds and inputs are
  structurally unchanged after emission.

### 7. Shared state after teardown (FR-007, SC-006)

- Run `nest`/`nestFromDxf` to completion, then call `resetNestingState()` and assert the next flow's
  result matches the baseline (no residue from the previous run).
- Subscribe, `unsubscribe` mid-flight, then run a fresh flow and assert its result is the baseline
  result.

## Commands

```bash
npm run type-check
npm run lint
npm run test:unit
npm run test:integration:node
```

## Expected outcome

All seven scenarios pass, the migrated call sites (including the 22 existing test files now bridging
with `firstValueFrom`) keep the suite green (SC-004), and `rxjs` is the only new runtime dependency —
recorded in
[`.specify/adr/ADR-0001-observable-nesting-surface.md`](../../.specify/adr/ADR-0001-observable-nesting-surface.md).

## Validation record

- Scenarios 1–7: passed through the Observable unit and Node integration suites.
- `yarn type-check`: passed.
- `yarn lint`: passed.
- `yarn test:unit`: passed.
- `yarn test:integration:node`: passed.
- `yarn test:integration:browser`: blocked by the existing browser bundle configuration
  resolving Node built-ins (`node:crypto`, `node:module`, `node:url`, and `node:path`) for the
  browser target; no browser assertions were executed.
