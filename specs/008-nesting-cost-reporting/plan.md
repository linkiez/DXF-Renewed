# Implementation Plan: Nesting Costing and Reporting

**Branch**: `008-nesting-cost-reporting` | **Date**: 2026-11-16 | **Spec**: `spec.md`

## Summary

Add a stateless costing and reporting module under `src/nesting/cost/`. A synchronous, pure core turns
an `ErpNestingArtifact` (006), an optional `CutLayout` and `CutPlanResult` (004) and a caller-supplied
`CostModel` into a `CostBreakdown`: usage per placed part (net area, cut length, travel length, pierce
count, times), six cost components with per-component status (complete, estimated, incomplete), exact
integer amounts in the currency's smallest unit, and a deterministic apportionment that keeps the parts
reconciled to the job. An asynchronous flow wraps the core, adds the SHA-256 digests (artifact, cost
model, report) and returns one `CostReport` as a cold RxJS Observable, like the ERP nesting flow. A
tabular export writes one table for parts and one for the job. Nothing is stored and no dependency is
added.

## Technical Context

**Language/Version**: TypeScript 6, Node.js >=18, strict compiler settings.

**Primary Dependencies**: existing `rxjs` (flow), `zod` (cost model and request validation, the same
ERP boundary and exception as ADR-0002); existing `erp` (`digestCanonical`, `canonicalize`,
`ErpNestingArtifact`), `cutPath` types, `async/observableFlow`, `polygonUtils`. No new dependency.

**Storage**: N/A. No persistence and no network I/O; inputs are never mutated.

**Testing**: Mocha + `tsx` unit tests in `test/unit/nesting/cost/`; a node integration test over the
real drawings of `test/resources/nest-fixtures` (nest, plan, cost) in
`test/integration/nesting/costRealParts.test.ts`. Gates: `yarn type-check`, `yarn lint`,
`yarn test:unit`, `yarn quality:gate`, plus the measured SC gates in `quickstart.md`.

**Target Platform**: Node.js and browsers (the flow needs only Web Crypto, like the ERP flow).

**Project Type**: TypeScript library.

**Performance Goals**: SC-006 report for the 500-part reference job (the `007` reference sheet and its
plan) in under 1 s on the reference machine in Node.js, worst of five runs; design target
O(parts + actions).

**Constraints**: additive public API; no input mutation; geometry stays unitless and the cost model
declares the conversion (`geometryUnitsPerMeter`); money is held as integers of the smallest currency
unit; no wall-clock or random input; apportionment order is fixed; no silent failure (every gap is a
`CostNotice`); text produced for users (notice messages) is Brazilian Portuguese from one module, codes
and field names English; one public function per source file; every `src` change updates its sibling
`.doc.md` in the same task; no other documentation is created or edited; files under 500 lines.

**Scale/Scope**: one artifact per report; reference size 500 parts and about 10^4 actions; larger jobs
stay complete.

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1.*

- **I. Library-First, Additive Public API**: PASS. New `cost/` module re-exported from
  `src/nesting/index.ts`; no existing signature changes. Extracting shared linking (research D3) keeps
  the review behavior and exports unchanged.
- **II. Reuse Before Rewrite**: PASS. Reuses `digestCanonical`, `canonicalize`, the ERP types and Zod
  pattern, `observeFlow`, `polygonUtils` and the cut-plan types. The part linking and placement
  resolution that `review` already implements are extracted to a neutral module and shared instead of
  duplicated (research D3).
- **III. Test-First**: PASS. Every module has failing tests before implementation.
- **IV. Determinism**: PASS. No time or randomness; the apportionment ties are broken by a fixed part
  order; digests use canonical JSON.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: PASS. No new dependency. Zod validation of
  the cost model is the same ERP-boundary use already approved by ADR-0002; no `unknown` in the domain.
- **Unit discipline / precision / silent failure**: PASS. The length conversion is explicit in the
  model, money is integer minor units, comparisons use `EPSILON`, and every incomplete, estimated or
  inconsistent case is a `CostNotice`.
