# Feature Specification: True-Shape Nesting

**Feature Branch**: `002-true-shape-nesting`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap workstreams A and B.

## Clarifications

### Session 2026-09-12

- Q: When a part can fit in more than one eligible stock item, which criterion decides? (FR-005) → A: Global yield — the engine evaluates combinations of stock items and placements and keeps the arrangement that maximizes total material use across the job, rather than committing greedily to the smallest accommodating item.
- Q: Which orientations may a part be rotated to during nesting? (FR-004) → A: The caller supplies the permitted rotation list, defaulting to 0/90/180/270 when omitted; grain-locked parts are restricted to the subset aligned with their grain direction.
- Q: How should the engine bound the global-yield search so a 100-part job still returns within the 2-second limit while keeping identical results for identical input and seed? (FR-005, SC-002, FR-007) → A: Deterministic budget of iterations/nodes derived from the input size (never wall-clock time), calibrated so the 100-part fixture stays under 2 seconds; the best arrangement found within the budget wins, ties broken by a stable deterministic order.
- Q: Where does the clearance value used for bounds and overlap checks come from, and what must it apply to? (FR-001, FR-002) → A: The caller supplies two separate clearances per job — an edge clearance applied between every part instance and any stock boundary (outer sheet edge and hole contours), and a part-to-part clearance applied between any two placed part instances. Both are absolute distances in the same unit as the input geometry.
- Q: What defines an "applicable benchmark job" for the 85% material-use target, given the search may stop at the deterministic budget rather than the exact optimum? (SC-003) → A: The same 100-part / 5-sheet fixture named by SC-002 is the benchmark; 85% is a hard acceptance floor measured as placed part area divided by consumed stock area. Exhausting the deterministic budget below that floor fails SC-003 and the budget calibration is the defect to fix, with no inapplicability exception.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fit Parts Into Available Stock (Priority: P1)

A planner provides prepared parts and available stock and receives an overlap-free layout that
maximizes the practical use of supplied material.

**Why this priority**: It delivers the core economic value of nesting.

**Independent Test**: Submit irregular parts and one sheet; verify every placement is in bounds,
no placements overlap, and non-fitting parts are identified.

**Acceptance Scenarios**:

1. **Given** compatible parts and stock, **When** nesting is requested, **Then** each placement
   identifies its sheet, position and orientation.
2. **Given** multiple eligible sheets and remnants, **When** nesting is requested, **Then** the
   stock selection maximizes total material use across the whole job, with deterministic
   tie-breaking between equally yielding arrangements.
3. **Given** a part that cannot fit, **When** nesting completes, **Then** its requested quantity and
   explicit non-placement reason are returned.

### Edge Cases

- Holes may contain compatible smaller parts only when the edge clearance to the hole contour and
  the part-to-part clearance to neighbouring instances are both maintained.
- Grain-locked parts only use the allowed orientations that are aligned with their
  grain direction.
- A remnant smaller than the caller threshold is excluded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST place parts entirely within caller-supplied stock boundaries,
  maintaining at least the caller-supplied edge clearance from every stock boundary — both
  the outer sheet edge and any hole contour.
- **FR-002**: The system MUST prevent overlap between all placed part instances and MUST maintain
  at least the caller-supplied part-to-part clearance between the boundaries of any two placed
  instances, including instances placed inside a hole.
- **FR-003**: The system MUST support rectangular and irregular part placement.
- **FR-004**: The system MUST rotate parts only to orientations in the caller-supplied
  permitted rotation list, defaulting to 0/90/180/270 when the list is omitted; parts
  marked grain-locked MUST be restricted to the subset of those orientations aligned
  with the declared grain direction.
- **FR-005**: The system MUST select stock items and placements so as to maximize total
  material yield across the job, evaluating alternative placements rather than committing
  to a per-part greedy choice; equally yielding arrangements MUST be resolved in a stable,
  deterministic order. The search MUST be bounded by a deterministic budget of iterations or
  nodes derived from the input size, MUST NOT depend on wall-clock time, and MUST be calibrated
  so that a 100-part job returns within 2 seconds.
- **FR-006**: The system MUST report sheet use, material yield, waste and all unplaced quantities.
- **FR-007**: The system MUST make identical placement decisions for identical inputs and seed.

### Key Entities

- **Stock Sheet**: Available full sheet or remnant with material and boundary information.
- **Placement**: One part instance assigned to one sheet with position and orientation.
- **Nesting Result**: Layout, yield, waste and unplaced quantities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All approved layouts contain zero overlaps and zero out-of-bound placements.
- **SC-002**: A 100-part mixed job returns a valid result or explicit reasons in under 2 seconds.
- **SC-003**: On the 100-part / 5-sheet fixture named by SC-002, material use — placed part area
  divided by consumed stock area — MUST reach at least 85%. This is a hard acceptance floor: a run
  that exhausts the FR-005 deterministic budget below 85% on that fixture fails this criterion, and
  the budget calibration is the defect rather than the threshold.

## Assumptions

- Inputs have passed part preparation.
- Stock availability and reservation remain owned by the ERP.
- Material-use policy is fixed to global yield maximization across the job under a
  deterministic input-derived iteration budget; the exact optimum is not guaranteed once the
  budget is exhausted. This feature exposes no caller-supplied strategy enum.
- The 100-part / 5-sheet fixture named by SC-002 is the single benchmark corpus for SC-003; this
  feature introduces no external or versioned benchmark set.
- This feature does not produce cutting instructions.
