# Feature Specification: Machine Configurations and Cutting G-code Post-Processors

**Feature Branch**: `011-machine-configs-gcode-posts`
**Created**: 2026-11-16
**Status**: Draft
**Input**: User description: "analise todos os arquivos de /home/linkiez/Projetos/pos-processor e
implemente config de maquinas e posprocessadores para geracao de gcode para corte". The analysis of
that project found three machines with evidence: the Talvi 6000 W fiber laser (LaserAhead controller,
real programs and 44 cutting recipes), the GloryStar GS3015 laser and the Hypertherm EDGE Pro
HPR400XDa plasma (SigmaNEST post scripts and templates).

**Reference documents added to the repository** (`docs/nesting/`): the Hypertherm EDGE Pro HyPath CNC
Instruction Manual 807620 revision 5 (`IM_807620r5.pdf`) and the Hypertherm Phoenix 9.761 cut chart table
for the HPR XD family in millimetres (`Phoenix 9_761 HPR260XDa (Cut, TrueHole, V500, V600, M50N, RT, HS)
MM.xlsx`; the file `Phoenix 9_761 HPR260XDa (Cut, TrueHole, V500, .xlsx` is a byte-identical copy with a
truncated name; the duplicate was removed, so one workbook file remains), and the Hypertherm EDGE Connect
Programmer Reference 809550 revision 6, April 2025 (`docs/Hypertherm EDGE PRO Programmer reference.md`),
the vendor's G-code reference. They describe the Hypertherm machine and are used as evidence in this
specification. A further evidence source is the folder of ProNest posts (`Resilio Sync/Maquina/Software/
Pronest/PosPronest/Post ProNest/`, read-only; `EDGE.cff` revision 1.64 is Hypertherm's own ProNest post for the
EDGE Pro, and `HyperthermEDGE.CFF` is its basic variant). The two `.pnca` ProNest machine archives of that
folder are password protected and were not opened.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Release a Program for the Talvi 6000 W Laser (Priority: P1)

A planner selects the Talvi 6000 W machine and receives a cutting program in the dialect that its
controller runs today: the fixed preparation block, one numbered block per contour with its process
selector, the rapid to the contour start, the controller's contour start and end calls, the cut
moves with incremental arc centers and the distance to the next contour, and the fixed ending. The
coordinates are expressed in the machine frame, whose zero is at the bottom right of the table.

**Why this priority**: The Talvi is the machine with real controller programs to compare against,
and the only one the shop floor is waiting on. A wrong program can move the head outside the table
or fire the laser at the wrong place.

**Independent Test**: Generate the program for a synthetic reference plan and compare it, text for
text, with the reviewed expected program; check that every structural rule found in the real
controller programs holds (header, footer, contour count, block order, distance to next contour,
last-contour sentinel).

**Acceptance Scenarios**:

1. **Given** a cut plan of N contours and the Talvi machine profile, **When** a program is
   requested, **Then** it declares N contours in its header comment, has exactly one preparation and
   one ending, and every contour has its number, process selector, rapid, start call, moves and end
   call in that order.
2. **Given** a contour followed by another, **When** the program is generated, **Then** the first
   contour ends with the straight-line distance of the rapid to the next contour start, and the last
   contour ends with the controller's last-contour sentinel.
3. **Given** a plan whose part positions are in nesting coordinates, **When** the program is
   generated, **Then** every coordinate is mapped into the machine frame and lies inside the
   confirmed work envelope; a plan that cannot fit is rejected with the offending contour named.
4. **Given** an arc in the plan, **When** it is emitted, **Then** its center is given as the offset
   from the arc start, a full circle is one arc whose end equals its start, and the start and end
   radii agree within 0.01 mm.
5. **Given** a quality or process without an approved selector mapping, **When** a program is
   requested, **Then** the program is produced as a draft that cannot be released, with the missing
   mapping named, and no selector is invented.

---

### User Story 2 - Keep Machine Configurations With Their Evidence (Priority: P1)

A technical owner keeps one configuration per machine: kind, units, work envelope, origin and axis
directions, table size, arc-center convention, decimals, output extension, rapid feed, dead zone,
processor and revision. Each value says where it came from and whether it is observed, confirmed by
the user, confirmed by the vendor, approved or only inferred. Programs from a configuration whose
critical values are not approved can be generated for review but never released.

