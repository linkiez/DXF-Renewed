# Quickstart — validating True-Shape Nesting

## Prerequisites

```sh
npm ci
```

The feature has no runtime dependency of its own; everything used already ships in the repo.

## Static checks

```sh
npm run type-check    # contracts and src compile under strict TS
npm run lint
```

## Unit and integration

```sh
npm run test:unit         # geometry, clearance and budget logic
npm run test:integration  # end-to-end nesting over DXF fixtures
npm run validate:fixtures # fixture set stays well-formed
```

## Scenario 1 — irregular parts fit without overlap (FR-001, FR-002, SC-001)

Nest a set of irregular contours onto one sheet with distinct edge and part clearances. Verify
every placement is in bounds at the edge clearance, including against hole contours, and that no
two instances are closer than the part clearance. `unplaced` is empty.

## Scenario 2 — global yield, deterministic tie-break (FR-005, FR-007)

Nest the same job twice with the same seed over multiple sheets and remnants. Verify the two
results are identical, and that a layout with better total material use is preferred over a
greedy per-part choice. Change only the seed and verify the run is still self-consistent.

## Scenario 3 — rotation and grain (FR-004)

Nest a grain-locked part with a permitted list containing non-aligned angles. Verify only
grain-aligned angles appear in `placements[].rotation`, and that the part's dimensions are never
scaled to fit.

## Scenario 4 — non-fitting part reports a reason (scenario 3, FR-006)

Nest a part larger than every stock item. Verify it appears in `unplaced` with its requested
quantity and a non-empty `reason`, and that no exception is thrown.

## Scenario 5 — performance and yield floors (SC-002, SC-003)

Run the 100-part / 5-sheet benchmark fixture. Verify the call returns in under 2 seconds and that
material use (placed part area / consumed stock area) is at least 85%. If the deterministic budget
is exhausted below 85%, the budget calibration is the defect — the threshold does not move.

## Contracts and model

See [contracts/nesting-api.ts](./contracts/nesting-api.ts) for the request/result shape and
[data-model.md](./data-model.md) for field-level extensions and invariants.
