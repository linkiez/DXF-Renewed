# Data Model: Machine Configurations and Cutting Post-Processors

Types are described by fields and rules, not by code. Geometry is in the unit the configuration
declares; angles are degrees.

## Machine configuration

### ValueSource
| Field | Rule |
|---|---|
| `classification` | `observed` \| `user-confirmed` \| `vendor-confirmed` \| `approved` \| `inferred` |
| `reference` | text naming the evidence (a document, a file name, a confirmation); not empty |
| `confirmedBy?` | who confirmed it, for the confirmed and approved classes |
| `note?` | free text, for example a known conflict |

Only `approved` lets a critical value pass the release gate.

### Sourced value
`{ value, source }` for any value of the configuration that needs evidence.

### MachineConfiguration
| Field | Rule |
|---|---|
| `configurationId` | stable identifier of the machine, for example `talvi-6000w`, not empty |
| `revision` | text that changes whenever any value or source changes, not empty |
| `name` | human name |
| `machineKind` | `laser` \| `plasma` |
| `processorId`, `processorRevision` | exact processor identity, not empty |
| `units` | sourced `mm` \| `inch` |
| `envelope` | sourced `{ minX, maxX, minY, maxY }` in machine coordinates, `min < max` on each axis |
| `frame` | sourced `{ rotationDegrees: 0 \| 90 \| 180 \| 270, origin: 'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right' }` |
| `table` | sourced `{ width, height }`, informational; a conflict is recorded in `source.note` |
| `deadZone?` | sourced number >= 0 |
| `rapidFeed` | sourced number > 0, units per minute |
| `arcCenter` | sourced `incremental` \| `absolute` |
| `decimals` | sourced integer 0..6 |
| `trailingZeros` | sourced boolean |
| `output` | `{ extension: sourced text starting with '.', lineEnding: sourced 'lf' \| 'crlf' }` |
| `operations` | sourced list of the action kinds the dialect supports |
| `dialect` | map of sourced scalar parameters of the dialect (see below) |
| `processMapping?` | sourced `ProcessMapping`, required by the Talvi |
| `externalDependencies` | list of names the program calls and does not define (macros, subprograms), each with its source |
| `controllerPreconditions` | list of `{ id, text, source }`, the controller settings the program relies on (Hypertherm: `eia-g59-override`, `process-select-override`, `station-select-override`, `kerf-override`, `parallel-kerf-disabled-true-hole`); each source is a sourced value, and the program result carries their texts |

Nothing absent receives a default from another machine.

### ProcessMapping
| Field | Rule |
|---|---|
| `key` | name of the action metadata that selects the process, not empty |
| `entries` | list of `{ value: string, p: integer >= 0, q?: integer >= 0 }`, values unique |
| `omitQ` | `never` \| `when-undefined`: whether `Q` is written when an entry has none |

### Dialect parameters
| Processor | Parameters (all sourced) |
|---|---|
| `talvi-6000w` | `lastDistance` (-999), `distanceDecimals` (3), `sizeDecimals` (3), `arcMinimumSweep` (2 degrees) |
| `glorystar-gs3015` | `headDownMaxDistance` (100), `jumpMaxDistance` (1000), `heightOffCode` (`M82`), `heightOnCode` (`M83`), `smallContourClass` (`small`), `regulatorOffQuality` (3), `arcMinimumSweep` (2 degrees), `thickMaterialGroups` (`GRPALMG`, `GRPINOX`), `thickMinThickness` (6) |
| `hypertherm-edge-pro-hpr400xda` | `station` (1), `plasmaProcess` (1), `markingProcess` (3), `axisPreset` (0 or 1), `highDefinitionKey`, `chartOrder` (`type`, `material`, `current`, `gas`, `thickness`, `surface`) |

### Process settings keys (read by the dialects)

`MachineProfile.processSettings` carries scalars; the keys each dialect reads are:

| Processor | Keys |
|---|---|
| `talvi-6000w` | none (the recipe belongs to the controller); the contour selector comes from `processMapping.key` on the action metadata |
| `glorystar-gs3015` | `feed` (`F`), `piercingType` (`P`), `thickness` (mm); per contour metadata `quality` (the quality number; `3` selects regulator mode `0`, any other `1`), `contourClass` and `materialGroup` |
| `hypertherm-edge-pro-hpr400xda` | `torchType` (`V502`), `materialType` (`V503`), `current` (`V504`), `shieldGas` (`V505`), `thickness` (`V507`), `cuttingSurface` (`V506`, only written when `chartOrder` lists `surface`), `feed`, `leadInFeed`, `trueHole`, `arcVoltage` (`V600`), `pierceTime` (`V601`), `pierceHeightFactor` (`V602`), `cutHeight` (`V603`), `transferHeightFactor` (`V604`), `cutHeightDelay` (`V605`), `kerfDetectTime` (`V606`), `kerf`, `materialComment`, the flags `m50n`, `rt`, `hs` and `chartSource` (`table` when produced by `cutChartSettings`); per contour metadata `kerfSide` (`left` \| `right`) and the key named by `highDefinitionKey` |

### Critical values
The values whose classification gates the release of each processor, by path: `units`, `envelope`,
`frame`, `rapidFeed`, `arcCenter`, `decimals`, `output.extension`, `operations`, `processMapping` (Talvi),
and the dialect parameters the processor lists. A critical value that is not `approved` produces one
`UNAPPROVED_VALUE` error naming its path.

## Hypertherm height control ranges (vendor)