**Why this priority**: The pos-processor project shows that the hard part is not the text of the
program but knowing which values are real. A catalog that hides that would move machines by guess.

**Independent Test**: Load the three machine configurations, change one critical value from
approved to inferred and verify that the program is still produced but is no longer releasable and
says why; verify that an invalid configuration is rejected with the failing field named.

**Acceptance Scenarios**:

1. **Given** a machine configuration, **When** it is validated, **Then** every critical value has a
   source and a classification, and a missing or malformed value is reported with its path.
2. **Given** a configuration with an inferred critical value, **When** a program is generated,
   **Then** the program carries an explicit non-releasable result naming that value.
3. **Given** two machines of the same kind, **When** their configurations are listed, **Then** each
   has its own identity, processor and revisions, and selecting one never falls back to another.
4. **Given** a configuration the caller supplies, **When** a program is generated, **Then** the
   caller's configuration replaces the built-in one for that request and the built-in is unchanged.

---

### User Story 3 - Release a Program for the Hypertherm EDGE Pro HPR400XDa Plasma (Priority: P2)

A planner selects the Hypertherm plasma machine and receives a program in the dialect that the vendor's
Programmer Reference defines and the reviewed post uses: metric or inch preparation with the material
comment, the cut chart selection (torch type, material, current, shield gas, thickness and, when the entry
has it, cutting surface, in the order the vendor requires), the optional overrides of the height control
(arc voltage, pierce time, pierce and transfer height factors, cut height), the process and station
selection, kerf side and offset immediately before the cut-on command, cut on and off, and the ending.

**Why this priority**: The machine exists on the floor and a richer dialect than the minimal one
already in the library is documented, but it has no real program to compare, so it follows the
Talvi.

**Independent Test**: Generate the program for the synthetic reference plan and compare it with the
reviewed expected program; verify that each process parameter of the cut chart block comes from the
supplied process settings and that a missing one blocks release.

**Acceptance Scenarios**:

1. **Given** a plasma plan and the Hypertherm profile, **When** a program is requested, **Then** the
   cut chart block carries every process parameter from the supplied settings, with the units the
   profile declares.
2. **Given** a process parameter that the dialect requires and the settings do not supply, **When**
   a program is requested, **Then** release is blocked naming the parameter.
3. **Given** a contour that needs the high-definition cut mode, **When** the program is generated,
   **Then** the plasma-on command of that mode is used and the height control is frozen on leads as
   the reviewed post does.
4. **Given** any plan, **When** the program is generated, **Then** the cut chart selection codes precede
   the kerf command, the kerf command immediately precedes the cut-on command of its contour, every cut
   is closed by cut-off, and the program ends with the station cancel and the end-of-program command.
5. **Given** a height control override outside the vendor's range (arc voltage 10 to 300 V, pierce time
   0 to 9 s, pierce and transfer height factor 50 to 400 %, cut height 0 to 25.4 mm, cut height delay 0 to
   5 s, kerf detect time 0 to 10 s), **When** the program is requested, **Then** release is blocked naming
   the variable and its range.

---

### User Story 4 - Look Up the Hypertherm Cut Chart Values (Priority: P2)

A planner who cuts on the Hypertherm plasma no longer types the cut chart numbers by hand. The Phoenix
cut chart table lists, for each material, thickness and consumable class, the cut chart selection (type,
material, current, gas, thickness and surface codes), the height control values (arc voltage, pierce
time, pierce and transfer height factors, cut height), the feedrate, the kerf and the part separation.
The planner supplies the rows of that table and a request, and receives exactly the settings that the
Hypertherm program needs, or a precise reason why none are available.

**Why this priority**: The Hypertherm program is only as good as its cut chart block, and the table is
the vendor's own source for it. Without the lookup, every program depends on hand-typed values and the
cut chart parameters stay unverified.

**Independent Test**: Load a small excerpt of the table, look up three materials and thicknesses, feed
the result to the Hypertherm processor and compare the cut chart block with the table values; verify that
a thickness the table does not hold is reported as absent and never approximated.

**Acceptance Scenarios**:

1. **Given** the rows of the cut chart table, **When** they are imported, **Then** every row becomes one
   cut chart entry with the material, thickness, class, cut chart codes, height control values, feedrate
   and kerf, a row that cannot be read is reported with its position, and the others are kept.
