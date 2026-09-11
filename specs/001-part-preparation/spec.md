# Feature Specification: Part Preparation

**Feature Branch**: `001-part-preparation`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap workstream A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prepare Cuttable Parts (Priority: P1)

A planner submits drawing geometry and receives cuttable parts with clear boundaries, holes and
warnings before material is allocated.

**Why this priority**: Every later nesting and cutting decision depends on trustworthy part geometry.

**Independent Test**: Submit closed, open, duplicated and self-crossing contours and verify the
result either produces a classified part or a clear rejection reason.

**Acceptance Scenarios**:

1. **Given** a closed outer boundary with inner boundaries, **When** it is prepared, **Then** the
   outer boundary, holes and islands are distinguished correctly.
2. **Given** a safely repairable boundary, **When** it is prepared, **Then** the returned part
   identifies the repair and remains suitable for cutting.
3. **Given** an unsafe or open boundary, **When** it is prepared, **Then** it is rejected with a
   reason that identifies the affected source geometry.

### Edge Cases

- A boundary with zero usable area is rejected.
- Features smaller than the requested cut width are flagged for review.
- A gap within the caller's tolerance may be closed; larger gaps are not changed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST identify closed outer boundaries, holes, islands and open boundaries.
- **FR-002**: The system MUST preserve source traceability for every returned or rejected boundary.
- **FR-003**: The system MUST remove duplicate and redundant boundary points without changing the
  intended part shape beyond caller-defined tolerance.
- **FR-004**: The system MUST repair only safely repairable boundaries and report every repair.
- **FR-005**: The system MUST apply caller-supplied cut-width allowance consistently to outer and
  inner boundaries.
- **FR-006**: The system MUST return warnings for minimum-feature, area and closure conditions.
- **FR-007**: The system MUST produce the same prepared result for identical inputs and tolerance.

### Key Entities

- **Source Geometry**: Traceable drawing content supplied by the ERP or planner.
- **Prepared Part**: A cuttable item with outer boundary, inner boundaries and geometric properties.
- **Preparation Issue**: A warning or rejection reason tied to source geometry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid reference parts retain correct outer/hole classification.
- **SC-002**: 100% of invalid reference parts return a specific issue rather than an unusable part.
- **SC-003**: Prepared output is identical across 100 runs of the same input.

## Assumptions

- Input drawings are planar and use supported entity types.
- The ERP supplies all tolerance and process allowances.
- This feature does not store or alter source drawings.