| Variable | Name | Range | Unit |
|---|---|---|---|
| `V600` | arc voltage | 10 to 300 | V |
| `V601` | pierce time | 0 to 9 | s |
| `V602` | pierce height factor | 50 to 400 | % |
| `V603` | cut height | 0 to 25.4 (1 in) | program units |
| `V604` | transfer height factor | 50 to 400 | % |
| `V605` | cut height delay | 0 to 5 | s |
| `V606` | kerf detect reacquire time | 0 to 10 | s |

A value outside its range is `HEIGHT_CONTROL_OUT_OF_RANGE` (error) naming the variable and the range.

## Validation issue codes

Configuration (from `validateMachineConfiguration`, severity `error`): `CONFIG_FIELD_MISSING`,
`CONFIG_FIELD_INVALID`, `CONFIG_SOURCE_MISSING`, `CONFIG_ENVELOPE_INVALID`, `CONFIG_MAPPING_INVALID`,
`CONFIG_UNKNOWN_PROCESSOR`.

Program (from the processors, added to the existing ones): `UNAPPROVED_VALUE`, `OUT_OF_ENVELOPE`,
`ACTION_UNSUPPORTED`, `PROCESS_MAPPING_MISSING`, `PROCESS_SETTING_REQUIRED`, `EMPTY_PROGRAM`,
`SHEET_DOES_NOT_FIT`, `HEIGHT_CONTROL_OUT_OF_RANGE`, `CUTCHART_UNVERIFIED` (warning: settings not from a table
entry). Each carries a pt-BR message, the path or the action index and, when it concerns a
contour, the contour identifier and the axis.

## Program output (additive)

`MachineProgram.output?`: `{ extension, lineEnding }` from the configuration of the request; absent for
the existing processors.

## Recipes

### TalviRecipe
| Field | Rule |
|---|---|
| `id` | the file name, unique |
| `thicknessMm` | number > 0, from the file name |
| `material` | normalized text, or `null` when the file name does not carry it |
| `nozzle` | text such as `s1.5` or `d2.0`, or the nozzle of the double pattern |
| `toolNumber` | from `nTNumber` |
| `cut` | `height`, `speed`, `power`, `frequency`, `duty`, `gasType`, `gasPressure`, `focus`, `preCutDelay`, `coolDelay`, `spotSize` |
| `pierceStages` | list of the stages whose `bOpen` is true: type, time, height, gas, pressure, power, duty, frequency, focus start and end |
| `lead` | the lead parameters when `bopenLeadPar` is true |
| `speedUnitConfirmed` | always `false` in this revision |

### RecipeIssue
`{ file, code, message }` with codes `RECIPE_XML_INVALID`, `RECIPE_NAME_UNRECOGNIZED`,
`RECIPE_FIELD_MISSING`. A file with an issue is not in the recipe list; the others are.

Lookup: exact `material` (normalized) and `thicknessMm` with `EPSILON`, optionally a nozzle; never the
nearest thickness. The result is the recipe, or an explicit absence.

## Cut chart table

### CutChartTable
| Field | Rule |
|---|---|
| `unit` | `mm` \| `in`, from the unit marker of the first cell of the `Cut` sheet |
| `software` | text such as `Phoenix 9.761`, as the caller states it |
| `powerSupply` | text such as `HPR260XDa`, as the caller states it |
| `entries` | list of `CutChartEntry` |
| `separations` | list of `SeparationRule` |

### CutChartEntry
| Field | Rule |
|---|---|
| `material` | `MS` \| `SS` \| `AL` as the table names it |
| `thickness` | number > 0 in the table unit |
| `class` | text such as `130Amp O2/Air [Bevel]`, not empty |
| `profile` | `{ type, diameter, area }`, each `*` for any |
| `feed` | `{ base, percent, value, leadIn }` > 0 |
| `kerf` | `{ base, adjustment, value }`; `value` > 0 |
| `chart` | `{ type, material, current, gas, thickness, surface }`, the codes of `V502`, `V503`, `V504`, `V505`, `V507` and `V506`; `material` is a positive number that may carry the specific material decimal (`1`, `1.97` fine feature, `1.99` true hole); the others positive integers (`current` in amps); `surface` is optional |
| `height` | `{ arcVoltage, pierceTime, pierceHeightFactor, cutHeight, transferHeightFactor }` and the edge variants where the row has them; numbers >= 0 |
| `toggles` | `{ trueHole, fineFeature, hdi, thickPierce, underwater, bevel, edgePierceOnly }` booleans |
| `outputs` | `{ v500, v600, m50n, rt, hs }` booleans, from the command-line columns |
| `rowNumber` | position of the row in the input, for the issues |

### SeparationRule
`{ material, thickness, part, plate, pierce }`, numbers >= 0; `material` may be `*`.

### CutChartIssue
`{ rowNumber, code, message }` with codes `CUTCHART_ROW_INVALID`, `CUTCHART_CODE_UNKNOWN`,
`CUTCHART_UNIT_MISSING`. Lookup results (returned, never thrown): `CUTCHART_ABSENT` (names the missing
combination) and `CUTCHART_UNIT_MISMATCH`.

### Lookup
Exact match on `material`, `thickness` (with `EPSILON`), `class` and the toggles; the result is the entry
and its separation rule, or an explicit absence. `cutChartSettings(entry)` returns the process settings the
Hypertherm processor reads: the six chart codes, the height values, the feed and lead-in feed, the kerf and the
`trueHole` flag, and adds the command words `M50N`, `RT`, `HS` the entry enables.

## State and relations

`MachineConfiguration` -> `toMachineProfile` -> `MachineProfile` (with `configuration`) ->
`generateMachineProgram` -> `MachineProgram` (with `output`). The registry resolves the processor by the
exact `(processorId, processorRevision)` of the configuration. Recipes are independent of programs.
