# Feature Specification: Nesting Layout Editing and Cut Risk Simulation

**Feature Branch**: `010-nesting-edit-physics`
**Created**: 2026-11-16
**Status**: Draft
**Input**: User description: "quero edicao e simulacao fisica de corte". Decisions taken with the
requester: editing covers the position of placed parts; the physical simulation covers thermal and
mechanical risks; fidelity is indicative and rule based.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reposition Parts With Instant Validity Feedback (Priority: P1)

A planner reviewing a finished nesting drags, nudges, rotates or mirrors a placed part on its sheet to
fix something the automatic nesting could not know (a flaw in the stock, a part that must sit near the
edge, a better spot for a heavy part). While the part moves, the review shows at once whether the spot
is valid and, if not, exactly why. An invalid spot can never be confirmed.

**Why this priority**: Manual correction of a nesting is the most requested capability of a review tool
and the foundation of every other story here. Without trustworthy validity feedback an edit is a risk.

**Independent Test**: Open a reference artifact, move one part in small steps across the sheet, over a
neighbour, past the sheet edge, into a margin and into a forbidden zone, and verify each step reports
the right verdict and reason, and that only valid positions can be confirmed.

**Acceptance Scenarios**:

1. **Given** a reviewed sheet, **When** the planner moves a part to a free area inside the usable
   region, **Then** the position is reported valid and can be confirmed.
2. **Given** a part being moved, **When** its outline overlaps another part, leaves the usable area,
   enters a forbidden zone or breaks the minimum spacing between parts, **Then** the review names every
   violation with the parts or zones involved and refuses to confirm the position.
3. **Given** a part that allows only some rotations or has a grain direction, **When** the planner
   rotates or mirrors it, **Then** only the allowed orientations can be confirmed and a refused one says
   which rule forbids it.
4. **Given** one or more confirmed edits, **When** the planner undoes and redoes them, **Then** the
   layout returns exactly to each earlier and later state.
5. **Given** a keyboard-only user, **When** they select a part and enter a move or rotation as a
   number or with the arrow keys, **Then** the same validity feedback is announced in text.

---

### User Story 2 - Get an Edited, Traceable Result With Fresh Consequences (Priority: P1)

After editing, the planner needs the cut plan, the cost and the validations to reflect the new layout,
and needs a result that the ERP can trust: the edited layout as a new artifact that refers to the
original, lists every edit and carries its own digest. Anything not yet recomputed must never look
current.

**Why this priority**: An edit that leaves a stale cut plan or quote is worse than no edit. Traceability
is what lets an edited nesting go back to production.

**Independent Test**: Edit one part, confirm that plan, cost and risk figures are marked outdated at
once, recompute them, and verify the edited artifact refers to the original digest, lists the edit and
reproduces byte for byte when the same edits are replayed.

**Acceptance Scenarios**:

1. **Given** a confirmed edit, **When** the planner looks at the cut plan, cost or risk figures,
   **Then** each is marked outdated until it is recomputed from the edited layout.
2. **Given** an edited layout, **When** the planner asks for the edited result, **Then** a new artifact
   is produced with a reference to the original artifact and its digest, the ordered list of edits and a
   digest of its own, and the original is unchanged.
3. **Given** the same artifact and the same ordered edits, **When** the result is produced twice,
   **Then** both artifacts and digests are identical.
4. **Given** an edit that makes the cut plan impossible to recompute, **When** recomputation runs,
   **Then** the reasons are shown, the edited layout is kept and the plan is marked unavailable instead of
   showing an old one.
5. **Given** an edited layout, **When** the planner compares it with the original, **Then** a summary
   shows the change in validity, cut time, cost and number of risks per category.

---

### User Story 3 - Assess Thermal and Mechanical Cutting Risks (Priority: P2)

Before releasing a job, the planner asks the review to assess the cut plan for the risks that ruin
parts and sheets in laser and plasma cutting: heat building up in a region, thin webs between parts,
small parts that come free and can move or tip up, and the cutting head passing close to a part that
has come free and can be struck. The assessment is an indicative, rule-based estimate driven by a technology
profile that the caller supplies, and it never claims more than that.

**Why this priority**: Catching a risky sequence on screen is cheaper than scrapping a sheet, but the
result is only indicative, so it comes after reliable editing and traceability.

**Independent Test**: Assess reference jobs built to contain each risk (a dense cluster cut in
sequence, a thin web, a small part freed early, head travel over a freed part) and one safe job, and
verify each risk is found with its category, location and reason, and the safe job has no critical
finding.

**Acceptance Scenarios**:

1. **Given** a cut plan and a technology profile with the needed limits, **When** the assessment runs,
   **Then** a report lists each finding with category, severity, the part or area, the moment in the cut
   sequence, the measured value and the limit it was compared with.
2. **Given** a technology profile missing a limit a rule needs, **When** the assessment runs, **Then**
   that rule is reported as not assessable with the missing input named, and no value is invented.
3. **Given** a finding, **When** the planner opens it, **Then** the review explains the reason in plain
   language and suggests a mitigation (for example reorder the cut, spread the parts, add a micro-joint)
   without applying it.
