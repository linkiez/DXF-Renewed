# Phase 0 Research: Async Nesting Flows

Resolves the design unknowns behind FR-001..FR-011. Each item is a decision, its rationale, and the
alternatives rejected. No `NEEDS CLARIFICATION` remains.

## R1. Observable construction: how to make an existing `async` function lazy and cold

- **Decision**: Wrap each flow with `defer(() => new Observable<T>(subscriber => { ... }))`. `defer`
  guarantees the factory runs per subscription (cold + lazy, FR-001/FR-011); `new Observable` (not
  `from(promise)`) is used so teardown can actually stop the flow.
- **Rationale**: `defer` is the idiomatic cold/lazy primitive; the inner `new Observable` gives
  access to the teardown callback needed for FR-007. `from(existingPromise)` is *not* lazy — the
  promise already started at call time — and cannot be cancelled.
- **Alternatives rejected**: `from(fn())` (eager, un-cancellable); `shareReplay(1)` (violates
  FR-011 cold-per-subscription); `Subject` (hot, loses the single emission).

## R2. Cancellation: how `unsubscribe` stops a running `Promise`-based pipeline

- **Decision**: Thread a single `AbortSignal` from the `Observable` teardown into the inner
  pipeline. The wrapper creates an `AbortController`, passes `signal` to the flow, and calls
  `controller.abort()` in the teardown. Flows check `signal.aborted` at their existing stage
  boundaries (shape extraction, sort, per-sheet pack loop, search iteration) and stop early.
- **Rationale**: `Promise` cannot be cancelled; an `AbortSignal` is the smallest cooperative
  mechanism, reuses existing loop boundaries, and leaves FR-004 reasons intact. Teardown is
  **silent** (FR-007): the wrapper returns without `next`/`complete`/`error` after abort.
- **Alternatives rejected**: `takeUntil` + a notifier (does not stop the work, only unsubscribes);
  `race`/`timeout` (not caller-driven); worker threads (out of scope).
- **Scope note**: cancellation is *cooperative* — a synchronous algorithm body cannot be
  interrupted mid-call, so granularity is "no further stage work", which is what SC-003/US3 assert.

## R3. Non-blocking contract: lazy API vs runtime scheduling

- **Decision**: Lazy/compositional only (spec Clarification Q4/US1.2): nothing runs at the call
  site; on `subscribe` the pipeline runs — possibly synchronously in the same tick — and emits.
  No scheduler, no offload.
- **Rationale**: Matches RxJS semantics and FR-001; avoids adding scheduler/worker complexity the
  spec never asked for. Consumers wanting a Promise use `firstValueFrom`.
- **Alternatives rejected**: `asyncScheduler`/`observeOn` (changes timing, breaks the deterministic
  synchronous tests); Web Worker offload (new architecture, out of scope).

## R4. Error contract vs expected outcomes

- **Decision**: A contract violation (invalid request/options, programmer misuse) is thrown inside
  the wrapper and surfaces as an Observable `error` notification with a descriptive message
  (FR-009). Expected outcomes (unplaceable items, accelerator fallback, prepare `issues`) are
  carried in an **emitted** result, never an error (FR-004/FR-009).
- **Rationale**: Matches the existing flows which already return invalid/issue payloads for
  expected outcomes and `throw` only on misuse.
- **Alternatives rejected**: converting every existing `invalidResponse(...)` into `error` — would
  break FR-004 and the baseline parity tests.

## R5. Baseline parity (FR-002/SC-002) and the 7.7.6 frozen outputs

- **Decision**: Capture golden fixtures from the current `7.7.6` behavior *before* touching the
  flows; assert the Observable emission deep-equals the golden fixture for identical input + seed.
- **Rationale**: The spec freezes the pre-change baseline; the wrapper must not change placement
  decisions or metrics. Fixtures live under `test/**/fixtures` and are read through the existing
  Mocha + `tsx` runner.
- **Alternatives rejected**: asserting only "no throw" (too weak); re-deriving expected values from
  the new implementation (circular).

## R6. Determinism and seeds (FR-002/FR-003, Constitution IV)

- **Decision**: Pass `seed` through unchanged; never introduce `Date.now()`/`performance.now()` as a
  search bound. `processingTimeMs` is *measured and reported* (as today) but never gates search.
  Re-subscription re-runs the same deterministic computation (FR-011).
- **Rationale**: Preserves the existing determinism tests and Constitution IV; the cold wrapper
  calls the same code path with the same inputs.
- **Alternatives rejected**: memoising by input hash (cache policy, violates FR-011 cold surface).

## R7. Public surface and migration (FR-005)

- **Decision**: Convert the eight in-scope flow names in place to return `Observable<T>`. Re-export
  `nestDXF`, `nestWithPreset`, `quickNest` from the root barrel (`src/index.ts` currently only
  re-exports `src/nesting/index`) so the whole in-scope set is reachable. Existing call sites
  migrate with `firstValueFrom(...)`. `NestingHelper.nest` is converted but its stateful
  `nestingResult`/`toNestedSvg`/`toNestedDxf` accessors keep their synchronous contract (populated
  on emission).
- **Rationale**: Single surface (spec Clarification Q2, Option B); `firstValueFrom` is the trivial
  Promise bridge and is already available from RxJS.
- **Alternatives rejected**: additive `*Async` siblings (doubles surface, rejected in Q2);
  affecting output formatters (out of scope by FR-001).

## R8. Testing strategy for lazy/cold/cancellation semantics

- **Decision**: New `test/unit/nesting/async/` suite asserting, per flow: (a) call site executes no
  work (SC-007); (b) `subscribe` emits exactly one value then `complete` (FR-001); (c) second
  `subscribe` re-runs (SC-008); (d) `unsubscribe` mid-flight emits nothing and leaves no shared
  state (SC-006); (e) contract violation emits `error`, expected outcome does not (FR-009);
  (f) emission deep-equals the frozen fixture (SC-002). Integration test composes two flows with an
  RxJS operator end-to-end.
- **Rationale**: One test per observable guarantee keeps failures attributable; reuses the existing
  Mocha + `tsx` toolchain (Constitution III).
- **Alternatives rejected**: a single mega-test (poor attribution); browser-only coverage (misses
  the Node gate).
