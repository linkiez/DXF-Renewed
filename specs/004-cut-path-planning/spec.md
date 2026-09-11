# Feature Specification: Cut-Path Planning

**Feature Branch**: `004-cut-path-planning`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap cut-path workstream.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Plan a Safe Cut Sequence (Priority: P1)

A planner receives an ordered cutting plan for a nested sheet that keeps parts supported and avoids
unsafe travel before a machine program is generated.

**Why this priority**: Correct placement alone does not prevent dropped parts, poor edges or unsafe
movement.

**Independent Test**: Use a part with holes, outer contour and tabs; verify holes precede outer
contour, all required action markers are present and travel stays in sheet bounds.

**Acceptance Scenarios**:

1. **Given** a nested part with holes, **When** a cut plan is created, **Then** all inner contours
   are planned before its outer contour.
2. **Given** configured lead, pierce and tab values, **When** a cut plan is created, **Then** each
   selected contour carries the intended entry, cutting and exit actions.
3. **Given** a route crossing kept material, **When** validation runs, **Then** the route is reported
   for correction before program release.

### Edge Cases

- A lead that cannot fit without collision is rejected.
- Small holes may use a different valid entry rule supplied by the process profile.
- Shared-edge cutting is omitted when geometric verification fails.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create an ordered, machine-independent plan from a valid layout.
- **FR-002**: The system MUST plan inner contours before associated outer contours.
- **FR-003**: The system MUST represent rapid movement, piercing, lead-in/out, cutting, overcut and
  tabs whenever selected by the supplied process profile.
- **FR-004**: The system MUST choose entry points that meet the supplied clearance rules.
- **FR-005**: The system MUST reduce non-cut travel according to the selected sequencing policy.
- **FR-006**: The system MUST validate leads, tabs, travel paths and sheet bounds.
- **FR-007**: The system MUST use common-line cuts only after geometric validation.

### Key Entities

- **Cut Action**: One ordered movement or process operation.
- **Cut Plan**: The complete, traceable sequence for a sheet.
- **Lead and Tab**: Process-controlled entry/exit and temporary part-retention features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of reference plans cut inner features before outer contours.
- **SC-002**: Optimized sequences reduce rapid distance by at least 20% against drawing order.
- **SC-003**: 100% of rejected leads, tabs and rapids include an actionable validation reason.

## Assumptions

- The supplied process profile determines what cut features are appropriate.
- The plan is not itself a machine-specific program.
