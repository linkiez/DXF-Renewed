# Feature Specification: Async Nesting Flows

**Feature Branch**: `009-async-nesting-flows`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "criar spec para tornar todos os fluxos possiveis de nesting em async"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose Every Nesting Flow As An Observable (Priority: P1)

A library consumer chains the whole nesting journey — read source geometry, prepare parts, run the nesting search, and emit the result — as a single RxJS Observable sequence. Today some stages can only be called synchronously, forcing the caller to block the event loop (or bridge manually) mid-pipeline, which stalls the surrounding application.

**Why this priority**: This is the reason the feature exists. Without a uniform Observable surface there is no single pipeline, only a mix of blocking and non-blocking stages; every downstream integration pays for it.

**Independent Test**: The in-scope flow list in FR-001 is fixed and documented. Each listed flow returns an Observable that emits exactly one complete result and then completes (not a partially built object). Verified by subscribing to each flow from the barrel export; no pipeline work runs at the call site before subscription.

**Acceptance Scenarios**:

1. **Given** a valid nesting request, **When** the caller subscribes to the returned Observable, **Then** the emitted value contains the complete result (placements, unplaced items, metrics) and no further call is required to obtain it.
2. **Given** a pipeline of two or more nesting stages, **When** the caller composes them with RxJS operators, **Then** each stage receives the previous stage's emitted result, no stage runs at the call site (the composition is lazy), and the composition needs no `await` or manual bridging to stay non-blocking at the call site.

---

### User Story 2 - Identical Results Under The Observable Surface (Priority: P1)

A consumer that subscribes to the Observable form obtains the same placement decisions and the same metrics that the frozen pre-change baseline produced for the same input and seed. Adoption of RxJS never changes nesting output.

**Why this priority**: Nesting output is a manufacturing artifact. Any behavioral drift between the two call forms is a correctness defect, not a migration detail.

**Independent Test**: The reference job set is fixed and enumerated (see Assumptions); for each job the Observable form and the frozen baseline are run with the same input and seed, and placement decisions and metrics are compared and must be equal. The baseline is captured as golden fixtures under `test/integration/nesting/fixtures/`.

**Acceptance Scenarios**:

1. **Given** the same input and seed, **When** the flow is subscribed to and when the frozen baseline is replayed, **Then** placement decisions and reported metrics are identical.
2. **Given** a flow that falls back from an optional accelerator to the baseline path, **When** the flow is subscribed to, **Then** the emitted result is the baseline result and the fallback is reported explicitly.

---

### User Story 3 - Explicit Failure And No Wasted Work On Unsubscribe (Priority: P2)

A consumer that subscribes to a flow receives a definite outcome: either a result, or a result carrying an explicit reason for every item that could not be processed. A consumer that abandons a long-running flow can unsubscribe, and no partial or corrupt nesting output is produced or retained.

**Why this priority**: Async introduces abandonment and concurrency that the synchronous surface did not. Without explicit failure and cancellation, async makes silent data loss and stale state possible.

**Independent Test**: Trigger an unprocessable input and assert an explicit reason is present on the emitted value (no error notification, no silent drop). Start a long flow, unsubscribe, and assert no result is emitted and subsequent flows are unaffected.

**Acceptance Scenarios**:

1. **Given** input with an item that cannot be placed, **When** the flow is subscribed to, **Then** the emitted value reports that item with a specific reason and never drops it silently.
2. **Given** a flow is unsubscribed before completion, **When** the subscription is torn down, **Then** no result is produced, no caller-supplied input is mutated, and a subsequent flow starts from clean state.
3. **Given** an optional accelerator is unavailable or fails mid-flow, **When** the flow is subscribed to, **Then** it completes on the baseline path and reports the fallback reason.

---

### Edge Cases

- Accelerator acquisition fails after the flow has already started: the flow completes on the baseline path and reports the reason; it does not abandon valid work.
- The consumer never subscribes to the returned Observable: no shared/global state is left dirty that would corrupt a later flow.
- Two flows run concurrently and overlap: their results are independent and reproducible per seed; there is no cross-talk.
- Unsubscribe requested between two pipeline stages: the flow tears down silently — no `next`, no `complete`, no `error` — and the already-completed work is not emitted as a partial result.
- Empty or trivially small input (zero or one shape, or a sheet smaller than the smallest part): the Observable emits immediately on `subscribe` with the same result as the frozen baseline.

