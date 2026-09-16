# Post-Processing Contract

## Purpose

Expose a deterministic, machine-independent-to-G-code boundary for approved laser and plasma
processors.

## Public operations

```ts
registerPostProcessor(processor: PostProcessor): void
listPostProcessors(): readonly PostProcessorSummary[]
generateMachineProgram(
  plan: CutPlan,
  profile: MachineProfile,
): MachineProgram
canonicalizeGcode(gcode: string): string
```

`PostProcessor`, `MachineProfile`, `MachineProgram`, `ValidationIssue`, and summary types are
public TypeScript types exported from the nesting post-processing barrel.

Every `MachineProgram` result includes `processorName`, `processorId`, `processorRevision`, and
`profileRevision`; `processorName` is the canonical human-readable label for the selected ID.

## Selection rules

1. Resolve the exact `profile.processorId` and `profile.processorRevision`.
2. Reject unknown or incompatible variants explicitly.
3. Never fall back to another dialect or revision.
4. Preserve the action order represented by the input `CutPlan`.

The initial vendor variant is Hypertherm EDGE Connect (`edge-connect`, `809550-rev6`). Its emitter
uses only the directly supported EIA RS-274D subset verified in
`docs/Hypertherm EDGE PRO Programmer reference.md`; unsupported ESSI, legacy, XPR, G59, bevel, and
advanced codes are not inferred by this contract.

## Processing rules

1. Validate the machine profile and cut plan.
2. If arcs are unsupported, require the profile's approved positive linearization tolerance.
3. Apply deterministic curve linearization when required.
4. Emit G-code through the shared writer.
5. Validate bounds, movement, feed, entries, process settings, and capabilities.
6. Canonicalize emitted and reviewed expected G-code.
7. Set `releasable` only if there are no error issues and canonicalized output matches exactly.

When a capability is unsupported, a processor may provide an approved deterministic equivalent only
when that equivalence is documented in processor metadata. The equivalent remains subject to all
validation rules; otherwise processing returns an explicit rejection.

Warnings remain visible in `validationIssues`; they do not become silent output changes. Any error,
including an expected-output mismatch, blocks release.

## Canonicalization rules

Canonicalization MUST:

- normalize CRLF and CR to LF;
- normalize trailing whitespace;
- normalize the final newline;
- preserve line order, command order, comments, and numeric token values;
- avoid sorting, semantic rewriting, or unsupported-command inference.

The canonicalized strings are compared with strict equality.

## Error behavior

Expected profile, capability, calibration, geometry, and output-validation failures return a
structured `MachineProgram` result with `releasable: false` and explicit issues. Malformed
structural arguments may throw an explicit `Error`; expected machine or process failures must not
be represented by silent fallback.

## Approved fixtures

Reviewed expected outputs are stored under:

```text
test/resources/gcode/<processorId>/<processorRevision>/<fixture>.nc
```

Each approved processor variant requires at least one reviewed fixture and a unit test that compares
canonicalized output exactly.
