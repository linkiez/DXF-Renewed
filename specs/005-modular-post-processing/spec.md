# Feature Specification: Modular Laser and Plasma Post-Processing

**Feature Branch**: `005-modular-post-processing`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap post-processor workstream.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Release a Machine-Compatible Program (Priority: P1)

A planner selects a machine from the ERP and receives a reviewed cutting program that represents
its laser or plasma process requirements.

**Why this priority**: The final machine program is the production deliverable.

**Independent Test**: Submit the same valid cut plan for a laser and plasma profile; verify each
output is reviewed against its expected program and uses only supported machine features.

**Acceptance Scenarios**:

1. **Given** a valid plan and selected machine, **When** the planner requests output, **Then** the
   returned program identifies the chosen machine dialect and profile revision.
2. **Given** a plan using an unsupported machine capability, **When** output is requested, **Then**
   it is rejected or uses an approved equivalent identified in the artifact.
3. **Given** any program-validation error, **When** output is requested, **Then** no releasable
   program is returned without an explicit caller override.

### Edge Cases

- Machines that do not support curved movement receive an approved equivalent path or rejection.
- An unknown machine dialect cannot fall back to a different dialect silently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST select a post-processor from the caller-supplied machine profile.
- **FR-002**: The system MUST support laser and plasma process requirements independently.
- **FR-003**: The system MUST translate the same machine-independent cut plan through selectable
  processor variants without changing its intended order.
- **FR-004**: The system MUST validate bounds, movement, feed, entry and required process settings
  before returning a releasable program.
- **FR-005**: The system MUST identify processor name and version in the returned artifact.
- **FR-006**: The system MUST support reviewed expected outputs for every approved processor variant.
- **FR-007**: The system MUST surface unsupported capability and calibration issues explicitly.

### Key Entities

- **Machine Profile**: ERP-provided physical machine and supported capability selection.
- **Post-Processor**: A versioned translation and validation variant for a machine family.
- **Machine Program**: The validated output released for production review.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every approved processor output matches its reviewed expected output.
- **SC-002**: 100% of invalid plans are blocked from automatic release.
- **SC-003**: Every returned program identifies its processor and process profile revisions.

## Assumptions

- The ERP/operator supplies approved machine behavior and process calibration.
- Unknown vendor instructions are never inferred.