2. **Given** a material, a thickness, a consumable class and the toggles of the table (true hole, fine
   feature, underwater, edge pierce only), **When** an entry is requested, **Then** the exact entry is
   returned, or an explicit absence naming the missing combination; no neighbouring thickness or class is
   used.
3. **Given** an entry, **When** it is turned into process settings, **Then** the cut chart block of the
   Hypertherm program carries the entry's cut chart codes and height control values, and the feedrate
   and kerf are the ones of the entry.
4. **Given** a table whose unit is not the unit of the machine configuration, **When** an entry is
   requested, **Then** the request returns a unit mismatch result and no value is converted silently.

---

### User Story 5 - Release a Program for the GloryStar GS3015 Laser (Priority: P2)

A planner selects the GloryStar GS3015 and receives a program in the dialect of its reviewed post:
the loader and sheet data block, the working-table selection, the cutting block per contour with the
piercing type and regulator mode, the flame-off variants between cuts (head down, short jump, head
up), the height-sensor on and off, the lead-in and lead-out commands, comma-separated moves with
absolute arc centers, arcs broken at the quadrants, and the ending with the safe retraction.

**Why this priority**: It is the most elaborate dialect and has the least direct evidence, so it
depends on the shared structure built for the first two.

**Independent Test**: Generate the program for the synthetic reference plan, including a short
travel and a long travel, and compare it with the reviewed expected program.

**Acceptance Scenarios**:

1. **Given** two consecutive cuts closer than the head-down distance, **When** the program is
   generated, **Then** the head stays down between them with the flame-off variant for that case;
   when they are farther than the jump distance, the head goes up with the safe retraction.
2. **Given** a small contour class, **When** the program is generated, **Then** the height sensor is
   off for it and the regulator mode is the one the dialect assigns to that class.
3. **Given** an arc, **When** it is emitted, **Then** it is split at the quadrants and its center is
   absolute.

---

### User Story 6 - Browse the Talvi Cutting Recipes (Priority: P3)

A planner or the cost module looks up the Talvi cutting recipes by material, thickness and nozzle.
The recipes come from the machine's exported tool files, and the lookup shows speed, power, gas,
pressure, focus and the pierce stages. The program for the Talvi does not carry these values,
because the controller's operator interface owns the recipe, and the lookup says so.

**Why this priority**: The recipes are valuable data that already exist on the shop floor and feed
time and cost estimates, but nothing in the program depends on them.

**Independent Test**: Import the 44 reference recipe files, look up three of them by material and
thickness, and verify that the values equal the file contents and that no program text contains a
recipe value.

**Acceptance Scenarios**:

1. **Given** the exported recipe files of the Talvi, **When** they are imported, **Then** every file
   becomes one recipe with material, thickness, nozzle, gas and the cutting and pierce parameters,
   and a file that cannot be read is reported with its name.
2. **Given** a material and a thickness, **When** a recipe is looked up, **Then** the matching recipe
   is returned, or an explicit absence is reported, never a nearby thickness.
3. **Given** a Talvi program, **When** it is inspected, **Then** it holds only the selector of the
   recipe, never its power, speed, gas or focus.

### Edge Cases

- A plan that does not fit the work envelope of the machine in the machine frame is rejected with the
  contour and the axis that overflows, never clipped.
- An arc of a sweep of about 2 degrees or less is emitted as a line, as the reviewed posts do.
- A plan without contours or with only rapids produces no releasable program and says so.
- A machine configuration refers to a processor revision that is not registered: the request fails
  without falling back to another dialect.
- A recipe file has missing tags or unreadable text: the import reports the file and keeps the others.
- A cut chart table row with a missing code or an unreadable number is reported with its position and
  left out; a request that needs it reports an absence instead of a guess.
- The cut chart table is metric and the machine configuration is in inches (or the reverse): the request
  returns a unit mismatch result.
- The cut chart table names a power supply (HPR260XDa) that differs from the machine of the configuration
  (HPR400XDa): the entries are usable only when the configuration declares the table as applicable, and a
  value taken from it is `observed`, not `approved`, until a person approves it.
- A cut chart code that the table's own code list does not define (for example a thickness code) is
  reported and the entry is not used.
- A `G59` value that the CNC's own cut chart lacks makes the CNC refuse the program with an "Invalid
  Process" error; the library cannot see that chart, so a program built from hand-supplied settings carries
  a warning and one built from a table entry does not.
