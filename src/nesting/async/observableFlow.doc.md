# `observeFlow`

Adapts an `async` nesting flow into a lazy, cold RxJS `Observable`.

## Contract

- **Lazy** — the factory is not invoked until a consumer subscribes. No work
  happens at the call site (FR-001).
- **Cold** — every subscription re-runs the factory. There is no caching, no
  `share`, no `shareReplay` and no multicast (FR-011, SC-008).
- **Single emission** — on success the observer receives exactly one `next`
  followed by `complete`.
- **Silent teardown** — `unsubscribe` aborts the internal `AbortController`;
  the subscriber receives no `next`, no `complete` and no `error` (FR-007).
- **Errors are contract violations only** — a factory rejection surfaces as an
  `error` notification (FR-009). Expected outcomes such as unplaced shapes are
  fields on the emitted value, never errors (FR-004, FR-008).
- **External signal chaining** — an optional caller-owned `external` signal is
  linked to the internal controller, so aborting it also cancels the work. The
  listener is removed on teardown and the caller's signal is never aborted by
  this wrapper (FR-007).

## Signature

```ts
function observeFlow<T>(
  factory: (signal: AbortSignal) => Promise<T>,
  external?: AbortSignal,
): Observable<T>
```
