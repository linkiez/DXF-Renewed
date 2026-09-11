# Feature Specification: Nesting Optimization and GPU Acceleration

**Feature Branch**: `003-nesting-optimization-gpu`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap optimization and acceleration workstreams.

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
- Acceleration loss during processing retries the unfinished work without discarding a valid job.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support caller-selected weighting of material use, travel, sheet count
  and remnant preference.
- **FR-002**: The system MUST preserve valid, overlap-free placements throughout optimization.
- **FR-003**: The system MUST use a caller-provided seed for repeatable optimization choices.
- **FR-004**: The system MUST detect optional acceleration automatically when requested.
- **FR-005**: The system MUST retain the baseline calculation as final validation authority.
- **FR-006**: The system MUST fall back when acceleration is unavailable, lost, slow or invalid.
- **FR-007**: The system MUST return backend selection, timing and fallback information.

### Key Entities

- **Optimization Objective**: Caller-selected weights for competing layout outcomes.
- **Execution Backend Report**: Selected calculation path, timings and fallback reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 consecutive equal requests return identical results.
- **SC-002**: Every accelerated result passes the same final placement validation as baseline results.
- **SC-003**: 100% of unavailable-acceleration tests complete on the baseline path.

## Assumptions

- Hardware acceleration is optional and never required for production release.
- This feature does not change cut-program semantics.
