# Feature Specification: Modular Laser and Plasma Post-Processing

**Feature Branch**: `005-modular-post-processing`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap post-processor workstream.

## Clarifications

### Session 2026-09-16

- Q: What artifact format should the post-processors return for machine programs? → A: G-code
- Q: How must a caller authorize release when the generated G-code has validation errors? → A: Never allow release when any validation error exists
- Q: How should the system identify which post-processor to use from the caller-supplied machine profile? → A: Machine profile explicitly provides processor identifier and revision
- Q: When a machine does not support curved movement, should the post-processor linearize the curve or reject the program? → A: Linearize curves with a profile-provided approved tolerance; reject when unavailable
- Q: How should generated G-code be compared with each processor’s reviewed expected output? → A: Exact comparison of canonicalized G-code text

The approved processor variants for this feature are generic laser, generic plasma, and
Hypertherm EDGE Connect `edge-connect` revision `809550-rev6`, using only the directly supported
EIA RS-274D subset documented in `docs/Hypertherm EDGE PRO Programmer reference.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Release a Machine-Compatible Program (Priority: P1)

A planner selects a machine from the ERP and receives a reviewed cutting program that represents
its laser or plasma process requirements.

**Why this priority**: The final machine program is the production deliverable.

**Independent Test**: Submit the same valid cut plan for laser, plasma, and EDGE Connect profiles;
verify each output is reviewed against its expected program and uses only supported machine
features.

**Acceptance Scenarios**:

1. **Given** a valid plan and selected machine, **When** the planner requests output, **Then** the
   returned program identifies the chosen machine dialect and profile revision.
2. **Given** a plan using an unsupported machine capability, **When** output is requested, **Then**
   it is rejected unless the selected processor documents a deterministic approved equivalent in
   its metadata; an equivalent output must still pass every validation rule.
3. **Given** any program-validation error, **When** output is requested, **Then** no releasable
   program is returned.

### Edge Cases

- Machines that do not support curved movement receive an approved equivalent path or rejection.
- An unknown machine dialect cannot fall back to a different dialect silently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST select the post-processor identified by the caller-supplied machine profile,
  including its processor identifier and revision.
- **FR-002**: The system MUST support laser and plasma process requirements independently.
- **FR-003**: The system MUST translate the same machine-independent cut plan through selectable
  processor variants without changing its intended order.
- **FR-004**: The system MUST validate bounds, movement, feed, entry and required process settings
  before returning a releasable program, and MUST reject release when any validation error exists.
- **FR-004a**: When curved movement is unsupported, the system MUST linearize it only with an
  approved tolerance supplied by the machine profile; otherwise it MUST reject the program.
- **FR-005**: The system MUST return rendered G-code and identify the processor name, processor
  identifier, processor version, and process profile revision in the result metadata. The processor
  name is the canonical human-readable name associated with the processor identifier.
- **FR-006**: The system MUST support reviewed expected outputs for every approved processor variant
  and compare canonicalized G-code text exactly, including command order.
- **FR-007**: The system MUST surface unsupported capability and calibration issues explicitly.
- **FR-008**: The system MUST use input-derived deterministic budgets for curve linearization and
  validation; no wall-clock performance target or implicit machine-size limit is part of this
  feature.

### Key Entities

- **Machine Profile**: ERP-provided physical machine, supported capability selection, and explicit
  processor identifier and revision.
- **Post-Processor**: A versioned translation and validation variant for a machine family.
- **Machine Program**: The validated output released for production review.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every approved processor output matches its reviewed expected output.
- **SC-002**: 100% of invalid plans are blocked from automatic release.
- **SC-003**: Every returned program identifies its processor and process profile revisions.
- **SC-004**: Every approved processor variant has a deterministic unit/golden test covering its
  supported output and its unsupported-capability rejection behavior.

## Assumptions

- The ERP/operator supplies approved machine behavior and process calibration.
- Unknown vendor instructions are never inferred.
