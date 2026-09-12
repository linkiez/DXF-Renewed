# Feature Specification: Part Preparation

**Feature Branch**: `001-part-preparation`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap workstream A.

## Clarifications

### Session 2026-09-12

- Q: Em qual unidade de medida as dimensões, tolerâncias e a largura de corte devem ser interpretadas e devolvidas pelo preparo? → A: Assumir `mm` quando a unidade não for declarada; rejeitar apenas unidade declarada e não suportada; normalizar internamente para a unidade canônica `mm`.
- Q: Quais operações de reparo o preparo pode executar automaticamente numa boundary? → A: Apenas fechamento de gap dentro da tolerância do chamador e normalização de orientação; auto-interseção real é rejeitada com issue específico, nunca reparada automaticamente.
- Q: Como o preparo deve classificar contornos internos aninhados — o que distingue um furo de uma ilha e até que profundidade? → A: Por profundidade de contenção (even-odd), com N níveis: nível 0 = outer, profundidade ímpar = hole, profundidade par ≥ 2 = island (material preservado); aninhamento ilimitado, sem achatamento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prepare Cuttable Parts (Priority: P1)

A planner submits drawing geometry and receives cuttable parts with clear boundaries, holes and
warnings before material is allocated.

**Why this priority**: Every later nesting and cutting decision depends on trustworthy part geometry.

**Independent Test**: Submit closed, open, duplicated and self-crossing contours and verify the
result either produces a classified part or a clear rejection reason; self-crossing contours are
always rejected and never repaired automatically.

**Acceptance Scenarios**:

1. **Given** a closed outer boundary with inner boundaries, **When** it is prepared, **Then** the
   outer boundary, holes and islands are distinguished correctly by containment depth (even-odd),
   including islands nested inside holes.
2. **Given** a safely repairable boundary, **When** it is prepared, **Then** the returned part
   identifies the repair and remains suitable for cutting.
3. **Given** an unsafe or open boundary, **When** it is prepared, **Then** it is rejected with a
   reason that identifies the affected source geometry.

### Edge Cases

- A boundary with zero usable area is rejected.
- Features smaller than the requested cut width are flagged for review.
- A gap within the caller's tolerance may be closed; larger gaps are not changed.
- A boundary with a real self-intersection is rejected with a specific issue and is never reordered or trimmed automatically.
- Boundary orientation is normalized without altering the intended part shape.
- Nested contours at any depth are classified by containment depth (odd depth = hole, even depth >= 2 = island) and are never flattened, merged or rejected for depth alone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST identify closed outer boundaries, holes, islands and open boundaries, classifying every closed contour by containment depth (even-odd): depth 0 is an outer boundary, odd depth is a hole, and even depth of 2 or more is an island of preserved material, with unlimited nesting levels.
- **FR-002**: The system MUST preserve source traceability for every returned or rejected boundary.
- **FR-003**: The system MUST remove duplicate and redundant boundary points without changing the
  intended part shape beyond caller-defined tolerance; simplification uses point reduction whose
  maximum deviation from the original contour does not exceed the caller tolerance.
- **FR-004**: The system MUST limit automatic repair to closing gaps within the caller's tolerance and normalizing boundary orientation, and MUST report every repair it performs.
- **FR-005**: The system MUST interpret the caller-supplied cut-width allowance as the total kerf
  and offset each boundary by exactly half of it, away from the preserved material (outer outward,
  holes and islands inward), consistently for outer and inner boundaries. The offset area of a
  reference circle MUST stay within 0.5% of the analytically expected area.
- **FR-006**: The system MUST return warnings for minimum-feature and area conditions using the
  caller-supplied `minFeatureSize` and `minArea` thresholds, expressed in the canonical unit (`mm`),
  emitted as `MIN_FEATURE` and `MIN_AREA`. Closure is reported as a `GAP_CLOSED` warning when a gap
  within tolerance is repaired; a closure that cannot be repaired within tolerance is a rejection
  (`OPEN_BOUNDARY` or `GAP_TOO_LARGE`), never a warning.
- **FR-007**: The system MUST produce the same prepared result for identical inputs and tolerance.
- **FR-008**: The system MUST interpret all dimensions, tolerances and cut-width allowances in the unit declared by the request, assume `mm` when no unit is declared, and reject any declared unit outside the supported set.
- **FR-009**: The system MUST normalize all measurements to the canonical internal unit (`mm`) before classification and output.
- **FR-010**: The system MUST reject a boundary whose real self-intersection remains after the permitted repairs, returning a specific issue tied to the affected source geometry.
- **FR-011**: The system MUST return the containment depth and hole/island classification for every returned boundary.

### Key Entities

- **Source Geometry**: Traceable drawing content supplied by the ERP or planner.
- **Prepared Part**: A cuttable item with an outer boundary, its nested inner boundaries (each carrying its containment depth and hole/island classification) and geometric properties.
- **Preparation Issue**: A warning or rejection reason tied to source geometry.
- **Boundary**: A closed contour produced by preparation; a raw extracted contour becomes a boundary
  once repaired and classified. "Contour" refers to the unprocessed extracted ring.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid reference parts retain correct outer/hole/island classification at every containment depth present in the reference set.
- **SC-002**: 100% of invalid reference parts return a specific issue rather than an unusable part.
- **SC-003**: Prepared output is identical across 100 runs of the same input.
- **SC-004**: 100% of requests omitting a unit are interpreted as `mm`, and 100% of requests declaring an unsupported unit are rejected with a specific issue.
- **SC-005**: 100% of reference boundaries containing a real self-intersection are rejected with a specific issue, and 0% are repaired automatically.
- **SC-006**: 100% of reference parts nested deeper than two levels classify every boundary by containment depth, and 0% are flattened, merged or rejected for depth alone.
- **SC-007**: A reference set of 500 parts is prepared in under 30 s on a single core, with per-part preparation under 30 ms typical.
- **SC-008**: 100% of offset reference boundaries stay within 0.5% of the analytically expected offset area.

## Assumptions

- Input geometry is supplied as parsed DXF entities; drawings are planar and use the entity types
  already handled by the existing DXF extraction.
- The ERP supplies all tolerance and process allowances with an explicit unit; when the unit is omitted, `mm` is assumed.
- The supported unit set is millimeters (`mm`) only; any other declared unit is rejected. Additional units require a future clarification.
- This feature does not store or alter source drawings.
- Containment depth is derived from geometry alone; the caller does not label contours as outer, hole or island.
- "Contour" names a raw extracted ring; "boundary" names that ring after preparation repairs and classification.
