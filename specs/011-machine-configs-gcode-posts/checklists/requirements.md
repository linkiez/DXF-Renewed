# Specification Quality Checklist: Machine Configurations and Cutting G-code Post-Processors

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-16
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Analysis of `/home/linkiez/Projetos/pos-processor` (169 files): Talvi real programs (`teste2/*.nc`,
  `Nest para parametros/*.nc`), 44 Talvi cutting recipes (`Parametros TAVI/*.HSTool`), the Talvi,
  GloryStar and Hypertherm SigmaNEST posts (`.pst`, `.pas`, `.tec`, `.xml`), the Talvi research,
  contract, data model and pending-items documents, the NC checker and its tests.
- Left out on purpose: `smb.env`, `smb2.env` (credentials), `mapa-rede-192.168.0.md`, the SSH scripts,
  the browser logs and the build caches; none belongs in a cutting library.
- Defaults chosen instead of clarification markers (recorded in Assumptions): all three machines are in
  scope, the Talvi leads as P1; critical values marked inferred make a program non-releasable; the
  recipe stays with the machine's operator interface; configurations, recipes and plans are data
  supplied by the caller, and no file is read.
- Open for planning: the module layout, the exact fields and validation of the machine configuration,
  how the existing registry and `MachineProfile` are extended additively, the synthetic reference
  plans and reviewed programs, and the recipe import format details.
- Reference documents added after the first pass: `docs/nesting/IM_807620r5.pdf` (EDGE Pro HyPath CNC
  Instruction Manual 807620 rev 5: hardware, stations, axis setup and cut chart files; no G-code reference)
  and the Phoenix 9.761 cut chart workbook (7,148 rows, metric; two byte-identical files, one with a
  truncated name). They add User Story 4 (cut chart lookup), FR-022..FR-027, SC-009, SC-010, new edge cases
  and assumptions, and plan decisions D11 and D12. No `[NEEDS CLARIFICATION]` was needed; the HPR260XDa
  against HPR400XDa applicability is recorded as an assumption that a person confirms.
- Vendor reference added: `docs/Hypertherm EDGE PRO Programmer reference.md` (EDGE Connect 809550 rev 6,
  April 2025). It confirms the Hypertherm codes and ranges, requires the vendor order of the `V5xx` codes
  (thickness before cutting surface, which differs from the reviewed post), marks `M15`/`M16` as legacy (the
  existing `edge-connect` processor uses them; unchanged), and lists the controller settings the program
  relies on. It adds FR-028..FR-030, SC-011, edge cases, plan decision D13 and the
  `controllerPreconditions` and `chartOrder` configuration values.