- A height control override outside the vendor's range is an error and never clamped.
- Curves the dialect cannot express are linearized only with a tolerance the profile supplies, as in
  the existing post-processing.
- Values that exist only as observations of a controller's reported limits (soft limits) are never
  treated as the confirmed work envelope.
- Source files that hold credentials, network maps, logs or production programs of customers are not
  part of the library or its fixtures; only synthetic programs and synthetic plans are used.
- The proprietary SigmaNEST scripts are not copied; the dialect they document is re-implemented and
  attributed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a post-processor for the Talvi 6000 W that emits the controller
  dialect observed in its real programs: preparation, contour blocks with number, process selector,
  rapid, start call, moves, distance to next contour and end call, and the fixed ending.
- **FR-002**: The Talvi program MUST declare in its header the contour count and the used size (the width and
  the height of the bounding box of all mapped cut points, with the configured decimals), MUST
  contain exactly one preparation and one ending, and MUST end the last contour with the
  last-contour sentinel and every other contour with the length of the rapid to the next one.
- **FR-003**: The Talvi program MUST map nesting coordinates into the machine frame (zero at the
  bottom right, X toward the left of the table, Y away from the operator) using the transformation
  declared by the machine configuration, and MUST reject any move outside the confirmed work
  envelope.
- **FR-004**: The Talvi arcs MUST use incremental centers measured from the arc start, MUST emit a
  full circle as one arc, MUST emit arcs of about 2 degrees or less as lines, and MUST keep start and
  end radii equal within 0.01 mm.
- **FR-005**: The Talvi process selector of each contour MUST come only from an explicit mapping
  supplied with the machine configuration; without it the program MUST be a draft that cannot be
  released, and the omission rule of the second selector value MUST be declared by the mapping.
- **FR-006**: The system MUST provide a post-processor for the Hypertherm EDGE Pro HPR400XDa that
  emits the cut chart block, the station and process selection, the kerf and offset commands, the
  plasma on and off commands, the metric or inch preparation with the material comment and the
  ending, taking every process parameter from the supplied settings.
- **FR-007**: The Hypertherm processor MUST block release when a parameter the dialect requires is
  absent from the settings, and MUST use the high-definition plasma-on command and freeze the height
  control on leads for contours that need that mode.
- **FR-008**: The system MUST provide a post-processor for the GloryStar GS3015 that emits the loader
  and sheet data block, the working-table selection, the cutting block per contour with the piercing
  type and regulator mode, the flame-off variants between cuts, the height-sensor commands, the
  lead-in and lead-out commands, comma-separated moves with absolute arc centers, arcs split at the
  quadrants and the ending with the safe retraction.
- **FR-009**: The GloryStar processor MUST choose between head down, short jump and head up from the
  distances declared by the machine configuration, and MUST turn the height sensor off for the
  contour classes that the configuration lists.
- **FR-010**: The system MUST keep a machine configuration per machine with: identity, kind, units,
  work envelope, origin and axis directions, table size, dead zone, rapid feed, arc-center
  convention, decimals, line endings, output file extension, processor identifier and revision,
  supported operations and the mappings the dialect needs.
- **FR-011**: Every critical value of a machine configuration MUST carry its source and one of the
  classifications observed, user-confirmed, vendor-confirmed, approved or inferred; a missing or
  malformed value MUST be reported with its path and MUST NOT receive a default taken from another
  machine.
- **FR-012**: A program generated from a configuration with a critical value that is not approved
  MUST be returned for review but MUST NOT be releasable, and the result MUST name each such value.
- **FR-013**: The system MUST ship the configurations of the three machines as built-in data with
  their sources and the classification each value has today, MUST let a caller supply a different
  configuration per request, and MUST NOT change the built-in data when it does.
- **FR-014**: The system MUST select the processor named by the configuration by exact identifier
  and revision, MUST NOT fall back to another dialect, and MUST list every registered processor with
  its machine, kind and revision.
- **FR-015**: Every generated program MUST report the machine, processor, processor revision,
  configuration revision, the output file extension and the line ending, and MUST be deterministic
  for identical inputs.
- **FR-016**: Every program MUST be compared with a reviewed expected program as canonicalized text,
  and a difference MUST block release, exactly as the existing post-processors do.