4. **Given** a job with no findings, **When** the assessment runs, **Then** the report says what was
   assessed and states that it is indicative and does not replace a test cut.

---

### User Story 4 - See the Risk Unfold During Playback (Priority: P2)

While replaying the cut, the planner sees where heat accumulates, the moment each part becomes free,
and where the head is about to pass over a free or risky part, with markers on the timeline to jump
to each. After an edit the planner replays again and sees whether the risk went away.

**Why this priority**: A list of findings is hard to act on; seeing them in time and place lets the
planner choose the edit that fixes them.

**Independent Test**: Play a reference job with known risks, verify the heat view, the freed-part
moments and the timeline markers appear at the right places, then edit to remove a risk, recompute and
verify the marker is gone.

**Acceptance Scenarios**:

1. **Given** an assessed job, **When** the planner plays or seeks the cut, **Then** the accumulated heat
   view and the freed parts at that moment are shown, in both the static and the accelerated views.
2. **Given** findings, **When** the planner uses the timeline, **Then** each finding has a marker that
   jumps to its moment and selects the part or area involved.
3. **Given** a user who prefers reduced motion or cannot rely on colour, **When** the risk views are
   shown, **Then** the same information is available without animation and without colour alone.
4. **Given** an edit that resolves a finding, **When** the assessment is recomputed, **Then** that
   finding no longer appears and the comparison shows the change.

### Edge Cases

- A part moved so that it touches the exact limit of the usable area or of the minimum spacing: the
  limit is treated as valid within the library tolerance, never by a hidden margin.
- A part that encloses other placed parts in its holes: the edit moves the whole group together, or is
  refused with the reason when any member of the group would be invalid.
- A part that shares a common cut line with a neighbour: moving it breaks the shared line, and the
  recomputation reports the consequence instead of silently keeping the saving.
- An artifact without a cut layout or with approximate outlines: validity uses the placement outlines,
  every verdict that depends on them is marked approximate and the user is told.
- An edit that moves a part off its sheet or to another sheet: moving to another sheet is not offered
  and a position outside the sheet is refused.
- A sheet with remnants or parts already cut in an earlier job: those areas are forbidden zones when the
  request supplies them.
- No confirmed edits: the edited result equals the original and the same digest is produced.
- A sheet or a cut plan larger than the reference size: results stay correct and complete, nothing is
  truncated; the time targets are acceptance gates for the reference size only.
- A technology profile that is invalid or from another process: the assessment is unavailable with the
  reasons; editing keeps working.
- A user edits while a recomputation is running: the figures that were started are discarded as outdated
  and the user is told.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let the user reposition each placed part of a reviewed sheet by moving,
  rotating and mirroring it, using a pointer or the keyboard with numeric entry, without changing the
  input artifact or any caller-supplied object.
- **FR-002**: The system MUST judge every candidate position against overlap with other parts, the usable
  sheet area and margins, forbidden zones, the minimum spacing between parts and the part's allowed
  rotations, mirroring and grain direction, and MUST report each violation with its reason and the
  parts or zones involved.
- **FR-003**: The system MUST never confirm a position that has a violation, and MUST leave the part in
  its last valid position when a position is refused.
- **FR-004**: The system MUST provide undo and redo for confirmed edits, for at least 100 steps, with the
  layout exactly as it was at each step.
- **FR-005**: The system MUST keep an ordered edit log (part, previous position, new position, edit
  kind) and include it in the edited result.
- **FR-006**: The system MUST mark the cut plan, the cost, the validations and the risk figures as
  outdated at the first confirmed edit and MUST NOT present any of them as current until recomputed from
  the edited layout. Until the cut plan is recomputed, the review MUST NOT draw the old cut path over
  the edited parts; it hides that path and says that the plan is outdated.
- **FR-007**: The system MUST recompute the cut plan, the cost and the validations of an edited layout on
  request, reusing the existing planning, costing and validation capabilities, and MUST show the reasons
  when a recomputation cannot be completed.
- **FR-008**: The system MUST produce the edited result as a new artifact that refers to the original
  artifact and its digest, carries the edit log and a digest of its own, and is identical for identical
  inputs and ordered edits.
- **FR-009**: The system MUST assess a cut plan for four indicative risk categories: heat accumulation in
  a region (`heat`), thin webs between parts or between a part and an edge or hole (`thin-web`), small
  parts that become free and may move or tip up (`loose-part`), and the cutting head passing close to a
  loose part after it has come free (`head-strike`).
- **FR-010**: The system MUST take every limit used by the assessment (such as heat thresholds, minimum
  safe web, small-part size, head clearance and cooling allowance) from a technology profile supplied
  by the caller, MUST report a rule as not assessable when its limit is missing, and MUST NOT invent a
  default value.
- **FR-011**: Every risk finding MUST state its category, severity, the part or area, the moment in the
  cut sequence, the measured value and the limit it was compared with, and MUST offer a mitigation
  suggestion in words that is never applied automatically.
- **FR-012**: The system MUST state in every risk report that the result is indicative and does not
  replace a test cut, and MUST report how many rules were assessed and how many were not.
