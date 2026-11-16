# Feature Specification: Nesting Simulation and Review

**Feature Branch**: `007-nesting-simulation`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap visual review workstream; specification refined from
`specs/007-nesting-simulation/spec.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review a Sheet Before Release (Priority: P1)

A planner opens a calculation artifact and inspects every sheet, every placed part and every
planned action before the ERP releases a machine program. The planner can tell exactly which
artifact is under review, which items were placed and which were not.

**Why this priority**: Production review catches layout and motion errors before material is
consumed. A static, complete review is already useful without playback.

**Independent Test**: Load a completed artifact and verify every placement and planned action is
visible, selectable and traceable to its part, and that the artifact's identity is shown.

**Acceptance Scenarios**:

1. **Given** a completed artifact, **When** a planner opens review, **Then** sheet boundaries
   and placements are visible, each placement marked as placed or as flagged when planning
   recorded a problem against it.
2. **Given** an artifact with several sheets, **When** the planner switches sheet, **Then** only that
   sheet's placements and actions are shown and the planner can return to any other sheet.
3. **Given** a partial artifact with unplaced items, warnings or rejections, **When** review opens,
   **Then** each one is listed with its specific reason and none is drawn as if it were placed.
4. **Given** any artifact, **When** review opens, **Then** its status, contract version, correlation
   values and input/output digests are shown so the planner can confirm which artifact is approved.
5. **Given** an environment without graphical acceleration, **When** review opens, **Then** the same
   placements, statuses and artifact identity are available through a static review.

---

### User Story 2 - Replay the Cut Plan (Priority: P2)

A planner replays the ordered cut plan of a sheet to verify the order of cutting, entry points,
tabs and rapid travel, and can jump directly to any step that looks wrong.

**Why this priority**: Motion errors such as unsafe travel or wrong cut order are only apparent
when the sequence is followed in order. It builds on the static review of Story 1.

**Independent Test**: Load an artifact with a cut plan, play it, pause it and seek to arbitrary
actions; verify the displayed tool position always matches the ordered planned actions.

**Acceptance Scenarios**:

1. **Given** a cut plan, **When** playback runs or is sought, **Then** the displayed tool position
   follows the ordered planned actions.
2. **Given** a cut plan, **When** the planner pauses, resets, changes speed or steps to the next
   pierce, **Then** the display reflects exactly that position and action.
3. **Given** any action in the plan, **When** the planner seeks directly to it, **Then** the
   display is identical to the one reached by playing from the start to that action.
4. **Given** the planned actions, **When** they are displayed, **Then** cut, rapid, pierce, lead,
   overcut and tab actions are visually distinguishable from each other.
5. **Given** a reduced-motion preference, **When** review opens, **Then** playback does not start
   automatically and every step remains reachable by explicit control or seeking.

---

### User Story 3 - Inspect a Part or Action (Priority: P2)

A planner selects a part or a planned action to see what it is, where it came from, how it is
placed and which process values apply, including any problem recorded against it.

**Why this priority**: Spotting a problem is only useful if the planner can identify the affected
part and trace it to its source in the ERP order.

**Independent Test**: Select a part and an action in a reference artifact and verify the shown
identity, orientation, placement and process information against the artifact data.

**Acceptance Scenarios**:

1. **Given** a selected part or action, **When** the planner inspects it, **Then** relevant identity,
   orientation and process information is shown.
2. **Given** a selected action, **When** it is inspected, **Then** its type, owning part and the
   process values the artifact carries for it (such as feed, power or dwell) are shown.
3. **Given** the planning stage recorded a problem against a part or action, **When** that part or
   action is shown or selected, **Then** the problem code and message are visible.
4. **Given** a selection, **When** the planner clears it or selects another item, **Then** the
   previous selection is released and the artifact is unchanged.

---

### User Story 4 - Review Without Pointer or Motion (Priority: P3)

A planner who cannot use a pointing device or animation reviews the same information through
keyboard control and a written summary.

**Why this priority**: Review is a release gate; it must remain usable for every planner and
every environment.

**Independent Test**: Complete a full review of a reference artifact using only the keyboard and
the written summary, with automatic motion disabled.

**Acceptance Scenarios**:

1. **Given** a loaded artifact, **When** review opens, **Then** a written summary of sheets, part
   count, yield and total cut length is available alongside the visual view.
2. **Given** keyboard-only use, **When** the planner navigates, **Then** switching sheet, playing,
   pausing, stepping, seeking, selecting and clearing a selection are all operable.

---

### Edge Cases

- A graphical acceleration failure, including one that occurs after review has started, retains a
  usable static review.
- Playback never starts automatically; with a reduced-motion preference, view changes (seek, sheet
  switch, zoom) also apply immediately without animated transitions.
- An artifact with a layout but no cut plan keeps static review available and states explicitly
  that playback and action inspection are unavailable.
- A rejected artifact with no layout shows its rejection reasons instead of an empty view.
- An artifact with an unsupported contract version or that fails contract validation is not
  rendered as valid; the specific reason is shown.
- A sheet with no placements shows its boundary and an explicit empty state.
- A zero-length or degenerate action stays in the ordered sequence, remains selectable and does
  not break playback or seeking.
- An action that refers to a part the artifact does not contain is flagged as inconsistent, not
  dropped.
- Where a part and an action overlap at the same point, selection resolves in a stable, documented
  order and the planner can reach the other item.
- An artifact larger than the reference size remains fully reviewable; no placement or action is
  omitted to preserve speed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present sheet, part placement and cut-plan information from an
  artifact, using only data the artifact carries; it MUST NOT recompute layout, sequence or metrics.
- **FR-002**: The system MUST distinguish cut, rapid, pierce, lead, overcut and tab actions visually,
  and the distinction MUST NOT rely on color alone.
- **FR-003**: The system MUST allow review of action order through playback (play, pause, reset,
  speed control, step to next pierce) and direct seeking to any action.
- **FR-004**: The system MUST identify a selected part's source and placement details, including the part
  identifier carried by the artifact together with the artifact's correlation values, and its
  rotation and position on its sheet.
- **FR-005**: The system MUST provide a usable fallback where graphical acceleration is unavailable
  or fails, with the same information as the accelerated review except animation smoothness.
- **FR-006**: The system MUST not alter the reviewed artifact or ERP release state.
- **FR-007**: The system MUST display the artifact's status, contract version, correlation values
  and input/output digests.
- **FR-008**: The system MUST list the artifact's warnings, rejections and unplaced items with their
  specific reasons, and MUST NOT draw unplaced items as placements.
- **FR-009**: The system MUST show, for a selected action, its type, owning part and the process
  values the artifact carries for it, and MUST show planning problems recorded against a part or
  action with their code and message.
- **FR-010**: The system MUST let the planner switch between the sheets of a multi-sheet artifact.
- **FR-011**: The system MUST state an explicit, specific reason whenever a review capability is
  unavailable (no cut plan, rejected artifact, unsupported version, invalid artifact) and MUST NOT
  present a blank or silently partial view.
- **FR-012**: The system MUST NOT start playback automatically in any configuration, including when
  the reduced-motion preference is set; MUST make every review function operable by keyboard,
  including selecting a part or action and seeking to any action; and MUST provide a written
  summary of sheets, part count, yield and total cut length.
- **FR-013**: The same artifact at the same playback position MUST always produce the same displayed
  state, independent of the interaction history that led to it.

### Key Entities

- **Review Scene**: A visual representation of one immutable artifact, composed of its sheets,
  placements and planned actions.
- **Action Marker**: A visible indication of a planned production action, distinguishable by type.
- **Selection**: The planner's temporary focus on a part or action; it carries no persisted state.
- **Playback Position**: The current point in the ordered action sequence of a sheet.
- **Review Notice**: An explicit message that reports a warning, rejection, unplaced item, planning
  problem or unavailable capability together with its specific reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of placements and cut actions in a completed artifact are reviewable.
- **SC-002**: A 500-part sheet opens for review in under 2 seconds on the baseline environment.
- **SC-003**: The fallback review is available for 100% of environments without acceleration.
- **SC-004**: Seeking to any action of the 500-part reference sheet updates the display in under
  500 milliseconds on the baseline environment.
- **SC-005**: For 100% of sampled positions in the reference plans, seeking directly to a position
  displays the same state as playing from the start to that position.
- **SC-006**: 100% of cases in which review is unavailable or partial (no cut plan, rejected
  artifact, unsupported version, unplaced items) show a specific reason, and none show a blank view.
- **SC-007**: 100% of review functions (switch sheet, play, pause, reset, step, seek, select, clear
  selection) can be completed with the keyboard alone.
- **SC-008**: In 100% of review sessions the artifact and its digests are identical before and
  after review.

## Assumptions

- The viewer is read-only and consumes existing calculation artifacts; it depends on the cut plan
  of `004-cut-path-planning` and the artifact of `006-stateless-erp-contract`.
- ERP release remains an external operation.
- The baseline environment is a reproducible reference configuration: a current desktop web browser
  run by the automated browser tests with software-rendered graphics (no graphics card), on a
  reference machine whose processor model and core count are recorded with every measurement. A
  measurement passes only when the worst of five consecutive runs meets the threshold.
- All user-facing text produced by the review is Brazilian Portuguese; messages carried by the
  artifact or the cut plan are shown exactly as received.
- The reference sheet is a sheet of 500 parts with holes, with its cut plan; larger artifacts are
  supported but are not gated by SC-002 or SC-004.
- A top-down two-dimensional view is the required review; a perspective or extruded view is
  optional and outside this specification.
- Review covers the machine-independent cut plan. Validation of generated machine programs
  (`005-modular-post-processing`) and any new dry-run validation are out of scope; problems
  already recorded in the artifact or cut plan are displayed, not re-derived.
- Review is an optional, additive capability: consumers that do not use it are unaffected, and any
  new runtime dependency it needs is governed by the project constitution and decided at planning.
- Cost and production reports are the scope of `008-nesting-cost-reporting`.
