# Cost Reporting API Contract

Public contract of feature 008. Declarations only: the implementation lives in `src/nesting/cost/`.
Types referenced from existing modules are reused, not redefined. The shared linking modules
(`src/nesting/linking/`) are internal and not part of this contract.

```ts
import type { Observable } from 'rxjs'
import type { CutLayout, CutPlanResult } from '../../../src/nesting/cutPath/types'
import type { ErpCorrelation, ErpDigest, ErpNestingArtifact } from '../../../src/nesting/erp/types'

export interface Estimable<T> {
  value: T
  /** The caller marks the value as an unverified estimate; dependent components become estimated. */
  estimated?: boolean
}

export interface Money extends Estimable<number> {
  /** When present it must equal the model currency, else the model is rejected with MIXED_CURRENCY. */
  currency?: string
}

export type ConsumableUnit = 'pierces' | 'cuttingSeconds'

export interface Consumable {
  id: string
  cost: Money
  life?: Estimable<{ unit: ConsumableUnit; amount: number }>
}

export interface CostModel {
  contractVersion: 1
  currency: { code: string; minorUnitDigits: number }
  geometryUnitsPerMeter: number
  material: {
    fullSheet: Record<string, Money>
    remnant: Record<string, Money>
  }
  speeds?: {
    cutting?: Estimable<number>
    rapid?: Estimable<number>
    pierceDwellSeconds?: Estimable<number>
  }
  rates?: {
    cuttingPerHour?: Money
    travelPerHour?: Money
    piercePerUnit?: Money
    labourPerHour?: Money
  }
  handling?: {
    secondsPerSheet?: Estimable<number>
    secondsPerJob?: Estimable<number>
  }
  consumables: Consumable[]
}

export interface CostRequest {
  artifact: ErpNestingArtifact
  layout?: CutLayout
  cutPlan?: CutPlanResult
  costModel: CostModel
}

export type CostCategory = 'material' | 'cutting' | 'pierce' | 'travel' | 'consumable' | 'labour'
export type ComponentStatus = 'complete' | 'estimated' | 'incomplete'
export type ReportStatus = ComponentStatus | 'unavailable'

export interface CostComponent {
  status: ComponentStatus
  /** Integer minor units; null exactly when status is incomplete. */
  amount: number | null
  reasons: string[]
}

export interface CostTotal {
  status: ComponentStatus
  amount: number | null
  partialSubtotal: number
}

export interface CostGroup {
  components: Record<CostCategory, CostComponent>
  total: CostTotal
}

export interface PartUsage {
  netArea: number
  cutLength: number
  travelLength: number
  pierceCount: number
  cuttingSeconds: number | null
  travelSeconds: number | null
  pierceSeconds: number | null
}

export interface PartCost extends CostGroup {
  key: string
  shapeId: string
  instanceIndex: number
  sheetId: string
  usage: PartUsage
}

export interface SheetCost extends CostGroup {
  sheetId: string
  kind: 'sheet' | 'remnant'
}

export interface PartTypeCost extends CostGroup {
  shapeId: string
  quantity: number
}

export interface DistributedAmount {
  category: CostCategory
  scope: 'sheet' | 'job'
  scopeId?: string
  /** Integer minor units that had no owner part and were distributed over the parts of the scope. */
  amount: number
}

export interface CostBreakdown {
  job: CostGroup
  sheets: SheetCost[]
  parts: PartCost[]
  partTypes: PartTypeCost[]
  distributed: DistributedAmount[]
}

export interface TimeByCategory {
  cuttingSeconds: number | null
  travelSeconds: number | null
  pierceSeconds: number | null
  handlingSeconds: number | null
  totalSeconds: number | null
}

export interface ProductionReport {
  sheetsUsed: number
  yield: number
  wasteArea: number
  totalArea: number
  time: { job: TimeByCategory; sheets: ({ sheetId: string } & TimeByCategory)[] }
  unplaced: { itemId: string; quantity: number; reasonCode: string; reason: string }[]
}

export interface CostNotice {
  severity: 'info' | 'warning' | 'error'
  code: string
  message: string
  component?: CostCategory
  sheetId?: string
  partKey?: string
}

export interface CostReport {
  contractVersion: 1
  status: ReportStatus
  correlation: ErpCorrelation
  artifactDigests: { input: ErpDigest; output: ErpDigest }
  costModelDigest: ErpDigest
  currency: { code: string; minorUnitDigits: number }
  breakdown: CostBreakdown | null
  production: ProductionReport | null
  notices: CostNotice[]
  reportDigest: ErpDigest
}

/** Pure and synchronous: no digests, no I/O, no time; never mutates the request. */
export declare function buildCostBreakdown(request: CostRequest): {
  breakdown: CostBreakdown | null
  production: ProductionReport | null
  notices: CostNotice[]
}

/** Validates a cost model beyond its schema; returns every issue, never throws. */
export declare function validateCostModel(model: CostModel): CostNotice[]

/**
 * Cold Observable that emits one report and completes. An invalid cost model, a rejected artifact or
 * an unsupported version yields an `unavailable` report with notices; a structurally invalid request
 * rejects the Observable, like the ERP nesting flow.
 */
export declare function calculateCostReport(request: CostRequest): Observable<CostReport>

export interface CostTable {
  columns: string[]
  rows: (string | number | null)[][]
}

export declare function costReportTables(report: CostReport): { parts: CostTable; job: CostTable }

/** RFC 4180 text for each table: UTF-8, comma, LF, header row, decimal point. */
export declare function costReportToCsv(report: CostReport): { parts: string; job: string }
```

## Export columns

Both tables have a header row. Numbers use a decimal point and no thousands separator. Amounts are
integers in minor units; lengths, areas and seconds have exactly three decimals; an incomplete amount
or time is an empty cell. Fields are quoted when they contain a comma, a quote or a line break, with
quotes doubled.

### `parts` table (one row per placed part, in artifact order)

`part_key`, `shape_id`, `instance_index`, `sheet_id`, `net_area`, `cut_length`, `travel_length`,
`pierce_count`, `cutting_seconds`, `travel_seconds`, `pierce_seconds`, `material`, `cutting`, `pierce`,
`travel`, `consumable`, `labour`, `total`, `status`, `currency`.

### `job` table (job rows first, then each sheet in artifact order)

`scope` (`job` or `sheet`), `scope_id` (empty for the job, the sheet id otherwise), `metric`, `status`,
`value`, `currency`.

Metrics, in this fixed order, for every scope:
`cost.material`, `cost.cutting`, `cost.pierce`, `cost.travel`, `cost.consumable`, `cost.labour`,
`cost.total`, `cost.partial_subtotal`, `time.cutting_seconds`, `time.travel_seconds`,
`time.pierce_seconds`, `time.handling_seconds`, `time.total_seconds`.

Job scope adds, after the above: `production.sheets_used`, `production.yield`, `production.waste_area`,
`production.total_area`, `production.unplaced_quantity`.

Reading the file back and summing the `parts` amounts per category gives the `job` amounts exactly.
