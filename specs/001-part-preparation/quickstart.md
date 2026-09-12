# Quickstart: Part Preparation

Runnable validation once feature 001 is implemented. See `contracts/preparation-api.ts` and
`data-model.md`.

## Prerequisites

- Node >= 18, `yarn` 4.x (repo `packageManager: yarn@4.12.0`).

## Setup

```bash
yarn install
yarn type-check
```

## Unit tests

```bash
# whole suite
yarn test:unit

# only this feature
npx mocha --require tsx --recursive test/unit/preparation --extensions .ts
```

## Smoke test

Create `smoke.ts` (or run with `npx tsx smoke.ts`) against a fixture in `test/resources/`:

```ts
import { readFileSync } from 'node:fs'
import { prepareParts } from './src/index'

const dxf = readFileSync('test/resources/arrayed-holes.dxf', 'utf8')

const result = prepareParts(dxf, {
  tolerance: 0.01,
  cutWidthAllowance: 0.2, // mm
  minFeatureSize: 0.5,
})

for (const part of result.parts) {
  console.log(part.id, part.outer.depth, part.holes.length, part.islands.length)
}
for (const issue of result.issues) {
  console.log(issue.severity, issue.code, issue.source.handle)
}
```

## Scenario checklist

| # | Scenario | Setup | Expected (maps to) |
|---|---|---|---|
| 1 | Nested classification | concentric closed contours | depth 0 outer, 1 hole, 2 island, 3 hole … (SC-001, SC-006) |
| 2 | Repairable gap | outer ring with gap `<= tolerance` | part produced, `Repair{kind:'gap-close'}`, `GAP_CLOSED` warning (FR-004) |
| 3 | Gap too large | gap `> tolerance` | `OPEN_BOUNDARY` / `GAP_TOO_LARGE` rejection, no part (FR-004) |
| 4 | Open boundary | unclosed polyline | rejection with `source.handle` set (SC-002) |
| 5 | Self-intersection | bow-tie contour | `SELF_INTERSECTION` rejection, 0 auto-repairs (SC-005) |
| 6 | Unit default | omit `unit` | output `unit === 'mm'` (SC-004) |
| 7 | Unsupported unit | `unit: 'in'` | `UNSUPPORTED_UNIT` rejection, no parts (SC-004) |
| 8 | Zero area | coincident points | `ZERO_AREA` rejection (spec edge case) |
| 9 | Determinism | run scenario 1 100× | deep-equal `PrepareResult` each run (SC-003) |

## Pass criteria

- All scenarios produce the stated outcome.
- `yarn test:unit` and `yarn type-check` are clean.
- No persistence side effects; source DXF is never modified.