- **FR-017**: The system MUST import Talvi recipe files from their text into recipes with material,
  thickness, nozzle, gas, speed, power, frequency, duty, pressure, focus, heights and the pierce
  stages, MUST report each file that cannot be read, and MUST look recipes up by material and
  thickness without approximating.
- **FR-018**: The Talvi program MUST NOT contain recipe values (power, speed, gas, focus); the recipe
  remains selected by the controller's operator interface, and the recipe catalog MUST say so.
- **FR-019**: The new capabilities MUST be additive: the existing generic laser, generic plasma and
  EDGE Connect processors, their profiles and their reviewed outputs MUST NOT change.
- **FR-020**: The system MUST NOT read files, the network or credentials: configurations, recipes and
  plans are supplied by the caller as data, and no source from the analysed project that holds
  credentials, network maps, logs or customer programs is part of the library, its tests or its
  documentation.
- **FR-021**: Text shown to users MUST be Brazilian Portuguese from one place per processor family;
  codes and field names stay in English and stable.
- **FR-022**: The system MUST import the Phoenix cut chart table from rows supplied by the caller, with the
  columns of the reference workbook (material, thickness, class, profile type, diameter, profile area,
  base feedrate, feedrate percentage, feedrate, lead-in feedrate, base kerf, process variation adjustment,
  kerf, disable AHC, minimum ramp time, asynchronous stop, the six cut chart codes, the transfer and pierce
  height factors and their edge variants, pierce time and edge pierce time, cut height and its delay,
  kerf redetect, arc voltage, and the toggles true hole, fine feature, HDi, thick pierce, underwater, bevel
  and edge pierce only), MUST read the unit of the table from its unit marker, and MUST report each row
  that cannot be read without dropping the others.
- **FR-023**: The system MUST look up a cut chart entry by material, thickness, consumable class and
  toggles, MUST return an explicit absence when no row matches, and MUST NOT use a neighbouring thickness
  or class.
- **FR-024**: The Hypertherm processor MUST take the cut chart selection values (`V502` torch type,
  `V503` material, `V504` current, `V505` shield gas, `V507` thickness; `V506` cutting surface only when the
  configuration lists it, because the vendor's own post never writes it) and the height control values (`V600` arc voltage, `V601` pierce time, `V602`
  pierce height factor, `V603` cut height, `V604` transfer height factor) from the process settings that
  the lookup produces, MUST emit the selection codes in the order the vendor requires (torch type,
  material, current, gas, thickness), and MUST emit the optional commands of the table
  (`M50N`, `RT`, `HS`) only for the entries whose toggles enable them. When the settings were supplied by
  hand and not from a table entry, the result MUST carry a warning that the selection was not verified
  against a cut chart, because the CNC refuses a program whose `G59` value is absent from its cut chart.
- **FR-025**: A lookup MUST return a unit mismatch result (never throw) when the table and the machine
  configuration use different units, and MUST NOT convert values silently.
- **FR-026**: The system MUST also import the part, plate and pierce separation by thickness that the
  table carries and MUST make them available with the entry, as information for the planner; they do not
  change the program.
- **FR-027**: The machine configuration MUST declare the orientation of the X and Y axes and the home
  position as the machine's own setup defines them, because the CNC is configured for them in its machine
  setups and the program is only correct when the configuration agrees with the table; a Hypertherm
  configuration whose axes were not declared MUST NOT be releasable.
- **FR-028**: The Hypertherm program MUST follow the vendor's part program format: `G59 V5xx` selection
  codes before the kerf command, the kerf value (`G43 X`) and the kerf side (`G41` or `G42`) immediately
  before `M07`, the feed word (`F`, once per change in each contour, with the lead-in feed when the entry has
  one), `M08` closing each cut, `G40` cancelling the kerf, `M36 T1` selecting the plasma
  process and `M37 T1` the station, and `M19` and `M02` ending the program; `V6xx` codes MUST be written
  only to override a cut chart value, `V603` MUST be in the program units, and `M15`/`M16` (legacy,
  not recommended by the vendor) MUST NOT be used.
- **FR-029**: A Hypertherm height control override MUST be validated against the vendor's range of its
  variable (User Story 3, scenario 5) before emission, and an out-of-range value MUST be an error
  that blocks release.