## Clarifications

### Session 2026-09-15

- Q: Quais entry points públicos contam como "nesting flow" que deve ganhar forma Observable? (FR-001, SC-001) → A: Option A — pipelines que iniciam ou avançam uma execução (`nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`, `NestingHelper.nest`, `nestTrueShape`, `prepareParts`); formatadores de saída (`toNestedSvg`, `toNestedDxf`) permanecem síncronos.
- Q: A forma Observable coexiste com as assinaturas atuais ou as substitui? (FR-005) → A: Option B — mudança breaking deliberada: os nomes atuais passam a retornar Observable; exige bump major, ADR e emenda ao Princípio I da constituição.
- Q: Qual contrato de assincronia e cancelamento a superfície pública deve usar? → A: RxJS Observable — cada fluxo emite exatamente um resultado completo e completa; cancelamento por `unsubscribe`; notificação de erro reservada a violações de contrato.
- Q: Como o cancelamento deve se manifestar para quem assina o Observable? (FR-007, Edge Cases) → A: Option A — teardown silencioso: `unsubscribe` não emite `next`, `complete` nem `error`; o assinante sabe que cancelou.
- Q: Qual vocabulário canônico o spec deve usar para a superfície e para o valor entregue? (Terminology & Consistency) → A: Option A — vocabulário RxJS (`Observable`/`emit`); "forma aguardável" e `Async Result` eliminados; nome da feature mantido.
- Q: O "não bloquear" é garantia da forma da API (lazy) ou de runtime (execução agendada)? (US1.2, FR-001) → A: Option A — garantia da forma (lazy/composicional): nada executa no call site; ao `subscribe` a pipeline pode emitir de forma síncrona no mesmo tick. "Não bloquear" = composição sem `await` nem bridge manual, não agendamento.
- Q: Quando o mesmo Observable de nesting é assinado mais de uma vez, cada assinatura reexecuta o pipeline ou reaproveita o resultado já calculado? (FR-002, SC-002, SC-006) → A: Option A — cold por assinatura: cada `subscribe` reexecuta o pipeline do zero; resultado idêntico dado o mesmo input+seed. Reassinar = recomputar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every nesting flow that initiates or advances a pipeline MUST expose an RxJS Observable that emits exactly one complete result and then completes. It MUST be lazy: no pipeline work executes before `subscribe`. In-scope flows: `nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`, `NestingHelper.nest`, `nestTrueShape`, `prepareParts`. Output formatters (`toNestedSvg`, `toNestedDxf`) and pure geometry/analysis helpers (`extractShapes`, `sortShapes`, `packMultiSheet`, `searchBestArrangement`, `analyzeShapes`) are out of scope and MAY remain synchronous.
- **FR-002**: Subscribing to a flow MUST yield the same placement decisions and metrics as the frozen pre-change baseline (version 7.7.6 outputs) for the same input and seed.
- **FR-003**: No flow MUST use wall-clock time as a search bound; any bound MUST be derived from the input.
- **FR-004**: Any item that cannot be processed MUST be returned with an explicit, specific reason; it MUST NOT be dropped silently and MUST NOT be signalled as an Observable error.
- **FR-005**: The change MAY break existing exported signatures: in-scope flow names now return an Observable. It MUST ship as a major version bump (7.7.6 → 8.0.0), require an ADR, and require an amendment to Constitution Principle I before implementation.
- **FR-006**: No flow MUST mutate caller-supplied input.
- **FR-007**: A running flow MUST be cancellable by tearing down its subscription. On unsubscribe the flow MUST suppress all `next`, `complete` and `error` notifications (silent teardown) and MUST leave no shared state that affects later flows.
- **FR-008**: When an optional accelerator is requested but unavailable or failing, the flow MUST complete on the baseline path and MUST report the fallback reason in the result.
- **FR-009**: Errors MUST surface only for programmer/contract violations, as an Observable error notification with a descriptive message; expected outcomes (unplaceable items, fallback) MUST be delivered as a normal emission, never an error.
- **FR-010**: The package MUST declare RxJS in `dependencies`; this requires an amendment to Constitution Principle V (zero new runtime dependencies) before implementation.
- **FR-011**: Flows MUST be cold per subscription: every `subscribe` runs the pipeline independently and emits its own result. The returned Observable MUST NOT cache or multicast a previous emission; re-subscribing with the same input and seed MUST recompute and yield an identical result.

