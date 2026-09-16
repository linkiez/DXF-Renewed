# Cut-Path Planning Quickstart

## Prerequisites

- Node.js 18 or newer.
- Yarn 4.12.0.
- Dependencies installed with `yarn install`.

## Focused validation

Run the unit suite after implementing the feature:

```bash
yarn test:unit
```

The feature-specific tests must cover:

1. Inner contours are emitted before associated outer contours.
2. The selected lead, pierce, tab, overcut and cutting actions are represented.
3. The optimized rapid distance is measured against the original `CutLayout` order.
4. Invalid leads, tabs, rapids and bounds return actionable `CutPathProblem` entries.
5. Invalid common-line candidates are omitted with an explicit validation problem.
6. Identical layout, profile and seed produce identical action order and metrics.

Run the required repository gates:

```bash
yarn type-check
yarn lint
yarn test:unit
```

## Acceptance scenarios

Create a layout with one placed part containing at least one hole and an outer contour, then use a
profile with a lead, pierce rule and tabs. Assert that the returned plan is valid, inner actions
precede the outer contour, all selected action kinds are present, and every action remains within
the referenced sheet.

Create a route that crosses kept material or a lead that crosses a contour. Assert that the result
is invalid and contains a stable problem code plus a correction-oriented message. Do not expect an
exception for these geometric validation outcomes.

Compare the generated rapid distance with the baseline produced from the same layout order,
starting point and distance calculation. The optimized sequence passes only when it improves rapid
distance by at least 20% on the reference plans.

## Measured acceptance evidence

The current reference scenario measures `baselineRapidLength = 326.6833`,
`optimizedRapidLength = 115.9655` and `improvementRatio = 0.6450` (64.50%), exceeding SC-002.
The latest repository run reports `yarn test:unit`: **417 passing**; SC-001 ordering and SC-003
structured-problem assertions pass in the cut-path unit tests.
