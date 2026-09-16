# Implementation Plan: Async Nesting Flows

**Branch**: `009-async-nesting-flows` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-async-nesting-flows/spec.md`

## Summary

Convert the eight in-scope nesting flows from `Promise`-returning functions into lazy, cold RxJS
`Observable`s that emit exactly one complete result and then complete. Reuse the existing
implementations verbatim behind an Observable wrapper (`defer` + cancellation-aware execution);
change no algorithm. The change is a deliberate breaking API change, authorized by
`.specify/adr/ADR-0001-observable-nesting-surface.md`: package bumps `7.7.6 -> 8.0.0`, RxJS is
promoted to a runtime dependency, and Constitution Principles I/V are relaxed (Constitution
`2.0.0`).

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch`,
`moduleResolution: bundler`); ESM; Node >= 18.

**Primary Dependencies**: `rxjs` `^7.8.2` (new runtime dependency, approved by ADR-0001). Existing:
`commander`, `lodash`, `vecks`. No other new dependency.

**Storage**: N/A.

**Testing**: Mocha + `tsx` — `npm run test:unit`, `npm run test:integration:node`; Playwright
(`test:integration:browser`) for the bundled browser build. TDD: Red -> Green -> Refactor.

**Target Platform**: Node.js and browser (bundled to `dist/dxf.js` via esbuild `iife`).

**Project Type**: Single project — publishable library (`src/` + `test/`).

**Performance Goals**: No wall-clock search bound (FR-003); any search budget derives from the
input (iteration budget / seed). Existing acceptance thresholds are pass/fail gates.

**Constraints**: No input mutation (FR-006); zero new runtime dependencies besides RxJS
(FR-010/Constitution V); silent failure forbidden (FR-004); errors only for contract violations
(FR-009); deterministic given input + seed (FR-002/Constitution IV).

**Scale/Scope**: 8 in-scope flows (`nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`,
`NestingHelper.nest`, `nestTrueShape`, `prepareParts`); output formatters and pure geometry helpers
stay synchronous.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Library-First, Additive Public API | Existing signatures may not break — **except** a documented breaking change with ADR + major bump | PASS — ADR-0001 recorded, `8.0.0`; exception explicitly narrowed to the 8 flow names |
| II. Reuse Before Rewrite (NON-NEGOTIABLE) | Reuse tested code; no new algorithm without rationale | PASS — every flow delegates to its existing implementation; only the surface (wrapping) is new |
| III. Test-First (NON-NEGOTIABLE) | Tests written first and fail first; no regression | PASS (planned) — contract, cancellation, determinism and coldness tests precede the wrapper |
| IV. Determinism and Reproducibility | Identical input + seed => identical placement decisions; no wall-clock bound | PASS — seed passed through unchanged; `processingTimeMs` is reported, never used as a bound |
| V. Strict TypeScript, Zero New Runtime Dependencies | No new `dependencies` entry — **except** an ADR-approved runtime dependency with a major bump | PASS — `rxjs ^7.8.2` admitted by ADR-0001; `type-check`/`lint` gates apply |

No unjustified violations. The two Principle deviations are documented in
[DECISIONS/ADR-0001](../../.specify/adr/ADR-0001-observable-nesting-surface.md) and mirrored in
`Complexity Tracking` below.

## Project Structure

### Documentation (this feature)

```text
specs/009-async-nesting-flows/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── nesting-observable-api.ts
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created here)
```

### Source Code (repository root)

```text
src/
├── index.ts                       # barrel: re-export the Observable flows (additive)
├── cli-nest.ts                    # migrates to firstValueFrom(...) at the call site
├── nest/
│   ├── index.ts                   # nestDXF, nestWithPreset, quickNest -> Observable
│   ├── nestCore.ts                # unchanged (reused)
│   ├── types.ts                   # NestOptions/NestResult (unchanged types)
│   └── ...
└── nesting/
    ├── index.ts                   # barrel exports + flow Observable types
    ├── applyNesting.ts            # nest, nestFromDxf -> Observable
    ├── NestingHelper.ts           # NestingHelper.nest -> Observable
    ├── trueShape/index.ts         # nestTrueShape -> Observable
    ├── pro/partPrep/index.ts      # prepareParts -> Observable
    ├── async/                     # NEW: Observable wrapper + cancellation plumbing
    │   ├── index.ts
    │   └── observableFlow.ts
    └── ...

test/
├── unit/nesting/async/            # coldness, laziness, cancellation, error contract
└── integration/nesting/           # baseline parity, end-to-end composition
```

**Structure Decision**: Single-project library layout. All new code lives under
`src/nesting/async/` (the Observable wrapper) plus a one-line change per flow. No existing module
is rewritten; algorithms in `binPacking/`, `trueShape/` and `pro/partPrep/` are reused verbatim.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle I — breaking change to exported flow signatures | The feature's whole point is a single lazy, cancellable, composable surface across every flow; additive `*Async` siblings would double the public API and keep two pipelines (spec Clarification Q2, Option B). | Option A (additive siblings) rejected: doubles surface, no single pipeline, still forces consumers to pick a shape. |
| Principle V — `rxjs` added to `dependencies` | An Observable surface requires an Observable implementation; RxJS is the mandated contract (spec Clarification Q3, FR-010). | Hand-rolled Observable subset rejected: re-implements operators, untested, violates Reuse Before Rewrite; `firstValueFrom`/`defer` come free with RxJS. |