### Key Entities

- **Nesting Flow**: A distinct public entry point that starts or advances a nesting pipeline, returned lazily (no work until `subscribe`). In-scope flows are `nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`, `NestingHelper.nest`, `nestTrueShape`, and `prepareParts`. Output formatters and pure geometry/analysis helpers are not flows.
- **Emitted Result**: The complete value a flow emits: placements, unplaced items with reasons, and metrics.
- **Fallback Reason**: The explicit explanation recorded on a result when an optional accelerator is not used.
- **Subscription Teardown**: The caller unsubscribing from a flow's Observable, which stops the running flow without producing output. Teardown is silent: no `next`, `complete` or `error` notification is delivered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the eight in-scope nesting flows named in FR-001 return an Observable that emits exactly once and completes (verified by subscribing to each from the public export surface).
- **SC-002**: For the enumerated reference job set, the Observable form and the frozen pre-change baseline produce identical placement decisions and metrics for the same input and seed (zero mismatches); the baseline is the golden fixture set in `test/integration/nesting/fixtures/`.
- **SC-003**: Zero flows use wall-clock time as a search bound (verifiable by inspection of every flow).
- **SC-004**: After call sites are migrated to the Observable surface, the existing test suite passes with no output regression, and RxJS is the single new runtime dependency, recorded in an ADR.
- **SC-005**: An unprocessable input yields an emitted result containing an explicit reason for every affected item (no error notification, no silent omission).
- **SC-006**: Unsubscribing from a running flow emits nothing and leaves no state that changes a subsequent flow's result.
- **SC-007**: No pipeline work executes at the call site; execution begins only on `subscribe` (verifiable by asserting no metric/side effect advances before subscription).
- **SC-008**: Subscribing twice to the same Observable runs the pipeline twice (no shared or cached emission) and both subscriptions emit identical results for the same input and seed.

## Assumptions

- The primary consumers are developers integrating the library; "user" throughout means library consumer.
- Both Node.js and browser execution environments are in scope; an accelerator is optional and never required for correctness.
- The change is a deliberate breaking change (Clarifications Q2): in-scope flow names now return an Observable, so the package ships a major version (7.7.6 → 8.0.0) and Constitution Principle I is amended.
- Determinism is defined at the level of placement decisions given identical input and seed, consistent with existing project policy.
- The set of "nesting flows" is fixed to the eight pipeline entry points named in FR-001 and Key Entities; output formatters (`toNestedSvg`, `toNestedDxf`) and pure geometry/analysis helpers (`extractShapes`, `sortShapes`, `packMultiSheet`, `searchBestArrangement`, `analyzeShapes`) are explicitly out of scope.
- **Reference job set** (frozen baseline for FR-002/SC-002/SC-004): four jobs with fixed seeds, stored as golden fixtures in `test/integration/nesting/fixtures/`: (1) `parsed-dxf-simple` — two-shape parsed DXF through `nest` and `nestFromDxf`, seed `20260101`; (2) `raw-dxf-preset` — the same geometry through `nestDXF`, `nestWithPreset` and `quickNest`, seed `20260101`; (3) `true-shape-mixed` — mixed-size request through `nestTrueShape` with `iterations: 5000`, seed `20260101`; (4) `part-prep-boundary` — part-prep input exercising one rejection and one warning through `prepareParts`. Each fixture records resolved placement decisions, `unplaced`/`issues` reasons and metrics; measurement-only fields (`processingTimeMs`, `backend.timings`) are excluded from comparison.
- **MVP scope**: User Story 1 and User Story 2 ship together. US2 is a P1 correctness gate on the US1 surface, so the Observable surface does not ship without proven baseline parity.
- RxJS is the mandated async surface (Clarifications Q3). RxJS `^7.8.2` is a declared runtime dependency in `package.json`, admitted by `.specify/adr/ADR-0001-observable-nesting-surface.md`, which amends Constitution Principle V (Constitution `2.0.0`).
