/**
 * Public modular post-processing API.
 *
 * Converts immutable CutPlan actions into deterministic, reviewed G-code for
 * explicitly selected processor revisions. This module is browser-compatible:
 * reviewed output is supplied by the caller and no file or network I/O occurs.
 */

# Post-processing API

The post-processing module converts an immutable `CutPlan` into deterministic G-code for an
explicit processor and revision. `generateMachineProgram` validates the profile and plan, emits
through the registered processor, canonicalizes line endings, and blocks release on every error or
reviewed-output mismatch.

Approved built-ins are `generic-laser@1`, `generic-plasma@1`, and
`edge-connect@809550-rev6`. EDGE Connect intentionally emits only the documented EIA `G00`, `G01`,
`G21`, `M15`, and `M16` subset used by this feature. Unsupported actions are reported as issues.

The registry is exact: no revision or dialect fallback is performed. Processor implementations
must not mutate their input plan or profile. `generateMachineProgram` requires
`MachineProfile.expectedOutput` and compares canonicalized text exactly before release.
Generic plasma emits the approved `amperage` profile setting as an `S` word on the torch-on
command; missing amperage is a validation error rather than a default.
