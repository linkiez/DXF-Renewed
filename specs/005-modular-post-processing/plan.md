# Implementation Plan: Modular Laser and Plasma Post-Processing

**Branch**: `005-modular-post-processing` | **Date**: 2026-09-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-modular-post-processing/spec.md`

## Summary

Add an additive, deterministic post-processing module that consumes the existing machine-independent
`CutPlan` and emits reviewed laser or plasma G-code. A versioned registry resolves the explicit
processor identifier and revision from the caller's machine profile. Shared validation, curve
linearization, G-code writing, canonicalization, and golden-fixture comparison keep processor
variants independent while blocking release on every validation error or expected-output mismatch.

## Technical Context

**Language/Version**: TypeScript, Node.js >=18, strict compiler settings

**Primary Dependencies**: Existing TypeScript, Mocha + `tsx`, repository nesting geometry utilities;
no new runtime dependencies

**Storage**: Checked-in reviewed G-code fixtures only; no runtime persistence

**Testing**: `yarn type-check`, `yarn lint`, `yarn test:unit`, and golden-file unit tests

**Target Platform**: Node.js library and browser-compatible TypeScript build

**Project Type**: TypeScript library with nesting and CLI surfaces

**Performance Goals**: Deterministic bounded processing; no wall-clock-dependent search or
  unbounded curve conversion. No wall-clock SLA or implicit machine-size limit is defined for this
  feature; budgets must be derived from input size and profile tolerance.

**Constraints**: No network I/O, no caller-input mutation, no silent fallback, no release with any
  validation error, and no new runtime dependency

**Scale/Scope**: Laser and plasma processors over existing `CutPlan` actions; vendor-specific
  dialect breadth is limited to explicitly approved processor variants and fixtures. The first
  vendor processor is Hypertherm EDGE Connect using the verified EIA RS-274D subset in
  `docs/Hypertherm EDGE PRO Programmer reference.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Library-First, Additive Public API**: PASS — add a self-contained post-processing module and
  re-export its public types and operations without changing existing cut-path signatures.
- **II. Reuse Before Rewrite**: PASS — consume `CutPlan`, existing geometry, `EPSILON`, logger, and
  validation conventions; new logic is limited to machine translation and G-code canonicalization.
- **III. Test-First**: PASS — implementation tasks must add failing unit/golden tests before production
  code and use the existing Mocha + `tsx` runner.
- **IV. Determinism and Reproducibility**: PASS — stable registry selection, fixed numeric formatting,
  bounded curve linearization, stable action order, and exact canonical comparison.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: PASS — strict types, no persistence or
  network access, and no package manifest dependency changes.
- **Unit discipline / precision**: PASS — profile units are explicit and geometric comparisons reuse
  `EPSILON`; linearization tolerance is a profile value, not an implicit unit.
- **Silent failure prohibition**: PASS — all expected failures return structured issues and block
  release.
- **Vendor reference integrity**: PASS — EDGE Connect commands are limited to the readable
  Markdown reference and reviewed expected output; unsupported codes remain explicit failures.
- **Documentation gate**: PASS — every new `src/` module has source-adjacent documentation before
  the User Story 1 completion checkpoint.

## Project Structure

### Documentation (this feature)

```text
specs/005-modular-post-processing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── post-processing.md
└── tasks.md                 # created by /speckit-tasks
```

### Source Code

```text
src/nesting/post/
├── types.ts                 # MachineProfile, PostProcessor, MachineProgram, issues
├── registry.ts              # explicit processor/revision registry
├── process.ts               # validate -> normalize -> emit -> compare orchestration
├── validate.ts              # profile, plan, capability, feed, and output checks
├── canonicalize.ts          # deterministic G-code normalization
├── linearize.ts             # approved-tolerance curve flattening
├── gcode/
│   └── writer.ts            # tokenized shared G-code writer
└── processors/
    ├── generic-laser.ts
    ├── generic-plasma.ts
    └── edge-connect.ts

src/nesting/post/index.ts    # feature barrel
src/nesting/post/index.doc.md # source-adjacent public API documentation
src/nesting/index.ts         # public nesting re-exports
docs/nesting/POST-PROCESSORS.md

test/unit/nesting/post/
├── registry.test.ts
├── profile-validation.test.ts
├── linearize.test.ts
├── gcode-writer.test.ts
├── canonicalize.test.ts
├── release.test.ts
├── generic-laser.test.ts
├── generic-plasma.test.ts
├── edge-connect.test.ts
└── quickstart.test.ts

test/resources/gcode/
├── generic-laser/<revision>/
├── generic-plasma/<revision>/
└── edge-connect/809550-rev6/
```

**Structure Decision**: Use a focused `src/nesting/post/` module beside the existing cut-path
planner. The post-processing boundary consumes only `CutPlan` and machine context; processor
variants remain composable and are exposed through the existing nesting barrel.

The EDGE Connect processor is constrained to the directly supported EIA RS-274D subset documented
in `docs/Hypertherm EDGE PRO Programmer reference.md`; later G59, XPR, ESSI, bevel, and advanced
feature support requires separate reviewed tasks and fixtures.

## Phase 0: Research

Completed in [research.md](research.md). The research resolved processor selection, G-code writer
composition, curve linearization, release blocking, canonical comparison, and fixture strategy.

## Phase 1: Design

Completed in [data-model.md](data-model.md), [contracts/post-processing.md](contracts/post-processing.md),
and [quickstart.md](quickstart.md). The design defines immutable input boundaries, explicit
validation states, public operations, deterministic output, and runnable acceptance checks.

## Post-Design Constitution Check

- **Public API and compatibility**: PASS — additive `nesting/post` exports only.
- **Reuse and test-first delivery**: PASS — existing cut-path types/utilities are the sole plan
  boundary; each implementation slice requires a regression or golden test first.
- **Determinism**: PASS — no wall-clock budgets, random selection, or unordered output.
- **Strictness and operational safety**: PASS — exact processor selection, explicit issues, no
  release on errors, no network, and no new runtime dependency.
- **Documentation gate**: PASS — `src/nesting/post/index.doc.md` is required before the story
  checkpoint; no source module is left undocumented.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | The design satisfies all constitution gates. | N/A |
