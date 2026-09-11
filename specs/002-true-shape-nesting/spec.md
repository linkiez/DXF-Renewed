# Feature Specification: True-Shape Nesting

**Feature Branch**: `002-true-shape-nesting`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap workstreams A and B.

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
   configured material-use policy is applied consistently.
3. **Given** a part that cannot fit, **When** nesting completes, **Then** its requested quantity and
   explicit non-placement reason are returned.

### Edge Cases

- Holes may contain compatible smaller parts only when clearance is maintained.
- Grain-locked parts only use allowed orientations.
- A remnant smaller than the caller threshold is excluded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST place parts entirely within caller-supplied stock boundaries.
- **FR-002**: The system MUST prevent overlap between all placed part instances.
- **FR-003**: The system MUST support rectangular and irregular part placement.
- **FR-004**: The system MUST honor permitted orientations and grain restrictions.
- **FR-005**: The system MUST consider compatible caller-supplied remnants according to policy.
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
- **SC-003**: Applicable benchmark jobs reach at least 85% material use.

## Assumptions

- Inputs have passed part preparation.
- Stock availability and reservation remain owned by the ERP.
- This feature does not produce cutting instructions.
