# Phase 0 — Research: Nesting Optimization & GPU Acceleration

All `NEEDS CLARIFICATION` items from the Technical Context are resolved here. Each decision records
what was chosen, why, and what was rejected.

## D1 — Accessing acceleration without a new dependency

- **Decision**: probe `globalThis.navigator?.gpu` at runtime and use only local structural
  interfaces (`GPUAdapterLike`, `GPUDeviceLike`, `GPUBufferLike`) declared in
  `optimization/webgpu/device.ts`. The kernel is loaded only when acceleration is requested and the
  probe succeeds.
- **Rationale**: Constitution V forbids new runtime `dependencies`; `navigator.gpu` is absent in
  Node by default, which keeps the CPU baseline the guaranteed path. `@webgpu/types` may be used as
  a dev-only typing aid but is not required at runtime.
- **Alternatives considered**: adding `@webgpu/types` to `dependencies` (violates V); adding a Node
  WebGPU package (violates V and couples to a platform).

## D2 — Determinism across backends

- **Decision**: the GPU is a *proposal* engine. It computes candidate scores in fixed-point
  integers and returns them in stable index order; the CPU performs the final compare, the stable
  tie-break, and validation of every placement.
- **Rationale**: satisfies FR-003/SC-001 (identical layout and metrics for the same seed on any
  backend) and Constitution IV; floating-point reduction order inside a shader is not portable
  across drivers.
- **Alternatives considered**: running the whole search on the GPU (driver-dependent rounding →
  non-deterministic); accepting "equivalent metrics" instead of an identical layout (rejected by
  clarification Q3).

## D3 — Budget stays derived from the input

- **Decision**: keep the input-derived evaluation budget in both backends; acceleration changes how
  fast candidates are scored, never how many are scored.
- **Rationale**: Constitution IV forbids wall-clock search budgets. SC-004 measures wall-clock time
  only in the acceptance test, never inside the search.
- **Alternatives considered**: time-boxed GPU kernels (non-deterministic; rejected).

## D4 — "Slow" fallback trigger

- **Decision**: "slow" is the FR-006/SC-004 definition — the accelerated path failing to reach a
  >=2x gain versus the baseline on the reference job. A run that cannot demonstrably beat the
  baseline abandons acceleration and completes on the CPU baseline.
- **Rationale**: makes FR-006 testable and keeps acceleration strictly optional.
- **Alternatives considered**: an absolute per-job second budget (hardware-dependent; rejected).

## D5 — Opt-out request contract

- **Decision**: `acceleration?: boolean`, default `true`. `false` runs entirely on the CPU baseline;
  omitted or `true` detects acceleration automatically and falls back transparently. Existing
  feature-002 callers therefore keep identical results (clarification Q3) even when acceleration is
  attempted.
- **Rationale**: matches FR-004 and keeps the API additive.
- **Alternatives considered**: a `'webgpu' | 'none'` enum or a required field (needless surface).

## D6 — Objective weight contract

- **Decision**: exactly four finite numeric weights (material use, travel, sheet count, remnant),
  each >= 0, normalized internally to sum 1; comparisons use `EPSILON`; invalid weights (negative,
  `NaN`, non-finite, or all zero) return an explicit reason instead of being coerced.
- **Rationale**: removes scale ambiguity, keeps the objective deterministic, and honours the
  "silent failure forbidden" rule.
- **Alternatives considered**: requiring the caller to pre-normalize (more error-prone); an enum of
  presets (does not satisfy FR-001).

## D7 — Module boundaries and file size

- **Decision**: `optimization/webgpu/{device,score}.ts` and `optimization/{objective,backend}.ts`,
  each under 500 lines and each with a purpose header comment.
- **Rationale**: Constitution coding conventions.
- **Alternatives considered**: one `optimization.ts` (would exceed the 500-line cap as kernels grow).

## D8 — Verification without WebGPU hardware in CI

- **Decision**: unit tests inject a fake backend through the same structural interface, and the
  integration test asserts the fallback path on a machine without `navigator.gpu`. The SC-004 2x
  gate is measured only where a real adapter is present; elsewhere the test records and skips it.
- **Rationale**: keeps the acceleration path testable without new dependencies while never letting
  an unavailable adapter fail the CPU baseline.
- **Alternatives considered**: requiring WebGPU-capable CI runners (availability risk; rejected).
