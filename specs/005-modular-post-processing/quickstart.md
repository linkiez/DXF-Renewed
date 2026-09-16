# Quickstart: Modular Laser and Plasma Post-Processing

## Prerequisites

- Node.js 18 or newer
- Yarn 4.12.0
- Repository dependencies installed

## Run the quality gates

```bash
yarn type-check
yarn lint
yarn test:unit
git diff --check
```

All commands must pass before the feature is considered complete.

## Validate processor selection

Create a machine profile with an explicit `processorId`, `processorRevision`, and
`profileRevision`. Generate a program from the same valid `CutPlan` for one laser profile and one
plasma profile, plus the approved Hypertherm EDGE Connect profile
(`edge-connect`, `809550-rev6`).

Verify:

- both results contain rendered G-code;
- each result identifies its processor and profile revisions;
- the laser and plasma outputs use their independent approved process behavior;
- the EDGE Connect output uses the directly supported EIA RS-274D subset from the local Programmer
  Reference Markdown;
- changing the processor identifier or revision to an unknown value returns an explicit issue and
  `releasable: false`.

## Validate release blocking

Use a plan or profile with an invalid feed, missing process setting, unsupported capability, or
out-of-bounds movement.

Verify:

- the result contains a stable validation issue;
- `releasable` is false;
- no API path treats the output as production-ready.

## Validate curve handling

Run a plan containing curved movement against:

1. a profile with arc support;
2. a profile without arc support and a positive approved linearization tolerance;
3. a profile without arc support and no tolerance.

Verify that case 1 emits supported arcs, case 2 emits deterministic linear segments, and case 3 is
rejected explicitly.

## Validate reviewed expected output

Place a reviewed fixture at
`test/resources/gcode/<processorId>/<processorRevision>/<fixture>.nc` and compare it with the
generated result after canonicalization.

Verify that:

- line-ending and trailing-whitespace-only differences do not fail comparison;
- a changed command, number, comment, or command order fails comparison;
- an expected-output mismatch blocks release;
- repeated generation with identical inputs produces byte-identical canonical G-code.

See [the contract](contracts/post-processing.md) and [the data model](data-model.md) for the
public result and validation rules.

## Acceptance evidence

The implementation was validated on 2026-09-16 with:

- `yarn type-check`
- `yarn lint`
- `yarn test:unit` — 430 passing
- `git diff --check`

The targeted quickstart test covers generic laser, generic plasma, EDGE Connect
`809550-rev6`, canonical fixture comparison, and release metadata.
