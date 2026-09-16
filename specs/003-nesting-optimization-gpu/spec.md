# Feature Specification: Nesting Optimization and GPU Acceleration

**Feature Branch**: `003-nesting-optimization-gpu`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap optimization and acceleration workstreams.

## Clarifications

### Session 2026-09-15

- Q: Qual tecnologia de aceleração GPU será utilizada para a computação dos ninhos e packing? → A: WebGPU
- Q: Qual alvo mensurável de ganho de performance o caminho acelerado (WebGPU) deve atingir em relação ao baseline CPU no job de referência para ser considerado bem-sucedido? → A: Ganho relativo ≥2× vs baseline no job de referência; o baseline mantém <2 s (feature 002)
- Q: Quando o WebGPU estiver ativo, o resultado acelerado deve reproduzir exatamente o mesmo layout e as mesmas métricas do baseline CPU para a mesma seed? → A: Layout e métricas idênticos ao baseline para a mesma seed
- Q: Como o chamador fornece os pesos do "Optimization Objective" (material use, travel, sheet count, remnant) e qual a regra para pesos inválidos? → A: Quatro pesos numéricos finitos e ≥ 0, normalizados internamente para somar 1; erro explícito para peso negativo, NaN/não-finito ou soma zero
- Q: Como o chamador pede a aceleração WebGPU na chamada da API e qual o comportamento quando o campo é omitido? → A: Booleano opcional `acceleration` com default `true` (opt-out); omitido/`true` permite aceleração automática com fallback, `false` roda só no baseline CPU

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a Repeatable Optimization Trade-off (Priority: P1)

A planner chooses how to balance material use, sheet count, remnant preference and machine travel
and receives a repeatable valid result.

**Why this priority**: Different orders need different commercial trade-offs.

**Independent Test**: Run one job with fixed choices and seed twice; verify matching layout and
metrics, and verify no overlap.

**Acceptance Scenarios**:

1. **Given** an optimization objective, **When** nesting runs, **Then** the returned artifact shows
   the selected objective and its achieved metrics.
2. **Given** the same input and seed, **When** processing repeats, **Then** the same valid result is
   returned.

### User Story 2 - Benefit from Available Hardware (Priority: P2)

A planner can process large jobs faster when suitable hardware is available without changing
layout correctness or losing the ability to process the job elsewhere.

**Why this priority**: Acceleration improves throughput but must never become an availability risk.

**Independent Test**: Process the same reference job with acceleration available and unavailable;
verify both results pass the same placement validation and the unavailable case completes.

**Acceptance Scenarios**:

1. **Given** eligible work and available acceleration, **When** a large job runs, **Then** the
   artifact reports the selected backend and measured processing information.
2. **Given** unavailable or failed acceleration, **When** a job runs, **Then** it completes using
   the baseline path and reports the fallback reason.

### Edge Cases

- Near-equal candidate scores use a stable tie-break.
- An optimization objective with a negative, NaN or non-finite weight, or with all weights zero, is
  rejected with an explicit reason instead of being silently coerced.
- Acceleration loss during processing retries the unfinished work without discarding a valid job.
- When the caller opts out with `acceleration: false`, the job runs entirely on the CPU baseline and
  the backend report states that acceleration was not requested.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support caller-selected weighting of material use, travel, sheet count
  and remnant preference, supplied as exactly four finite numeric weights, each ≥ 0. The system MUST
  normalize the weights internally so the effective sum is 1, comparing with `EPSILON`.
- **FR-002**: The system MUST preserve valid, overlap-free placements throughout optimization.
- **FR-003**: The system MUST use the caller-provided seed for repeatable optimization choices, yielding identical `placements` and `sheets` on the CPU baseline and the accelerated path for the same seed.
- **FR-004**: The system MUST accept an optional boolean `acceleration` request field that defaults
  to `true`. When `true` or omitted, the system MUST detect acceleration automatically and prefer it
  when available; when `false`, the system MUST run entirely on the CPU baseline without attempting
  acceleration.
- **FR-005**: The system MUST retain the baseline calculation as final validation authority.
- **FR-006**: The system MUST fall back to the CPU baseline when acceleration is unavailable, lost (including mid-run), slow or invalid. When acceleration is lost mid-run it MUST retry unfinished work on the baseline without discarding already-completed placements. "Slow" is measurable: the accelerated path fails to reach the >=2x SC-004 gain on the reference job.
- **FR-007**: The system MUST return backend selection, timing and fallback information.

### Key Entities

- **Optimization Objective**: The caller-selected weights over material use, travel, sheet count and remnant preference (four finite fields, each >= 0, normalized to sum 1); validation and normalization are defined once in FR-001.
- **Execution Backend Report**: Selected calculation path, timings and fallback reason.
- **Acceleration Request**: Optional boolean `acceleration` field on the nest request, defaulting to
  `true`; `false` pins the run to the CPU baseline.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 consecutive equal requests with the same seed MUST return identical `placements` and `sheets` geometry and metrics, independent of the selected backend; only `backend.timings` (measurement metadata) may differ.
- **SC-002**: Every accelerated result passes the same final placement validation as baseline results.
- **SC-003**: 100% of unavailable-acceleration tests complete on the baseline path.
- **SC-004**: On the reference job (100 parts / 5 sheets, feature 002), the accelerated path is at least 2× faster than the CPU baseline, while the baseline itself stays under 2 s.
- **SC-005**: With `acceleration: false` (or `true` on a machine without acceleration), 100% of runs
  complete on the CPU baseline and report the selected backend and any fallback reason.

## Assumptions

- Hardware acceleration is optional and never required for production release.
- The optional acceleration path targets WebGPU; the CPU baseline remains the only required path.
- This feature does not change cut-program semantics.
