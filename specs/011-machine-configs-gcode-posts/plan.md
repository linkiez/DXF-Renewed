# Implementation Plan: Machine Configurations and Cutting G-code Post-Processors

**Branch**: `011-machine-configs-gcode-posts` | **Date**: 2026-11-16 | **Spec**: `spec.md`

## Summary

Extend the modular post-processing module (`src/nesting/post/`, feature 005) in three additive layers.
First, a **machine configuration** model: one configuration per machine, every critical value carrying
its source and classification, validated from caller data, shipped as built-in data for the Talvi
6000 W, the GloryStar GS3015 and the Hypertherm EDGE Pro HPR400XDa, and turned into the existing
`MachineProfile` by a pure function. Second, three **dialect processors** registered like the existing
ones (`talvi-6000w`, `glorystar-gs3015`, `hypertherm-edge-pro-hpr400xda`), built from small dialect
modules that share a machine-frame mapping, an envelope check and a release gate: a program made from a
configuration with a non-approved critical value is returned for review and is never releasable. Third,
a **recipe catalog** for the 44 Talvi tool files, parsed from text with a minimal reader and looked up
by material and thickness; and a **cut chart table** import and exact lookup for the Hypertherm (the
vendor's Phoenix workbook, supplied by the caller as rows) whose entries feed the cut chart block of the
Hypertherm program. Nothing reads a file, the network or a credential, no dependency is added and
no existing processor, profile or reviewed output changes.

## Technical Context

**Language/Version**: TypeScript 6, Node.js >=18, strict compiler settings.

**Primary Dependencies**: existing `zod` (caller-supplied configuration at the boundary, the same use as
the cost model and the risk profile under ADR-0002); reuse of `post` (`GcodeWriter`,
`canonicalizeGcode`, `registerPostProcessor`, `generateMachineProgram`, `linearizeCutPlan`,
`validateEmittedPlan`), `cutPath` (`CutPlan`, `CutAction`), `polygonUtils`, `linking/formatQuantity`
and `config` (`EPSILON`). No new dependency; the tool-file XML is read by a small flat reader, not a
parser library (research D8).

**Storage**: N/A. Built-in configurations are constants in the source; nothing is persisted.

**Testing**: Mocha + `tsx` unit tests in `test/unit/nesting/post/machine/`,
`test/unit/nesting/post/dialects/`, `test/unit/nesting/post/recipes/`, `test/unit/nesting/post/cutcharts/`
and `test/unit/nesting/post/processors/`; synthetic cut plans and
reviewed expected programs in `test/resources/post-references/`; a Talvi structure checker in the test
helpers (a port of the rules of the analysed project's checker); a node integration test over the real
drawings of `test/resources/nest-fixtures` (nest, plan, program for the three machines) in
`test/integration/nesting/postMachines.test.ts`, and a local-only check of the 44 recipe files
(`test/integration/nesting/talviRecipesLocal.test.ts`, skipped when `TALVI_RECIPES_DIR` is unset). Gates: `yarn type-check`, `yarn lint`,
`yarn test:unit`, `yarn quality:gate`, plus the measured criteria in `quickstart.md`.

**Target Platform**: Node.js and browsers (no file system, no network, no Web Crypto needed).

**Project Type**: TypeScript library.

**Performance Goals**: SC-008 a program of 500 contours in under 2 s and SC-010 a table of 7,000 rows in
under 1 s in Node.js on the reference machine, worst of five runs; design target O(actions) and O(rows),
with an index built once per imported table.

**Constraints**: additive public API (new optional `MachineProfile.configuration` and optional output
metadata on `MachineProgram`); no input mutation; geometry units explicit in the configuration; no
wall clock or randomness; fixed output order; every gap is a validation issue; user text from one
messages module per processor family, codes and fields English; one public function per source file;
every `src` change updates its sibling `.doc.md` in the same task; no other documentation is created;
files under 500 lines.

**Scale/Scope**: three machines, one configuration each, three processors, 44 reference recipes, a cut
chart table of about 7,000 rows (reference: Phoenix 9.761, metric), programs up to the 500-contour
reference size.

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1.*

- **I. Library-First, Additive Public API**: PASS. New code lives under `src/nesting/post/` and is
  re-exported through the existing barrels; `MachineProfile` and `MachineProgram` only gain optional
  fields; the registry, the orchestrator and the three existing processors are untouched.
- **II. Reuse Before Rewrite**: PASS. Emission reuses `GcodeWriter` (one additive option for fixed
  decimals), canonicalization, the registry, linearization and the shared validation. The only new
  algorithms are the machine-frame mapping, the contour segmentation for contour-oriented dialects and
  the tool-file reader, because nothing computes them (research D4, D6, D8).
- **III. Test-First**: PASS. Every module has failing tests before implementation; reference programs
  are reviewed text fixtures.
- **IV. Determinism**: PASS. No time or randomness; output order is fixed by the plan order; numbers are
  formatted by one routine.
- **V. Strict TypeScript, Zero New Runtime Dependencies**: PASS. No dependency added; Zod validates
  caller data at the boundary like ADR-0002; no `unknown` in the domain; the library reads no file and
  mutates no input.
- **Unit discipline / precision / silent failure**: PASS. Units and decimals are explicit in the
  configuration, comparisons use `EPSILON`, and every unsupported action, missing mapping, unapproved
  value or overflow is a validation issue; nothing is clipped or defaulted from another machine.
- **Documentation, coding and comment discipline**: PASS. `.doc.md` siblings per task; messages in
  pt-BR from one module per family; JSDoc on public functions; no narrative comments.

## Phase 0: Research Summary

`research.md` records what the analysed project established (with the evidence class of each fact),
resolves the module placement, the configuration model, the release gate, the machine frame, the
contour segmentation, the three dialects, the recipe reader and the reference programs (D1 to D10), the
caller-supplied Phoenix cut chart table lookup and the axis and home configuration (D11, D12), and the
Hypertherm dialect that follows the vendor's Programmer Reference with its ranges and its controller
preconditions (D13), and lists the conflicts and open values that stay as inferred or observed. No
`NEEDS CLARIFICATION` remains.

## Phase 1: Design Summary

- `data-model.md`: configuration, sources, frame, process mapping, dialect parameters, recipes and the
  validation issue codes, with their rules.
- `contracts/machine-config-post-api.md`: public functions, registered processors and revisions, the
  additive fields, the dialect contracts (block order of each program) and the recipe import contract.
- `quickstart.md`: runnable gates, scenarios and the measurement procedure.

## Project Structure

### Documentation

```text
specs/011-machine-configs-gcode-posts/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── machine-config-post-api.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/nesting/post/machine/            # configuration model, no dialect knowledge
├── types.ts            # ValueSource, Sourced, MachineConfiguration, MachineFrame, ProcessMapping, ...
├── schemas.ts          # Zod schema aligned with types.ts
├── messages.ts         # pt_BR texts of the configuration issues (internal)
├── validateMachineConfiguration.ts  # structure and value rules, issues with the failing path
├── criticalPaths.ts    # which values each processor treats as critical (internal)
├── releaseIssues.ts    # one error per critical value that is not approved (internal)
├── toMachineProfile.ts # configuration + request -> MachineProfile
├── mapToMachineFrame.ts  # nesting point -> machine point, with the rotation and the corner
├── envelopeIssues.ts   # points of a plan outside the confirmed envelope (internal)
├── talvi6000w.ts       # built-in configuration (data)
├── gloryStarGs3015.ts  # built-in configuration (data)
├── hyperthermHpr400xda.ts  # built-in configuration (data)
├── getMachineConfiguration.ts   # by identifier, a copy that cannot change the built-in
├── listMachineConfigurations.ts # summaries, deterministic order
└── index.ts            # barrel

src/nesting/post/dialects/
├── contourBlocks.ts    # split a plan into contours (rapid, pierce, cuts) for contour dialects (internal)
├── arcWords.ts         # arc sweep, incremental or absolute center, quadrant split (internal)
├── talvi/              # header, contour, footer, distances, selector (internal modules)
├── glorystar/          # header, cut block, flame-off variants, height sensor, footer
└── hypertherm/         # cut chart, station and process, kerf, plasma on and off

src/nesting/post/processors/
├── talvi-6000w.ts
├── glorystar-gs3015.ts
└── hypertherm-edge-pro-hpr400xda.ts

src/nesting/post/recipes/            # Talvi tool files
├── types.ts            # TalviRecipe, PierceStage, RecipeIssue
├── readFlatXml.ts      # minimal reader of the flat tool-file XML (internal)
├── parseTalviRecipeName.ts  # thickness, material, nozzle from the file name (internal)
├── importTalviRecipes.ts    # texts -> recipes and issues
├── findTalviRecipe.ts       # exact lookup by material and thickness
└── index.ts

src/nesting/post/cutcharts/          # Hypertherm Phoenix cut chart table
├── types.ts            # CutChartTable, CutChartEntry, SeparationRule, CutChartIssue
├── importCutChartTable.ts   # rows + unit marker -> table and issues
├── findCutChartEntry.ts     # exact lookup by material, thickness, class and toggles
├── cutChartSettings.ts      # entry -> process settings for the Hypertherm processor
├── codeLists.ts        # the code lists of the table's information sheet (internal)
└── index.ts

src/nesting/post/types.ts, gcode/writer.ts, process.ts, index.ts   # additive changes
<each file above>.doc.md   # sibling documentation, updated in the same task as its source

test/unit/nesting/post/machine/    configuration, frame, release gate, catalog tests
test/unit/nesting/post/dialects/   one suite per dialect plus the shared helpers
test/unit/nesting/post/recipes/    reader, name parser, import, lookup tests
test/unit/nesting/post/cutcharts/  import, lookup, settings and code-list tests
test/resources/post-references/    synthetic plans and reviewed expected programs per machine, and a
                                   hand-written excerpt of the cut chart table (a few rows)
test/integration/nesting/postMachines.test.ts
```

**Structure Decision**: configuration, dialects and recipes live under `post/` so that `MachineProfile`
can carry the configuration without a dependency cycle. Dialect modules are small and internal; each
processor is one exported object, as the existing ones. The configuration data of each machine is its
own file so each built-in value and its source can be reviewed apart.

## Complexity Tracking

No constitution violation requires justification beyond the two notes below. The only change to existing
behavior is the additive `trailingZeros` option of `GcodeWriter` (default off, existing output unchanged,
covered by the existing processor tests).

| Note | Why | Simpler alternative rejected |
|---|---|---|
| `zod` validates the caller-supplied machine configuration | The same boundary use as the cost model (008) under the Zod exception of ADR-0002; the configuration arrives as caller data in Node and in browsers and must report the failing path | Hand-written type guards for about 40 sourced fields, which would duplicate the path reporting the schema gives |
| Dialect parameters, process settings keys and the vendor ranges are data and constants of the module | They are evidence-bearing values, each with a source | Hard-coding them in the emitters hides their sources |
