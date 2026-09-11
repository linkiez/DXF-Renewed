# Feature Specification: Nesting Costing and Reporting

**Feature Branch**: `008-nesting-cost-reporting`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap costing and reporting workstream.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quote a Completed Nesting Job (Priority: P1)

A planner receives a transparent estimate from the completed layout and cut plan, using ERP-supplied
rates, before approving a quote or production release.

**Why this priority**: Costs turn a technically valid layout into an operational decision.

**Independent Test**: Submit a completed artifact with all rates and verify the total equals the sum
of material, cutting, pierce, travel, consumable and labour components.

**Acceptance Scenarios**:

1. **Given** complete rates and a completed job, **When** a report is requested, **Then** it returns
   per-part and job totals with each contributing category.
2. **Given** a missing rate or calibration, **When** a report is requested, **Then** it identifies
   the affected estimate as incomplete rather than inventing a value.
3. **Given** an ERP export request, **When** a report is produced, **Then** it provides a serializable
   artifact with correlation and audit values.

### Edge Cases

- Unplaced quantity is not charged as cut material.
- A remnant's caller-supplied value is represented separately from a new full sheet.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST calculate material, cutting, pierce, travel, consumable and labour
  components from caller-supplied rates and completed artifact metrics.
- **FR-002**: The system MUST allocate relevant cost components to parts and total them for the job.
- **FR-003**: The system MUST distinguish full-sheet and remnant material treatment.
- **FR-004**: The system MUST flag incomplete or uncalibrated cost input.
- **FR-005**: The system MUST return report data in a form the ERP can persist and export.
- **FR-006**: The system MUST not store quotes, rates, reports or production history.

### Key Entities

- **Cost Model**: Caller-supplied rates and assumptions for a requested calculation.
- **Cost Breakdown**: Itemized per-part and job estimate.
- **Production Report**: Serializable operational summary linked to one artifact.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of reports with complete rates reconcile exactly to their component totals.
- **SC-002**: 100% of reports with missing required input identify the affected estimate.
- **SC-003**: Every report contains the correlation and artifact digest needed for ERP audit.

## Assumptions

- The ERP supplies costs, currencies, tax treatment and all commercial approvals.
- Cost estimates do not replace actual production feedback captured by the ERP.