- **FR-013**: The review MUST show, during playback and seeking, the accumulated heat, the parts that are
  free at that moment and the markers of the findings, in both the static and the accelerated views,
  with a timeline marker for each finding that jumps to its moment and selects what it concerns.
- **FR-014**: The review MUST present a comparison between the edited layout and the original: validity,
  cut time, cost and the number of findings per category.
- **FR-015**: Every edit and risk function MUST be operable without a pointer, announced as text for
  assistive technology, and MUST NOT convey risk by colour alone; reduced motion MUST be respected.
- **FR-016**: Text shown to users MUST be Brazilian Portuguese from one place; codes and field names
  stay in English and stable.
- **FR-017**: The validity of a position and the assessment MUST be deterministic: identical inputs and
  identical ordered edits give identical verdicts, findings and digests, with no dependence on time or
  random values.
- **FR-018**: The system MUST report every gap (approximate outline, missing profile limit, failed
  recomputation, unavailable assessment) as a visible notice and MUST NOT fail silently.
- **FR-019**: The capability MUST be additive to the existing public surface, add no runtime dependency,
  and store nothing: edits live in the session and leave only through the edited result.

### Key Entities

- **Edit Session** (the edit state of the plan): A reviewed artifact together with the ordered confirmed edits, the undo and redo
  positions and the freshness of each derived result.
- **Part Edit**: One move, rotation or mirror of a placed part, with the part key, the previous and new
  placement and the edit kind.
- **Placement Verdict**: The result of judging one candidate position: valid or not, the list of
  violations and whether any verdict depends on an approximate outline.
- **Edit Log**: The ordered list of confirmed edits carried by the edited result.
- **Edited Artifact**: The new artifact holding the edited layout, a reference to the original artifact
  and its digest, the edit log and its own digest.
- **Technology Profile (risk limits)** (the cut risk profile of the plan): The caller-supplied material, thickness and process limits the
  risk rules compare against, each with its unit and source.
- **Risk Finding**: One assessed problem with category, severity, location, moment, measured value,
  limit and mitigation suggestion.
- **Risk Report**: The set of findings, the rules assessed and not assessed, the notices and the
  statement that the result is indicative.
- **Comparison Summary**: The differences in validity, cut time, cost and risk counts between the edited
  layout and the original.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the 500-part reference sheet, the validity verdict for each step of a drag appears in
  under 100 ms in the reference browser, worst of five runs.
- **SC-002**: In a fixture set with every violation type (overlap, edge, margin, forbidden zone,
  spacing, forbidden rotation or mirror), 100% of violations are reported with the correct reason and 0
  invalid positions can be confirmed.
- **SC-003**: Undoing and redoing any sequence of up to 100 edits returns the layout and its digest to
  the exact earlier and later states in 100% of tested sequences.
- **SC-004**: Producing the edited result from the same artifact and the same ordered edits gives the
  same artifact and digest in five consecutive runs and in both Node.js and the browser.
- **SC-005**: After any confirmed edit, 100% of the plan, cost, validation and risk figures are marked
  outdated until recomputed, and none appears current in the tested sequences.
- **SC-006**: The risk assessment of the 500-part reference job finishes in under 2 seconds in Node.js
  on the reference machine, worst of five runs.
- **SC-007**: In the reference jobs built to contain each risk category, every planted risk is reported
  under the correct category with its reason, measured value and limit, and the safe reference job has no
  critical finding.
- **SC-008**: Every edit, risk and comparison function can be completed without a pointer, and 100% of
  the verdict and finding changes are announced as text.
- **SC-009**: In the reference scenario with one planted risk, a planner removes the finding by moving
  one part in five interactions or fewer and sees it disappear after recomputation. An interaction is
  one discrete user action: selecting the part, one completed drag or one keyboard entry, confirming,
  requesting the recomputation, and starting the replay.

## Assumptions

- Editing is limited to the position of placed parts on their own sheet (move, rotate, mirror). Editing
  the drawings, the part geometry, the cut sequence, pierce points, leads or tabs, placing parts that
  were left unplaced, removing parts and moving parts between sheets are out of scope.
- The usable area, margins, forbidden zones, minimum spacing, allowed rotations, mirroring and grain
  direction come from the artifact and the request of the earlier nesting stages; this feature reuses
  them and defines no new nesting rule.
- The physical simulation is indicative and rule based. It is not a numerical thermal or mechanical
  model, produces no temperature or deformation figures, and does not simulate rigid bodies; it flags
  conditions that the technology profile says are risky. Quantitative thermal modelling and
  finite-element analysis are out of scope.
- The technology profile with the risk limits is supplied and owned by the caller, like the other
  technology and cost inputs; the library ships no material data and invents no limit.
- A part that encloses other placed parts moves together with them as one group.
- Edits are held in memory in the session; nothing is persisted, and the edited result is the only
  output that leaves the session.
- The reference sheet, reference machine and reference browser of the review and costing features
  (007 and 008) are used for every measured criterion.
- This feature depends on the nesting layout (002), the cut plan (004), the ERP artifact (006), the
  review and playback (007) and the cost report (008).
