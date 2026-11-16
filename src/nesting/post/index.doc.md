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

## Configurações de máquina e processadores de dialeto

O módulo expõe, de forma aditiva, configurações de máquina e três processadores de dialeto:

- `talvi-6000w@laserahead-1` (macros do controlador LaserAhead), `glorystar-gs3015@sigmanest-23.2-1` e
  `hypertherm-edge-pro-hpr400xda@edge-connect-809550-6` (formato de programa do EDGE Connect, do fabricante).
- Uma `MachineConfiguration` reúne os fatos físicos e de dialeto de uma máquina; cada valor crítico leva sua fonte e uma
  classificação (`observed`, `user-confirmed`, `vendor-confirmed`, `approved`, `inferred`). `toMachineProfile` monta o
  `MachineProfile` (com `configuration`) que `generateMachineProgram` lê; o resultado então traz `output`.
- Um programa de configuração com valor crítico não `approved` sai para revisão e nunca é liberável
  (`UNAPPROVED_VALUE`). As configurações embutidas (`getMachineConfiguration`, `listMachineConfigurations`) não aprovam
  nada; o chamador entrega uma cópia aprovada.
