# Implementation Plan: Stateless ERP Nesting Contract

**Branch**: `006-stateless-erp-contract` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-stateless-erp-contract/spec.md`

## Summary

Add a dedicated, stateless ERP nesting contract under `src/nesting/erp/`. The module will expose
TypeScript interfaces and Zod schemas, validate a complete caller-owned request, adapt it to the
existing nesting algorithms, emit one self-contained RxJS Observable artifact, and compute
deterministic SHA-256 digests from explicit canonical projections. Missing resources produce a
partial artifact with typed `unplaced` reasons; no ERP state, files, inventory, or profiles are
read or mutated.

## Technical Context

**Language/Version**: TypeScript 6.0.3, strict ESM, Node.js `>=22.13.0`.

**Primary Dependencies**: Existing `rxjs` `^7.8.2`; add `zod` as an approved runtime dependency.
Use the platform Web Crypto API (`crypto.subtle`) for SHA-256 so the library remains portable
between supported Node.js and browser runtimes. No additional dependency.

**Storage**: None. The module is stateless and caller-owned.

**Testing**: Mocha + `tsx` with TDD; unit tests for schemas, canonicalization, digests, partial
artifacts and immutability; Node integration tests for the Observable ERP flow; existing type-check,
lint, unit, build and quality gates.

**Target Platform**: Node.js and browser-compatible library consumers. The digest implementation
must use Web Crypto rather than a Node-only module and remain compatible with the package build.

**Project Type**: Publishable TypeScript library with public exports from `src/index.ts`.

**Performance Goals**: Digest and validation overhead must be linear in serialized contract size.
No wall-clock value may control nesting search. Repeated equal requests must produce equal digests.

**Constraints**: No external I/O or persistence; no caller-input mutation; explicit versioning;
typed status/warnings/rejections/unplaced collections; expected processing outcomes are normal
Observable emissions; contract violations use the documented error channel.

**Scale/Scope**: One request describes one production-order revision. The adapter reuses existing
`NestRequest`, `NestResponse`, `nestTrueShape`, and related preparation/post-processing APIs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Library-First, Additive Public API | New self-contained module and barrel exports; incompatible contract evolution requires explicit major version | PASS — ERP surface is additive within the current major; incompatible contract versions are explicitly major-versioned |
| II. Reuse Before Rewrite | Reuse existing nesting models, algorithms, Observable flows and validation utilities | PASS — ERP module is an adapter and does not duplicate nesting algorithms |
| III. Test-First | Tests precede implementation and all existing gates remain required | PASS (planned) — schema, digest, partial-result and integration tests are specified before implementation |
| IV. Determinism and Reproducibility | Equal canonical request and seed produce equal layout and digests; no wall-clock search bound | PASS — canonical projections exclude volatile fields and preserve deterministic ordering |
| V. Strict TypeScript, Zero New Runtime Dependencies | Runtime dependency exceptions require ADR and major bump | PASS with planned exception — Zod is required by FR-010; implementation must add ADR-0002, amend the package major to 9.0.0, and preserve all quality gates |

No gate is left unjustified. The Zod exception is tracked in Complexity Tracking and must be
implemented atomically with its ADR and major-version bump.

## Project Structure

### Documentation

```text
specs/006-stateless-erp-contract/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── erp-nesting-contract.ts
├── checklists/
│   └── requirements.md
└── tasks.md                  # /speckit-tasks output
```

### Source Code

```text
src/
├── index.ts                   # public root exports
└── nesting/
    ├── index.ts               # public nesting exports
    ├── erp/
    │   ├── types.ts           # ERP request/artifact interfaces
    │   ├── schemas.ts         # Zod schemas and version dispatch
    │   ├── canonical.ts       # canonical projection and JSON serialization
    │   ├── digest.ts          # Web Crypto SHA-256 digest helpers
    │   ├── flow.ts            # validation, adapter and Observable orchestration
    │   └── index.ts           # feature exports
    └── ...                    # existing reusable nesting modules

test/
├── unit/nesting/erp/
└── integration/nesting/erp/
```

**Structure Decision:** A focused ERP adapter module keeps the persisted integration contract
separate from algorithm-level nesting types. Canonicalization and digest helpers remain reusable
within the module and are not embedded in individual nesting algorithms.

## Phase 0: Research

Research is complete in [research.md](./research.md). It resolves the runtime validation strategy,
adapter boundary, canonical digest rules, partial-result behavior, versioning policy, and
dependency governance.

## Phase 1: Design

The data model, public contract shape, and runnable validation scenarios are complete in:

- [data-model.md](./data-model.md)
- [contracts/erp-nesting-contract.ts](./contracts/erp-nesting-contract.ts)
- [quickstart.md](./quickstart.md)

The browser target requires an integration check against the bundled ERP flow and Web Crypto
availability; this is covered by the browser validation task in `tasks.md`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Constitution V — add Zod to runtime dependencies | FR-010 requires runtime validation at the published ERP boundary | Dev-only Zod cannot validate published consumer inputs; handwritten validators duplicate the contract |
| Package major bump to 9.0.0 | The dependency exception must be released as a major change under Principle V | Shipping the runtime dependency in 8.x would violate the constitution's compatibility gate |

Implementation must create `.specify/adr/ADR-0002-stateless-erp-contract.md` before changing
`package.json`, add Zod to `dependencies`, update the package major version to `9.0.0`, and amend
the constitution version/rationale in the same atomic change.
