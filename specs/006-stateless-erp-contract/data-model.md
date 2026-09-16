# Data Model: Stateless ERP Nesting Contract

## ERP Nesting Request

Caller-owned, complete input for one calculation. It contains no references that require lookup.

| Field | Type | Rules |
|---|---|---|
| `contractVersion` | `number` | Positive major version supported by the dispatcher |
| `correlation` | `CorrelationRevision` | Required ERP identifiers; preserved verbatim |
| `job` | `JobInput` | Complete parts, stock, machine and process profile snapshots |
| `seed` | `number` | Finite deterministic seed |
| `overrides` | `Record<string, string \| number \| boolean>` | Optional caller overrides, recorded in the artifact |
| `requestedAt` | `string` | Optional ISO timestamp; excluded from input digest |

## Correlation Revision

| Field | Type | Rules |
|---|---|---|
| `orderId` | `string` | Required non-empty caller identifier |
| `revisionId` | `string` | Required revision identifier; revisions are independent |
| `requestId` | `string` | Required idempotency/correlation identifier |

## Job Input

| Field | Type | Rules |
|---|---|---|
| `parts` | `PartRequest[]` | Reuses the existing true-shape part model |
| `stock` | `StockItem[]` | Complete available sheets/remnants; stable IDs required |
| `machine` | `MachineSnapshot` | Caller-provided machine capabilities |
| `processProfile` | `ProcessProfileSnapshot` | Caller-provided process settings |
| `nesting` | `NestingSettings` | Clearances, objective, algorithm and acceleration options |

The adapter maps `parts`, `stock`, and `nesting` to existing `NestRequest` fields. Machine and
process snapshots are preserved for audit and are not resolved externally.

## Nesting Artifact

One serializable, self-contained emitted value.

| Field | Type | Rules |
|---|---|---|
| `contractVersion` | `number` | Matches the request major version |
| `status` | `'complete' \| 'partial' \| 'rejected' \| 'failed'` | Discriminated terminal outcome |
| `correlation` | `CorrelationRevision` | Copied from request |
| `snapshots` | `ResourceSnapshots` | Machine, stock and process snapshots used |
| `layout` | `NestResponse \| null` | Present for complete/partial outcomes |
| `warnings` | `ArtifactIssue[]` | Non-blocking conditions |
| `rejections` | `ArtifactIssue[]` | Request/resource-level rejection reasons |
| `unplaced` | `UnplacedItem[]` | Every affected item with a specific reason |
| `overrides` | `Record<string, string \| number \| boolean>` | Copied from request |
| `inputDigest` | `Sha256Digest` | Digest of canonical input projection |
| `outputDigest` | `Sha256Digest` | Digest of canonical output projection |

`processingTimeMs`, backend timings, timestamps, logs, correlation metadata, and digest fields are
excluded from digest projections. The output digest projection includes the canonical layout
decisions, selected sheets, cut/nesting plan, deterministic metrics, unplaced reasons, and any
serialized manufacturing output. A partial artifact remains complete and serializable; cancellation
or contract violations do not emit a partial artifact.

## Artifact Issue

```text
{
  code: string,
  message: string,
  itemId?: string,
  severity: 'warning' | 'rejection'
}
```

Codes are stable machine-readable identifiers. Messages are diagnostic and must not be required
for control flow.

## Unplaced Item

```text
{
  itemId: string,
  quantity: number,
  reasonCode: string,
  reason: string
}
```

`quantity` is a positive integer. Each affected item appears once per reason after deterministic
aggregation.

## State Transitions

```text
received -> validating -> calculating -> complete
                                  \-> partial
received -> validating -> rejected
calculating -> failed (contract/programmer violation only)
```

Expected unplaceable items and missing compatible resources produce `partial`, not Observable
errors. Invalid contract versions or programmer/contract violations produce the documented error
channel and no artifact emission.
