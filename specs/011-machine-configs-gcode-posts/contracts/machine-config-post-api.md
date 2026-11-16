# Contract: Machine Configurations and Cutting Post-Processors API

Public additions, re-exported through the existing barrels of `src/nesting/post/` and `src/nesting`.
All are additive; the existing exports keep their shape.

## Machine configuration

```ts
listMachineConfigurations(): readonly MachineConfigurationSummary[]
getMachineConfiguration(configurationId: string): MachineConfiguration | undefined
validateMachineConfiguration(configuration: MachineConfiguration): readonly ConfigurationIssue[]
toMachineProfile(configuration: MachineConfiguration, request: ProfileRequest): MachineProfile
mapToMachineFrame(point: Point2D, sheet: { width: number; height: number }, frame: MachineFrame): Point2D
```

- `ProfileRequest` is `{ sheet: { width, height, margin }, profileRevision?, processSettings?, expectedOutput? }`.
  The profile revision defaults to the configuration revision; units, processor identity, machine kind,
  feed limit, arc support and capabilities come from the configuration, and the configuration itself is
  attached as `MachineProfile.configuration`.
- `getMachineConfiguration` returns a deep copy: changing it never changes the built-in data.
- `validateMachineConfiguration` is pure and returns every issue with its path; it never throws for
  invalid data.
- `mapToMachineFrame` implements the rotation-and-corner rule of research D4.

## Processors

| Processor id | Revision | Kind | Configuration id |
|---|---|---|---|
| `talvi-6000w` | `laserahead-1` | laser | `talvi-6000w` |
| `glorystar-gs3015` | `sigmanest-23.2-1` | laser | `glorystar-gs3015` |
| `hypertherm-edge-pro-hpr400xda` | `edge-connect-809550-6` | plasma | `hypertherm-edge-pro-hpr400xda` |

They are registered with the existing ones when the post module loads, so `listPostProcessors()` lists
them and `generateMachineProgram(plan, profile)` resolves them by the exact pair. A profile without a
`configuration` for one of these processors gets `CONFIG_FIELD_MISSING` from `generateMachineProgram`, an empty
`gcode` and `releasable: false`; `emit` returns an empty string and never throws, and no dialect is guessed.

`MachineProfile.configuration?: MachineConfiguration` and `MachineProgram.output?: { extension, lineEnding }`
are the only changes to existing types. `GcodeWriterOptions.trailingZeros?: boolean` (default false) is
the only change to the writer.

## Dialect contracts (block order of one program)

**Talvi** (`talvi-6000w`): three header comments; the eight preparation lines; for each contour in plan
order the number `N0001`..., the process selector line (or its draft comment), `G00` to the contour start,
`#<_openslag>=1`, `o<layer_start> call`, the moves of the lead-in, cut, lead-out and overcut as `G01` and
`G02`/`G03` with incremental `I`/`J`, `#<_NextOneDis>=<rapid length to the next contour>` (the last
contour: the configured sentinel), `o<layer_end> call`; the five ending lines. Axis and arc numbers use the
configured decimals with trailing zeros; distances and the size use their own decimals. No `F`, `S` or
recipe word is written. `pierce` actions do not produce a line; `tab` and `common-line` give
`ACTION_UNSUPPORTED`.

**GloryStar** (`glorystar-gs3015`): the header block, the contour start with offset selection and
rapid, the cut block with the piercing type and the regulator mode, the moves, the flame-off variant
chosen from the distance to the next contour and the configured thresholds, the height-sensor commands,
the lead commands, and the ending with the safe retraction; moves are comma-separated, arcs are absolute
and split at the quadrants.

