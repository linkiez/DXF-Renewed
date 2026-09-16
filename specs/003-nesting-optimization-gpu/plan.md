# Implementation Plan: Nesting Optimization & GPU Acceleration

**Branch**: `003-nesting-optimization-gpu` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification `/specs/003-nesting-optimization-gpu/spec.md`

## Summary

Add two additive capabilities to the existing `nestTrueShape` pipeline: (1) a caller-weighted
optimization objective over material use, travel, sheet count and remnant preference, and
(2) optional WebGPU acceleration that is opt-out via an `acceleration` request field, dispatches
fixed-point candidate scoring when available, falls back transparently to the CPU baseline, and
returns an identical layout and metrics for the same seed. No existing exported signature changes;
the CPU baseline remains the only required path.

## Technical Context

**Language/Version**: TypeScript (strict) on Node.js >= 18, ESM (`moduleResolution: bundler`)
**Primary Dependencies**: none new. WebGPU is reached through `globalThis.navigator.gpu` with local
structural types, so Constitution V's zero-new-runtime-dependency rule holds.
**Storage**: N/A (in-memory, pure functions)
**Testing**: Mocha + `tsx` — `npm run test:unit`, `npm run test:integration:node`
**Target Platform**: Node.js and browser; acceleration is optional on both
**Project Type**: library
**Performance Goals**: SC-004 — the accelerated path is at least 2x the CPU baseline on the
reference job (100 parts / 5 sheets, feature 002); the baseline stays under 2 s
**Constraints**: determinism for identical input + seed across backends (FR-003/SC-001); search
budget derived from the input, never wall-clock (Constitution IV); no `any`/`unknown` in the core
domain; no source file over 500 lines
**Scale/Scope**: reference job 100 parts / 5 sheets; no persistence or network

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Library-First, Additive Public API | PASS | New `src/nesting/optimization/` module with a purpose header; request/response fields are optional; re-exported from `src/nesting/index.ts` and `src/index.ts`. Existing signatures unchanged. |
| II. Reuse Before Rewrite | PASS | Reuses `trueShape/{candidates,bounds,separation,search}`, `types.ts`, `config.ts`, `polygonUtils.ts`. No new geometry algorithm. |
| III. Test-First | PASS | Red tests first under `test/unit/nesting/optimization/`; runner Mocha + `tsx`. |
| IV. Determinism & Reproducibility | PASS | GPU proposes fixed-point candidate scores; the CPU keeps selection/tie-break authority, validates every placement and compares accelerated output with the baseline. Weights use `EPSILON` comparisons; the budget is input-derived. Identical seed yields an identical layout on both backends. |
| V. Strict TypeScript, Zero New Runtime Dependencies | PASS | No `dependencies` added; WebGPU typed by local structural interfaces; `npm run type-check` is a gate. The SC-004 performance floor is the acceptance gate. |

No violations; **Complexity Tracking** is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-nesting-optimization-gpu/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nesting-api.ts
└── tasks.md          # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/nesting/
├── types.ts                       # additive: OptimizationObjective, ExecutionBackendReport
├── config.ts                      # additive: DEFAULT_OBJECTIVE_WEIGHTS
├── trueShape/
│   ├── index.ts                   # additive: objective + acceleration wiring
│   └── search.ts                  # reused; weighted scoring hook added
└── optimization/
    ├── objective.ts               # weight validation, normalization, weighted score
    ├── backend.ts                 # backend selection, fallback, Execution Backend Report
    └── webgpu/
        ├── device.ts              # runtime probe of globalThis.navigator.gpu
        └── score.ts               # deterministic fixed-point candidate scoring kernel
```

```text
test/
├── unit/nesting/optimization/
│   ├── objectiveWeights.test.ts
│   ├── backendSelection.test.ts
│   └── determinism.test.ts
└── integration/nesting/
    └── gpuFallback.test.ts
```

**Structure Decision**: single-project library. The new `optimization/` module is self-contained and
states its purpose in its header comment; it plugs into `trueShape/index.ts` additively instead of
rewriting the search.

## Phase 0 — Research

See [research.md](./research.md). No `NEEDS CLARIFICATION` remain.

## Phase 1 — Design

See [data-model.md](./data-model.md), [contracts/nesting-api.ts](./contracts/nesting-api.ts) and
[quickstart.md](./quickstart.md).

### Post-Design Constitution Re-check

| Principle | Status |
|-----------|--------|
| I. Additive API | PASS — only optional fields added |
| II. Reuse | PASS — no new geometry/search algorithm |
| III. Test-First | PASS — tests precede wiring |
| IV. Determinism | PASS — the CPU retains selection authority and validates accelerated parity |
| V. Deps/TypeScript | PASS — no dependency added |

## Complexity Tracking

> No Constitution Check violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
