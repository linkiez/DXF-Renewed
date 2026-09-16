# ADR-0001: Observable Nesting Surface (RxJS)

- **Status**: Accepted
- **Date**: 2026-09-15
- **Feature**: `specs/009-async-nesting-flows`
- **Supersedes**: none
- **Constitution impact**: relaxes Principle I and Principle V; requires Constitution 1.1.0 -> 2.0.0 and package major bump 7.7.6 -> 8.0.0

## Context

Nesting entry points currently return plain values and block the caller. The feature
(`009-async-nesting-flows`) turns every in-scope flow into an RxJS `Observable` so pipelines can be
composed with RxJS operators, cancelled by `unsubscribe`, and observed as a single lazy emission.

This collides with two non-negotiable project rules:

- **Principle I (Library-First, Additive Public API)**: existing exported signatures may not break.
  Re-typing `nest`, `nestFromDxf`, `nestDXF`, `nestWithPreset`, `quickNest`, `NestingHelper.nest`,
  `nestTrueShape` and `prepareParts` to return `Observable<T>` is a deliberate, documented breaking
  change (spec Clarification Q2, Option B).
- **Principle V (Zero New Runtime Dependencies)**: `rxjs` is not a runtime dependency today; it is
  only present transitively. The Observable surface requires it in `dependencies`
  (spec FR-010).

## Decision

1. In-scope nesting flow names return an RxJS `Observable` that emits exactly one complete result
   and then completes (FR-001).
2. The Observable is **lazy** (no pipeline work before `subscribe`) and **cold per subscription**
   (every `subscribe` re-runs the pipeline; no cache/multicast) — FR-001, FR-011.
3. Teardown is **silent**: `unsubscribe` emits no `next`/`complete`/`error` (FR-007).
4. `rxjs` is promoted to a runtime dependency and the package ships a **major** version
   (7.7.6 -> 8.0.0) (FR-005, FR-010).
5. Constitution Principles I and V are amended to admit this exception, gated by this ADR plus the
   major bump.

## Consequences

- **Breaking**: all consumers of the in-scope flow names must migrate from direct values to
  subscription (`flow(...).subscribe(result => ...)`) or `firstValueFrom(flow(...))`.
- **Migration path**: call sites wrap the returned Observable with `firstValueFrom` to obtain a
  Promise, or subscribe directly for composition.
- **Governance**: Constitution version becomes 2.0.0 (major, because a principle is weakened);
  Principle I/V exceptions are scoped strictly to the in-scope flow names and RxJS.
- **Non-goals**: no change to output formatters (`toNestedSvg`, `toNestedDxf`) or pure
  geometry/analysis helpers; they remain synchronous and additive.
- **Determinism**: identical input + seed yields identical placement decisions for both the cold
  re-subscription and the frozen 7.7.6 baseline (FR-002, SC-002).

## Alternatives rejected

- **Promise-only surface**: no native cancellation/composition; would still break Principle I and
  add no value over RxJS.
- **Additive `*Async` siblings** (no breaking change): doubles the public surface and defeats the
  single-pipeline goal (spec Clarification Q2, Option A was rejected).
- **`shareReplay`/multicast surface**: hides per-subscription cost and reintroduces shared state
  (spec Clarification Q4, Option A chosen instead).
