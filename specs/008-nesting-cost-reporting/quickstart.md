# Nesting Cost Reporting Quickstart

## Prerequisites

- Node.js 18 or newer; dependencies installed with `yarn install`.
- The reference fixtures: the seeded 500-part job of `test/unit/nesting/review/fixtures.ts`
  (`referenceFixture`) and the real drawings in `test/resources/nest-fixtures`.

## Focused validation

```bash
yarn test:unit                 # includes test/unit/nesting/cost/ and test/unit/nesting/linking/
yarn test:integration:node     # includes test/integration/nesting/costRealParts.test.ts
```

The feature tests must cover (contract: `contracts/cost-reporting-api.md`, entities: `data-model.md`):

1. All six components for every part and the job; parts add up exactly to the job for every component
   and for the total, including rounding residuals (FR-001, FR-002, FR-018, SC-001).
2. Full-sheet and remnant material priced separately by their own values (FR-003).
3. A missing rate, speed, dwell, consumable life or sheet price makes exactly the dependent components
   `incomplete` with a reason, no value is invented, and the total exposes only a partial subtotal
   (FR-004, SC-002).
4. A value marked `estimated` is used and marks the dependent components `estimated` (FR-004).
5. Invalid models (negative or non-numeric rate, life of zero or less, mixed currency) are rejected with
   specific notices (FR-016).
6. Unplaced quantities are not charged and are listed with their reasons (FR-011, SC-005).
7. No cut plan: material is estimated and every cut-dependent component is `incomplete`; no layout,
   rejected artifact or unsupported version: `unavailable` with a specific notice (FR-017).
8. Time per part, sheet and job from lengths, counts, speeds and dwell, with action `feed` and `dwell`
   metadata taking precedence over model values (FR-008).
9. Consumable cost per use by pierces and by cutting seconds (FR-009); labour from machine and handling
   time (FR-010).
10. Report carries correlation, both artifact digests, the cost model digest and its own digest
    (FR-013, SC-003).
11. 100 consecutive reports for the same inputs are identical, digests included (FR-014, SC-004).
12. The tabular export has the documented columns and number format and reproduces the totals when read
    back (FR-015, SC-007).
13. Frozen inputs are unchanged after the calculation (FR-006, SC-008).
14. Real drawings from `test/resources/nest-fixtures` nest, plan and cost without unlinked actions.
15. The `review` unit suites still pass after the linking extraction (no behavior change).

## Repository gates

```bash
yarn type-check
yarn lint
yarn test:unit
yarn quality:gate
```

## Acceptance scenarios

Build the seeded reference job and a complete cost model; request the report and check the totals,
status `complete`, the digests and the CSV round trip. Remove one rate, one speed and the consumable
life and check each dependent component becomes `incomplete` while the others keep their amounts. Mark
the cutting speed as estimated and check `estimated` propagates.

## Performance measurement

SC-006: from the call to `buildCostBreakdown` plus the digests until the report is emitted, for the
500-part reference job, five runs in Node on the reference machine, worst case under 1 second; record
the processor model and core count (the calculation uses no graphics).

## Measured acceptance evidence

Recorded here during implementation (date, environment, worst case) and linked from `tasks.md`.

### SC-006 (2026-11-16)

- Environment: Node.js v24.20.0, Intel Core i9-12900K, 24 logical cores, Linux x86_64.
- Procedure: five consecutive `calculateCostReport` runs on the seeded 500-part reference job
  (`referenceFixture`, 5,001 actions), from the call to the emitted report with all digests.
- Result: 37, 19, 20, 18 and 21 ms; worst 37 ms (threshold 1,000 ms).

### Success criteria coverage (2026-11-16)

| Criterion | Evidence |
|---|---|
| SC-001 | `buildCostBreakdown.test.ts` and `apportion.test.ts`; the 500-part reference job and the real drawings reconcile |
| SC-002 | `componentAmounts.test.ts` and `buildCostBreakdown.test.ts` (status tests) |
| SC-003 | `calculateCostReport.test.ts` (correlation and artifact digests) |
| SC-004 | `calculateCostReport.test.ts` (100 identical reports) |
| SC-005 | `buildCostBreakdown.test.ts`, `buildProductionReport.test.ts` and `calculateCostReport.test.ts` (unplaced items) |
| SC-006 | `calculateCostReport.test.ts` (under 1 s) and the measurement above |
| SC-007 | `costReportToCsv.test.ts` (read back and summed) |
| SC-008 | `buildCostBreakdown.test.ts` and `calculateCostReport.test.ts` (deeply frozen inputs unchanged) |

Real drawings: `test/integration/nesting/costRealParts.test.ts` costs the `LPEL-*.dxf` drawings with no
unlinked action.
