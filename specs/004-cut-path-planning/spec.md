# Feature Specification: Cut-Path Planning

**Feature Branch**: `004-cut-path-planning`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap cut-path workstream.

## Clarifications

### Session 2026-09-16

- Q: Como o plano de corte deve receber o layout e o perfil de processo que definem contornos, furos, leads e tabs? → A: Usar tipos públicos explícitos para `CutLayout` e `CutProcessProfile`.
- Q: Qual representação geométrica deve ser usada dentro de `CutLayout` para contornos, furos e movimentos? → A: Reutilizar os tipos geométricos públicos do nesting.
- Q: Qual deve ser a referência determinística para medir a redução de pelo menos 20% no deslocamento rápido prevista em SC-002? → A: Usar a ordem dos contornos fornecida no `CutLayout` como baseline.
- Q: Como o planejador deve comunicar leads, tabs ou rotas inválidos quando a validação falhar? → A: Retornar um resultado estruturado com problemas acionáveis e reservar exceções para entradas estruturalmente inválidas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Plan a Safe Cut Sequence (Priority: P1)

A planner receives an ordered cutting plan for a nested sheet that keeps parts supported and avoids
unsafe travel before a machine program is generated.

**Why this priority**: Correct placement alone does not prevent dropped parts, poor edges or unsafe
movement.

**Independent Test**: Use a part with holes, outer contour and tabs; verify holes precede outer
contour, all required action markers are present and travel stays in sheet bounds.

**Acceptance Scenarios**:

1. **Given** a nested part with holes, **When** a cut plan is created, **Then** all inner contours
   are planned before its outer contour.
2. **Given** configured lead, pierce and tab values, **When** a cut plan is created, **Then** each
   selected contour carries the intended entry, cutting and exit actions.
3. **Given** a route crossing kept material, **When** validation runs, **Then** the route is reported
   for correction before program release.

### Edge Cases

- A lead that cannot fit without collision is rejected.
- Small holes may use a different valid entry rule supplied by the process profile.
- Shared-edge cutting is omitted when geometric verification fails.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create an ordered, machine-independent plan from a valid `CutLayout` and `CutProcessProfile`; `CutLayout` MUST reuse the existing public nesting geometry types for contours, holes and movement coordinates.
- **FR-002**: The system MUST plan inner contours before associated outer contours.
- **FR-003**: The system MUST represent rapid movement, piercing, lead-in/out, cutting, overcut and
  tabs whenever selected by the supplied process profile.
- **FR-004**: The system MUST choose entry points that meet the supplied clearance rules.
- **FR-005**: The system MUST reduce non-cut travel according to the selected sequencing policy.
- **FR-006**: The system MUST validate leads, tabs, travel paths and sheet bounds, returning a structured result with actionable problem codes and messages; exceptions are reserved for structurally invalid inputs.
- **FR-007**: The system MUST use common-line cuts only after geometric validation.

### Key Entities

- **CutLayout**: Public input containing sheets, parts, outer contours and inner contours to be planned with the existing public nesting geometry types.
- **CutProcessProfile**: Public input containing entry, lead, pierce, tab, overcut, clearance and sequencing rules.
- **Cut Action**: One ordered movement or process operation.
- **Cut Plan**: The complete, traceable sequence for a sheet.
- **Lead and Tab**: Process-controlled entry/exit and temporary part-retention features.
- **Validation Problem**: A structured code and actionable message describing a rejected lead, tab, travel path or bounds check.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of reference plans cut inner features before outer contours.
- **SC-002**: Optimized sequences reduce rapid distance by at least 20% against the contour order supplied in `CutLayout`, using the same sheet, starting point and distance calculation for both sequences.
- **SC-003**: 100% of rejected leads, tabs and rapids include an actionable validation problem code and message in the structured planning result.

## Assumptions

- The supplied process profile determines what cut features are appropriate.
- The plan is not itself a machine-specific program.