- **FR-030**: The machine configuration MUST list the controller settings that the program relies on, each
  with its source (for the Hypertherm: EIA G59 code override enabled, process select and station select
  override as the program requires, kerf override enabled, parallel kerf enable disabled for true hole
  programs), and the result of every program MUST name them so the operator can check the CNC before
  running it.

### Key Entities

- **Machine Configuration**: The physical and dialect facts of one machine: identity, kind, units,
  envelope, origin, axes, table, arc convention, decimals, extension, line endings, processor and
  revision, with the source and classification of each critical value.
- **Value Source**: Where a configuration value comes from, with its classification and, when
  available, the identity of the confirming person or document.
- **Process Selector Mapping**: The approved association from a process or quality to the selector
  values a dialect emits, including the rule for an omitted second value.
- **Machine Frame Transformation**: The mapping from nesting coordinates to machine coordinates that a
  configuration declares: origin, axis direction and offset.
- **Cutting Recipe**: A named set of cutting and pierce parameters for a material, a thickness and a
  nozzle, owned by the machine's operator interface.
- **Reference Program**: The reviewed expected program of a synthetic reference plan for one
  processor, used for the exact comparison.
- **Cut Chart Table**: The rows of the Phoenix cut chart workbook for one unit, with the power supply and
  software revision it names, the code lists of its information sheet and its separation rules.
- **Cut Chart Entry**: One row of the table: the cut chart codes, the height control values, the feedrate,
  the kerf and the toggles of one combination of material, thickness and consumable class.
- **Separation Rule**: The part, plate and pierce separation that the table lists for a thickness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For each of the three machines, the program generated from the synthetic reference
  plan equals its reviewed expected program exactly after canonicalization, in 100% of five
  consecutive runs.
- **SC-002**: Every structural rule found in the real Talvi programs (preparation, ending, contour
  count, block order, distance to next contour, last-contour sentinel, arc radii) holds for 100% of
  contours of the reference plans, including a plan of 100 contours.
- **SC-003**: No coordinate of a released program lies outside the confirmed work envelope, and 100%
  of plans that do not fit are rejected with the contour and the axis named.
- **SC-004**: 100% of critical configuration values have a source and a classification, and 0
  programs from a configuration with a non-approved critical value are releasable.
- **SC-005**: All 44 reference Talvi recipe files import with every field present in the file, and
  3 of 3 spot-checked lookups by material and thickness return exactly the file values.
- **SC-006**: No Talvi program contains a recipe value, checked over all reference programs.
- **SC-007**: All previously reviewed outputs of the existing processors are unchanged, and all the
  existing tests keep passing.
- **SC-008**: A program of 500 contours is generated in under 2 seconds on the reference machine.
- **SC-009**: For a reference excerpt of the cut chart table, 100% of the lookups return exactly the values
  of the matching row, 100% of the lookups with no matching row report an absence, and the cut chart block
  of the Hypertherm program of each looked-up entry carries every code and height control value of that row.
- **SC-010**: A table of 7,000 rows imports in under 1 second on the reference machine, and every
  unreadable row is reported exactly once.
- **SC-011**: In 100% of the Hypertherm reference programs the cut chart selection codes are in the vendor's
  order, the kerf command immediately precedes the cut-on command, every cut-on has a cut-off, no legacy
  `M15`/`M16` appears, and every height control override is inside the vendor's range.

## Assumptions

- The three machines are the ones with evidence in the analysed project: Talvi 6000 W (real
  controller programs, 44 recipes), GloryStar GS3015 and Hypertherm EDGE Pro HPR400XDa (reviewed
  SigmaNEST posts without machine programs). Other machines are out of scope.
- The analysed project is the source of facts, not of code: its documents and posts are read to
  derive the dialects and configurations, which are re-implemented in this library with attribution.
  Its repository is not a dependency.
- The Talvi work envelope is the one the user confirmed (table 1500 by 3000 mm, zero at the bottom
  right, positive Y away from the operator, X from -1500 to 0, Y from 0 to 3000). The controller soft
  limits (-1525 to 0 and 0 to 3070) are recorded as observed values and never as the envelope.
- Values the project itself marks as inferred (the second selector value default, the sentinel of the
  last contour, the size comment, the process selector semantics, the coordinate shift) enter the
  configuration as inferred, so Talvi programs are reviewable but not releasable until a person
  approves them; approving is a change of the configuration the caller supplies.