- **Documentation, coding and comment discipline**: PASS. `.doc.md` siblings are part of each task;
  messages are pt_BR from one module; JSDoc on public functions; no narrative comments.

## Phase 0: Research Summary

`research.md` resolves: module boundary and input shape, shared linking extraction, money and
apportionment, allocation bases per component, time and consumable models, status propagation, report
and export formats, flow shape and validation, performance. No `NEEDS CLARIFICATION` remains.

## Phase 1: Design Summary

- `data-model.md`: cost model, usage, components, report, notices and export tables with validation
  rules and status transitions.
- `contracts/cost-reporting-api.md`: public functions, report and export contract, column lists.
- `quickstart.md`: runnable gates, acceptance scenarios and the measurement procedure.

## Project Structure

### Documentation

```text
specs/008-nesting-cost-reporting/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cost-reporting-api.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/nesting/linking/                # shared by review and cost (extracted, no behavior change)
├── linkActions.ts      # action -> part key resolution with structured unresolved references
├── placedParts.ts      # placement -> part resolution (sheet, instance, outline, compound)
├── actionPath.ts       # sampleActionPath, moved from review/ (arcs and beziers to polylines)
└── actionLength.ts     # actionLength: geometric length of an action (shared with the review timeline)

src/nesting/review/
├── linkParts.ts        # now wraps linkActions and adds notices (same public result)
└── resolvePlacements.ts  # now wraps placedParts and adds notices (same result)

src/nesting/cost/
├── types.ts            # public types (CostModel, CostRequest, CostBreakdown, CostReport, ...)
├── schemas.ts          # Zod schemas aligned with types.ts (request and cost model)
├── messages.ts         # pt_BR notice messages (internal)
├── validateCostModel.ts  # FR-016 checks beyond the schema (currency, positive lives, ...)
├── collectUsage.ts     # per-part usage and per-sheet totals from artifact and plan
├── estimateTimes.ts    # lengths, pierce counts and cutting, travel and pierce seconds
├── componentNeeds.ts   # inputs each category depends on (internal)
├── categoryStatus.ts   # complete / estimated / incomplete from the inputs (internal)
├── statusNotices.ts    # one notice per missing or estimated input (internal)
├── componentAmounts.ts # exact (unrounded) amount per category and part, plus statuses
├── apportion.ts        # largest-remainder rounding that keeps parts reconciled
├── buildCostBreakdown.ts  # sync core: usage -> components -> allocation -> breakdown
├── buildProductionReport.ts  # sheets, yield, waste, unplaced, times
├── calculateCostReport.ts    # Observable flow: validates, builds, adds digests
├── costReportTables.ts # export tables (parts, job) as rows and columns
├── costReportToCsv.ts  # the tables as RFC 4180 text
└── index.ts            # barrel

src/nesting/index.ts    # re-export cost public surface (additive)
<each file above>.doc.md  # sibling documentation, updated in the same task as its source

test/unit/nesting/cost/
├── fixtures.ts
├── validateCostModel.test.ts
├── collectUsage.test.ts
├── estimateTimes.test.ts
├── componentAmounts.test.ts
├── apportion.test.ts
├── buildCostBreakdown.test.ts
├── buildProductionReport.test.ts
├── calculateCostReport.test.ts
└── costReportToCsv.test.ts
test/unit/nesting/linking/
├── linkActions.test.ts
└── placedParts.test.ts
test/integration/nesting/costRealParts.test.ts
```

**Structure Decision**: a feature-local module beside `erp/`, `cutPath/` and `review/`. The sync core is
pure and independent of digests and Observables; the flow adds only identity and asynchrony; the export
is a pure projection of the report. Shared linking moves to a neutral module so neither `review` nor
`cost` depends on the other. `types.ts`, `schemas.ts` (two Zod schemas, like `erp/schemas.ts`) and the barrel are the only
multi-export files. Internal
helpers are not exported through the barrel.

## Complexity Tracking

No constitution violations require justification. The extraction of `src/nesting/linking/` changes no
public behavior; it exists to satisfy Principle II and is covered by the existing `review` tests.