**Hypertherm** (`hypertherm-edge-pro-hpr400xda`): the preparation with the units and the material comment,
the optional `G92 X0 Y0` (when the configuration asks for the axis preset), the `G59 V5xx` selection in the
vendor's order (`V502`, `V503`, `V504`, `V505`, `V507`; `V506` only when the configuration lists the surface),
the optional `G59 V6xx` overrides (never zero values), `M37 T1` and `M36 T1`; then for each contour the rapid,
`G43 X<kerf>` and `G41` or `G42` immediately before `M07` (`M07 HS` for high-definition contours), the feed
word `F`, the moves, `M08` (`M08 RT` when enabled) and `G40`; and the ending `M19` and `M02`. A program that uses
True Hole entries opens with the vendor comment `(EMBEDDED HYPERTHERM PATENT-PENDING TRUE HOLE TECHNOLOGY)`.
`M50`/`M50 N`/`M51` freeze and restore the height control around the leads as the reviewed post does.
The program names the controller preconditions of the configuration in its header comments.

The exact lines of each program are fixed by the reviewed reference programs in
`test/resources/post-references/` and by `quickstart.md`.

## Recipes

```ts
importTalviRecipes(files: readonly { name: string; text: string }[]): { recipes: readonly TalviRecipe[]; issues: readonly RecipeIssue[] }
findTalviRecipe(recipes: readonly TalviRecipe[], query: { material: string; thicknessMm: number; nozzle?: string }): TalviRecipe | undefined
```

Both are pure and read no file. `importTalviRecipes` keeps the input order for the recipes and reports each
unreadable file once.

## Cut chart table (Hypertherm)

```ts
importCutChartTable(input: { unitMarker: string; software?: string; powerSupply?: string; rows: readonly CutChartRow[]; separations?: readonly SeparationRow[] }): { table: CutChartTable; issues: readonly CutChartIssue[] }
findCutChartEntry(table: CutChartTable, query: { material: string; thickness: number; class: string; toggles?: Partial<CutChartToggles> }, unit: 'mm' | 'in'): { entry: CutChartEntry; separation?: SeparationRule } | CutChartAbsence
cutChartSettings(entry: CutChartEntry): Record<string, number | string | boolean>
```

- `CutChartRow` carries the workbook's English column names (Material, Thickness, Class, Profile Type,
  Diameter, Profile Area, Base Feedrate, Feedrate %, Feedrate, Lead In Feedrate, Base Kerf, Process
  Variation Adjustment, Kerf, Disable AHC, Minimum Ramp Time, Asynchronous Stop, Cut Chart Type/Material/
  Current/Gas/Thickness/Cutting Surface, Transfer Height Factor, Pierce Height Factor, Pierce Time, Cut
  Height, Cut Height Delay, Kerf Redetect, Arc Voltage, and the toggles and command-line columns). A test
  freezes the names. The host reads the workbook and builds the rows; the library reads no file.
- `unitMarker` is the first cell of the `Cut` sheet (`mm` or `in`). A missing or unknown marker is
  `CUTCHART_UNIT_MISSING`; the table is not usable.
- `findCutChartEntry` returns `CutChartAbsence` (code `CUTCHART_ABSENT`, the combination named) or returns
  `CUTCHART_UNIT_MISMATCH` when `unit` differs from the table's (a result, never an exception). It never uses a
  neighbouring row.
- `cutChartSettings` gives the process settings the Hypertherm processor reads (`V502`, `V503`, `V504`,
  `V505`, `V507`, `V600`..`V604`, `V605`, feed, lead-in feed, kerf, `trueHole` and the `M50N`, `RT`, `HS` flags); the processor
  blocks release when one that the dialect requires is missing, as in FR-007, and a result built from
  hand-supplied settings carries the `CUTCHART_UNVERIFIED` warning.

## Process settings and metadata keys

The keys of `MachineProfile.processSettings` and of the action metadata that each processor reads are listed in
`data-model.md` "Process settings keys (read by the dialects)"; they are the contract between the host, the
`cutChartSettings` lookup and the processors.

## Guarantees

- No file, network or credential is read; configurations, recipes and plans are data from the caller.
- Identical inputs give identical programs and issues.
- A program from a configuration with a critical value that is not `approved` has `releasable: false` and
  an `UNAPPROVED_VALUE` error per such value.
- The existing processors, their profiles and reviewed outputs are unchanged.