- The GloryStar and Hypertherm dialects are taken from their reviewed post scripts and templates, so
  their reference programs are synthetic and reviewed rather than copied from machine runs, and their
  critical values enter as observed until approved.
- Recipes are exported tool files owned by the Talvi operator interface. The library catalogs them for
  lookup and for time and cost estimates and never emits them in the program; units follow the files
  and the recipe catalog records that the unit of speed is not confirmed.
- Programs and plans used in tests are synthetic; production programs, logs, credentials and network
  information of the analysed project are never copied.
- The EDGE Pro HyPath manual 807620 covers the CNC hardware, the I/O, the stations, the axis setup in the
  machine setups and the cut chart files; it does not define the G-code dialect. The dialect is defined
  by the EDGE Connect Programmer Reference 809550 revision 6 (April 2025), now in the repository, which
  confirms the codes of the reviewed SigmaNEST post (`G20`/`G21`, `G90`, `G41`/`G42`/`G43`/`G40`, `G59 V5xx`
  and `V6xx`, `M07`/`M08` and their `HS` and `RT` forms, `M36`/`M37`, `M19`, `M02`, `M50`/`M50N`/`M51`) and
  their ranges. Parameters that the reference states are `vendor-confirmed` for the EDGE Connect CNC; the
  reference is for EDGE Connect, so that it applies to the HyPath running Phoenix 9.761 is a value a person
  confirms before any of them is `approved`.
- The reference and the SigmaNEST post disagree on the selection codes: the reference lists thickness (`V507`)
  before cutting surface (`V506`) and states that the surface is not needed to select a cut chart, the SigmaNEST
  post writes `V506` first, and the vendor's own ProNest post (`EDGE.cff` 1.64) writes `V502`, `V503`, `V504`,
  `V505` and `V507` and no `V506` at all. The vendor order without `V506` is used and the other orders are
  recorded as observed differences.
- The ProNest post confirms and refines the dialect: the kerf is `G43 X<kerf>` followed by `G41` or `G42`
  before `M07` and is written again for each profile; `V600` to `V604` are written only when greater than zero;
  the feed word is written for each profile; `G92 X0 Y0` follows `G90` in the ProNest post and is absent from
  the SigmaNEST post, so it is a configuration value (`axisPreset`, inferred, off); the vendor comment
  `(EMBEDDED HYPERTHERM PATENT-PENDING TRUE HOLE TECHNOLOGY)` opens programs that use True Hole cut charts.
- The reference marks `M15` and `M16` as supported legacy codes that it does not recommend; the existing
  `edge-connect` processor emits them. That processor is out of the scope of this feature and unchanged
  (FR-019); the difference is recorded for a later decision.
- The CNC has two stations and, in the cut chart table, two plasma processes and two markers with their own
  `V` numbers (plasma 1 `V502`..`V507` and `V600`..`V604`, plasma 2 `V512`..`V517` and `V625`..`V629`, markers
  `V522`..`V527` and `V532`..`V537`); this release supports plasma 1 and marker 1 on station 1, as the
  reviewed post does. The X and Y orientation and the home position are defined in the CNC's machine setups
  and must agree with the table, so they are values of the configuration, not constants of the dialect.
- The cut chart table is the vendor's data. The library ships no table and no row of it; the caller supplies
  the rows (the host reads the workbook), and the tests use a hand-written excerpt of a few rows checked
  against the workbook. The workbook was read for this specification: 7,148 rows (mild steel 2,982,
  stainless steel 2,758, aluminium 1,408), thickness 0.5 to 160 mm, consumable classes from 30 to 400 A
  with variants (bevel, true bevel, underwater, true hole, fine feature, thick pierce, edge pierce only),
  metric (`mm`), Phoenix 9.761; its name says HPR260XDa while it holds classes up to 400 A, so its
  applicability to the HPR400XDa is a value for a person to confirm.
- The two workbook files in `docs/nesting/` are byte-identical (the second has a truncated name); the
  specification treats them as one source. Neither the workbook nor the manual is edited.
- Bevel cutting, tubes, multi-torch and the controller's own macro files are out of scope; the Talvi
  program calls the controller's macros by name and does not define them.
- The dependencies are the cut path (004), the modular post-processing (005) and the cost report (008,
  for recipe-based estimates).
