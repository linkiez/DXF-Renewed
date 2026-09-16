# Data Model: Modular Laser and Plasma Post-Processing

## MachineProfile

Caller-provided description of the target machine and approved process settings.

| Field | Type | Rules |
|---|---|---|
| `machineId` | `string` | Stable caller/ERP identifier |
| `machineKind` | `'laser' \| 'plasma'` | Selects independent process behavior |
| `processorId` | `string` | Explicit registry key; no inference or fallback |
| `processorRevision` | `string` | Exact approved processor revision |
| `profileRevision` | `string` | Revision included in result metadata |
| `units` | `'mm' \| 'inch'` | Explicit unit system |
| `sheet` | `{ width, height, margin }` | Positive dimensions and non-negative margin |
| `maxFeed` | `number` | Positive maximum feed |
| `arcSupport` | `boolean` | Controls curve emission or linearization |
| `curveLinearizationTolerance` | `number?` | Required and finite/positive when arcs are unsupported |
| `capabilities` | `Readonly<Record<string, boolean \| number \| string>>` | Approved machine capability values |

## PostProcessor

Versioned machine-dialect implementation registered under a unique identity.

| Field / operation | Type | Rules |
|---|---|---|
| `id` | `string` | Unique processor identifier |
| `revision` | `string` | Non-empty approved revision |
| `machineKind` | `'laser' \| 'plasma'` | Must match `MachineProfile.machineKind` |
| `validate` | function | Returns structured issues; no silent failures |
| `emit` | function | Consumes only `CutPlan` and post-processing context |

Duplicate `(id, revision)` registrations are rejected. An unknown requested pair is an explicit
validation failure.

The initial approved vendor variant is `edge-connect` revision `809550-rev6`, based on the
directly supported EIA RS-274D subset in the local Programmer Reference Markdown.

## ValidationIssue

Structured finding returned by profile, plan, or emitted-program validation.

| Field | Type | Rules |
|---|---|---|
| `severity` | `'error' \| 'warning'` | Any `error` blocks release |
| `code` | `string` | Stable machine-readable category |
| `message` | `string` | Explicit correction-oriented explanation |
| `actionIndex?` | `number` | Related action when applicable |
| `contourId?` | `string` | Related contour when applicable |

## MachineProgram

Result returned by the post-processing operation.

| Field | Type | Rules |
|---|---|---|
| `gcode` | `string` | Rendered canonicalizable machine program |
| `releasable` | `boolean` | True only when no validation error exists and expected output matches |
| `processorName` | `string` | Canonical human-readable name for `processorId` |
| `processorId` | `string` | Selected processor identity |
| `processorRevision` | `string` | Selected processor revision |
| `profileRevision` | `string` | Caller profile revision |
| `validationIssues` | `readonly ValidationIssue[]` | All validation findings |
| `expectedOutputMatched` | `boolean` | Exact canonicalized fixture comparison result |

Invalid results may include diagnostic G-code for review, but `releasable` MUST be false and no
release operation may treat the result as production-ready.

## State transitions

```text
requested
  -> processor-resolved
  -> plan-validated
  -> geometry-normalized
  -> gcode-emitted
  -> output-validated
  -> expected-output-compared
  -> releasable
```

Any unknown processor, invalid profile, unsupported capability, calibration error, validation error,
or expected-output mismatch transitions the result to `rejected` and prevents `releasable`.

## Relationships

- One `MachineProfile` selects exactly one `(processorId, processorRevision)`.
- One `PostProcessor` serves one machine kind and revision.
- One `CutPlan` can be processed by multiple compatible profiles without mutation.
- One `MachineProgram` records the exact processor and profile revisions used to produce it.
