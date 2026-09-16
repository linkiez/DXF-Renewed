# Feature Specification: Stateless ERP Nesting Contract

**Feature Branch**: `006-stateless-erp-contract`
**Created**: 2026-09-11
**Status**: Draft
**Input**: Nesting roadmap ERP integration workstream.

## Clarifications

### Session 2026-09-16

- Q: Qual deve ser o formato canônico da interface do contrato ERP? → A: Option B — TypeScript-only, usando interfaces exportadas, com RxJS para a superfície assíncrona.
- Q: Como o artefato deve representar o resultado do cálculo e os motivos de itens não processados? → A: Option A — status discriminado com listas tipadas de avisos, rejeições e itens não alocados.
- Q: Você quer usar Zod para validação em runtime e manter JSON canônico determinístico com SHA-256 para os digests? → A: Sim — Zod valida os contratos em runtime; os digests usam JSON canônico determinístico e SHA-256.
- Q: Quando faltar um recurso compatível, o cálculo deve continuar parcialmente ou ser rejeitado sem gerar layout? → A: Option B — continuar parcialmente e retornar itens não alocados.
- Q: Como o contrato deve evoluir quando novos campos forem adicionados sem quebrar consumidores existentes? → A: Option A — versionar explicitamente o contrato e exigir nova versão major para mudanças incompatíveis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit and Correlate a Nesting Request (Priority: P1)

The ERP submits a complete production-order revision and receives one complete calculation artifact
that it can persist, audit, approve and distribute.

**Why this priority**: The ERP boundary is required for safe operational use.

**Independent Test**: Submit the same canonical request twice and verify matching result digest;
submit another revision and verify it is calculated independently.

**Acceptance Scenarios**:

1. **Given** a complete order revision, **When** it is calculated, **Then** the response preserves
   its correlation values and reports all selected machine, stock and profile snapshots.
2. **Given** a missing compatible resource, **When** it is calculated, **Then** the response has an
   explicit rejection or unplaced reason and does not alter ERP state.
3. **Given** the same canonical request and seed, **When** it is repeated, **Then** the response has
   the same layout, plan and output digest.

### Edge Cases

- Correlation timestamps do not alter the calculation digest.
- A revised order does not replace a previous result implicitly.
- A caller override is recorded in the returned artifact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept all data required to calculate a job in one caller-owned request.
- **FR-002**: The system MUST return one serializable, self-contained artifact.
- **FR-003**: The system MUST not create, read, update or delete ERP records, files, inventory,
  history or technology profiles.
- **FR-004**: The system MUST carry ERP identifiers for correlation without resolving them externally.
- **FR-005**: The system MUST include input and output digests sufficient to audit program release.
  The output digest MUST cover the canonical layout decisions, selected sheets, cut/nesting plan,
  deterministic metrics, unplaced reasons, and serialized manufacturing output when present.
- **FR-006**: The system MUST return explicit status, warnings and unplaced reasons.
- **FR-007**: The system MUST preserve deterministic results for equal canonical requests.
- **FR-008**: The public contract MUST be defined by exported TypeScript interfaces, and asynchronous calculation flows MUST use RxJS Observables.
- **FR-009**: The nesting artifact MUST expose a discriminated status plus typed `warnings`, `rejections`, and `unplaced` collections; expected processing outcomes MUST remain normal Observable emissions.
- **FR-010**: Runtime contract validation MUST use Zod schemas aligned with the exported TypeScript interfaces.
- **FR-011**: Input and output digests MUST be SHA-256 hashes of deterministic canonical JSON, excluding timestamps and operational-only fields.
- **FR-012**: When a compatible resource is missing, the calculation MUST continue with available resources, return a partial artifact, and record each affected item in the typed `unplaced` collection with a specific reason.
- **FR-013**: The contract MUST expose an explicit version, preserve backward-compatible additions within a major version, and require a new major version for incompatible changes.

### Key Entities

- **ERP Nesting Request**: Caller-owned complete job input.
- **Nesting Artifact**: Self-contained result for ERP storage and release workflow.
- **Correlation Revision**: ERP identifier used to associate, not retrieve, a calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of completed requests return an artifact containing correlation and audit digests.
- **SC-002**: 100 consecutive equal requests return matching output digests.
- **SC-003**: No calculation changes external stock, order or profile state.

## Assumptions

- The ERP handles authentication, authorization, queueing, persistence and stock reservation.
- All requested machine and material master data is present in the request.
