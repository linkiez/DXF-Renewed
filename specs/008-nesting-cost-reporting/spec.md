# Feature Specification: Nesting Costing and Reporting

**Feature Branch**: `008-nesting-cost-reporting`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap costing and reporting workstream; specification refined from
`specs/008-nesting-cost-reporting/spec.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quote a Completed Nesting Job (Priority: P1)

A planner receives a transparent estimate from the completed layout and cut plan, using ERP-supplied
rates, before approving a quote or production release. The estimate shows, for every part and for the
whole job, what each cost category contributes.

**Why this priority**: Costs turn a technically valid layout into an operational decision.

**Independent Test**: Submit a completed artifact with all rates and verify the total equals the sum
of material, cutting, pierce, travel, consumable and labour components, and that the parts add up to
the job.

**Acceptance Scenarios**:

1. **Given** complete rates and a completed job, **When** a report is requested, **Then** it returns
   per-part and job totals with each contributing category.
2. **Given** a completed job, **When** the report is produced, **Then** the amounts of all parts add up
   exactly to the job total, for every category and for the grand total.
3. **Given** a job that uses a full sheet and a remnant, **When** the report is produced, **Then**
   material for each is shown separately and priced by its own caller-supplied value.
4. **Given** the same artifact and the same rates, **When** the report is requested again, **Then** the
   report is identical.

---

### User Story 2 - Know What Is Missing or Estimated (Priority: P2)

A planner can tell at a glance which parts of an estimate are complete, which cannot be calculated
because input is missing, and which rely on values the ERP marked as estimates, so no figure is
mistaken for a firm price.

**Why this priority**: A quote that silently invents or hides a gap is worse than no quote.

**Independent Test**: Request reports with a missing rate, a missing speed, a missing consumable life
and an estimate-marked value; verify each affected component is identified and no value is invented.

**Acceptance Scenarios**:

1. **Given** a missing rate or calibration, **When** a report is requested, **Then** it identifies the
   affected estimate as incomplete rather than inventing a value.
2. **Given** a value the ERP marked as an unverified estimate, **When** a report is requested, **Then**
   the value is used and every component that depends on it is marked as estimated.
3. **Given** any incomplete component, **When** the report is produced, **Then** the job total is not
   presented as final and the amount calculated so far is labeled as a partial subtotal.
4. **Given** an invalid rate (negative, not a number, or in a different currency), **When** a report is
   requested, **Then** it is rejected with a specific reason instead of being used.

---

### User Story 3 - Review the Production Report (Priority: P2)

A planner reads an operational summary of the job: sheets used, yield, total and per-category time,
and cost, linked to the artifact it came from.

**Why this priority**: Production needs the same facts the quote used, in operational terms.

**Independent Test**: Request a report for a multi-sheet artifact and verify per-sheet and job figures,
times by category, and the artifact identity.

**Acceptance Scenarios**:

1. **Given** a completed artifact with a cut plan, **When** a report is produced, **Then** it states
   the sheets used, the yield, and cutting, travel, pierce and total time per sheet and for the job.
2. **Given** an artifact with unplaced items, **When** a report is produced, **Then** the unplaced
   quantities are listed and not charged.
3. **Given** any report, **When** it is produced, **Then** it carries the artifact's correlation values
   and digests, and identifies the cost model it was calculated from.

---

### User Story 4 - Export to the ERP (Priority: P3)

An ERP integrator receives the report both as a self-contained structured result and as tabular
exports of fixed, documented columns, so the figures can be persisted, audited and loaded without
further calculation.

**Why this priority**: The ERP owns persistence and approval; the export is its input.

**Independent Test**: Export a report in both forms, read the tabular export back, and verify its
totals equal the structured result.

**Acceptance Scenarios**:

1. **Given** an ERP export request, **When** a report is produced, **Then** it provides a serializable
   artifact with correlation and audit values.
2. **Given** a report, **When** the tabular export is produced, **Then** it has one table per part and
   one per job, with documented columns in a stable order and a locale-independent number format.
3. **Given** a tabular export, **When** it is read back, **Then** its totals equal those of the
   structured report.

---

### Edge Cases

- Unplaced quantity is not charged as cut material and is reported as unplaced.
- A remnant's caller-supplied value is represented separately from a new full sheet.
- An artifact without a cut plan still gets its material estimate, and every cut-dependent component is
  marked as incomplete with the reason.
- A rejected artifact, an artifact without layout, or an unsupported contract version produces no
  report, only an explicit reason.
- A part with no cutting action (or no linked actions) is reported with zero cut-dependent amounts and
  a notice, not dropped.
- An action that refers to a part the artifact does not contain is reported as an inconsistency; its
  amounts are not lost: they are charged by distributing them over the parts of the same sheet and are
  listed separately, with component, scope and amount, so the job still shows what was distributed.
- A rate of zero is valid and yields a zero amount; an absent rate is not the same as zero.
- Several copies of one part are reported per copy and also in total for the part.
- Rounding never makes the sum of the parts differ from the job total.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST calculate material, cutting, pierce, travel, consumable and labour
  components from caller-supplied rates and completed artifact metrics.
- **FR-002**: The system MUST allocate relevant cost components to parts and total them for the job, so
  the allocations of the parts add up exactly to the job amount of every component.
- **FR-003**: The system MUST distinguish full-sheet and remnant material treatment.
- **FR-004**: The system MUST flag incomplete or uncalibrated cost input: a component whose required
  input is missing is marked incomplete and has no value, and a component that uses a value the caller
  marked as an unverified estimate is marked estimated.
- **FR-005**: The system MUST return report data in a form the ERP can persist and export.
- **FR-006**: The system MUST not store quotes, rates, reports or production history.
- **FR-007**: The system MUST derive amounts only from values the artifact and the cut plan already
  carry and from the supplied cost model; it MUST NOT recompute layout, sequence or metrics.
- **FR-008**: The system MUST estimate cutting, travel and pierce time from the lengths, counts and
  speeds or dwell values carried by the artifact, the cut plan and the supplied cost model, and report
  time per part, per sheet and for the job.
- **FR-009**: The system MUST calculate consumable cost from a caller-supplied usage-based life model
  (cost of the consumable and its life in pierces or cutting time), charging each use its share.
- **FR-010**: The system MUST calculate labour from caller-supplied rates applied to machine time and to
  caller-supplied handling time per sheet and per job.
- **FR-011**: The system MUST NOT charge unplaced quantities and MUST list them in the report with their
  reasons.
- **FR-012**: The system MUST report, for the job and for each sheet, the sheets used, the yield and
  waste as carried by the artifact, the time by category and the cost by category.
- **FR-013**: The system MUST include in every report the artifact's correlation values and input and
  output digests, a digest of the cost model used, and the contract version of the report.
- **FR-014**: The system MUST produce identical reports, including their digests, for identical
  artifact, cut plan and cost model.
- **FR-015**: The system MUST provide a tabular export with one table per part and one per job, with
  documented columns in a stable order and a locale-independent number format.
- **FR-016**: The system MUST validate the cost model and reject, with a specific reason, any negative or
  non-numeric rate, any life of zero or less, and any mix of currencies in one report.
- **FR-017**: The system MUST state an explicit, specific reason whenever no report or no component can
  be produced (rejected artifact, no layout, no cut plan, unsupported contract version, invalid cost
  model) and MUST NOT return a blank or silently partial result.
- **FR-018**: The system MUST express every amount exactly in the smallest unit of the caller's
  currency, applying deterministic rounding that keeps the parts reconciled to the job.

### Key Entities

- **Cost Model**: Caller-supplied rates, speeds, consumable life values, handling times, currency and
  estimate markers for a requested calculation.
- **Cost Breakdown**: Itemized per-part and job estimate, by category, with the status of each
  component (complete, estimated or incomplete).
- **Production Report**: Serializable operational summary linked to one artifact: sheets, yield, time,
  cost, unplaced items and notices. It is delivered as the `production` part of the cost report, which
  also carries the breakdown and the audit values.
- **Cost Notice**: An explicit message about an incomplete or estimated component, an invalid input, an
  inconsistency or an unavailable report, with its specific reason.
- **Export Table**: A tabular form of the report with fixed documented columns for parts or for the job.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of reports with complete rates reconcile exactly to their component totals, and the
  parts add up exactly to the job for every component.
- **SC-002**: 100% of reports with missing required input identify the affected estimate.
- **SC-003**: Every report contains the correlation and artifact digest needed for ERP audit.
- **SC-004**: 100 consecutive reports for the same artifact, cut plan and cost model are identical,
  digests included.
- **SC-005**: 100% of unplaced quantities are excluded from every charge and listed in the report.
- **SC-006**: A report for the 500-part reference job (the reference sheet of
  `007-nesting-simulation`, with its cut plan) is produced in under 1 second on the reference machine,
  worst of five consecutive runs.
- **SC-007**: 100% of tabular exports read back reproduce the totals of the structured report.
- **SC-008**: In 100% of runs the artifact, the cut plan and the cost model are identical before and
  after the calculation.

## Assumptions

- The ERP supplies costs, currencies, tax treatment and all commercial approvals; the report contains
  no tax and no price approval.
- Cost estimates do not replace actual production feedback captured by the ERP.
- The report consumes existing calculation artifacts: the artifact of `006-stateless-erp-contract`, the
  cut plan of `004-cut-path-planning` and the machine and process snapshots validated in
  `005-modular-post-processing`; it does not require a generated machine program.
- Material is allocated to parts in proportion to their net area, so the cost of the consumed stock,
  including waste, is distributed to the placed parts and added up to the job; waste is also reported
  separately as a figure.
- A remnant is priced at the value the caller supplies for it; leftover stock is not valued.
- One report uses a single currency, and amounts are exact in its smallest unit; where a split leaves a
  residual unit, it is assigned in a fixed, documented order so results are repeatable.
- Cutting, travel and pierce speeds or dwell values come from the cost model, except that the numeric
  `feed` and `dwell` values carried by an individual cut-plan action take precedence for that action;
  the process-profile snapshot of the artifact is not read. Absent values make the dependent estimate
  incomplete.
- A value is "estimated" when the caller marks it as an unverified estimate; the report never decides
  that on its own.
- Explanations of incomplete or estimated components are Brazilian Portuguese text with stable codes;
  tabular exports use a locale-independent number format and fixed column names.
- The reference machine is the one used for the measurements of `007-nesting-simulation`; its processor
  model and core count are recorded with every measurement, and the calculation runs in Node.js without
  graphics.
- Quote approval, persistence, history and consumable stock control remain external ERP operations.
