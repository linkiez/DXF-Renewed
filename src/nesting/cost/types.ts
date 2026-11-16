import type { CutLayout, CutPlanResult } from '../cutPath/types'
import type { ErpCorrelation, ErpDigest, ErpNestingArtifact } from '../erp/types'

/** A value the caller may mark as an unverified estimate. */
export interface Estimable<T> {
  value: T
  /** The caller marks the value as an unverified estimate; dependent components become estimated. */
  estimated?: boolean
}

/** A monetary value, in major units, that may declare its own currency to be checked against the model's. */
export interface Money extends Estimable<number> {
  /** When present it must equal the model currency, else the model is rejected with `MIXED_CURRENCY`. */
  currency?: string
}

/** Unit in which a consumable's life is counted. */
export type ConsumableUnit = 'pierces' | 'cuttingSeconds'

/** A consumable with its cost and usage-based life. */
export interface Consumable {
  id: string
  cost: Money
  life?: Estimable<{ unit: ConsumableUnit; amount: number }>
}

/** Caller-supplied rates, speeds, lives, handling times and currency; all money in major units. */
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

/** Everything a cost report is calculated from; the module reads nothing else. */
export interface CostRequest {
  artifact: ErpNestingArtifact
  layout?: CutLayout
  cutPlan?: CutPlanResult
  costModel: CostModel
}

/** Cost categories, in the fixed order of `COST_CATEGORIES`. */
export type CostCategory = 'material' | 'cutting' | 'pierce' | 'travel' | 'consumable' | 'labour'
/** Whether a component is firm, based on estimated inputs, or has no value. */
export type ComponentStatus = 'complete' | 'estimated' | 'incomplete'
/** Status of a whole report; `unavailable` when no breakdown can be built. */
export type ReportStatus = ComponentStatus | 'unavailable'

/** One cost category of a part, sheet or job. */
export interface CostComponent {
  status: ComponentStatus
  /** Integer minor units; null exactly when status is incomplete. */
  amount: number | null
  reasons: string[]
}

/** Total of the six components with its status and the partial subtotal. */
export interface CostTotal {
  status: ComponentStatus
  amount: number | null
  partialSubtotal: number
}

/** The six components and the total of one scope. */
export interface CostGroup {
  components: Record<CostCategory, CostComponent>
  total: CostTotal
}

/** Usage measured for one placed part. */
export interface PartUsage {
  netArea: number
  cutLength: number
  travelLength: number
  pierceCount: number
  cuttingSeconds: number | null
  travelSeconds: number | null
  pierceSeconds: number | null
}

/** Cost of one placed part. */
export interface PartCost extends CostGroup {
  key: string
  shapeId: string
  instanceIndex: number
  sheetId: string
  usage: PartUsage
}

/** Cost of one sheet, priced as a full sheet or as a remnant. */
export interface SheetCost extends CostGroup {
  sheetId: string
  kind: 'sheet' | 'remnant'
}

/** Cost of all copies of one part type. */
export interface PartTypeCost extends CostGroup {
  shapeId: string
  quantity: number
}

/** An amount without an owner part that was distributed over the parts of its scope. */
export interface DistributedAmount {
  category: CostCategory
  scope: 'sheet' | 'job'
  scopeId?: string
  /** Integer minor units that had no owner part and were distributed over the parts of the scope. */
  amount: number
}

/** Itemized estimate by job, sheet, part and part type. */
export interface CostBreakdown {
  job: CostGroup
  sheets: SheetCost[]
  parts: PartCost[]
  partTypes: PartTypeCost[]
  distributed: DistributedAmount[]
}

/** Seconds by category; null where a time cannot be calculated. */
export interface TimeByCategory {
  cuttingSeconds: number | null
  travelSeconds: number | null
  pierceSeconds: number | null
  handlingSeconds: number | null
  totalSeconds: number | null
}

/** Operational summary of the job. */
export interface ProductionReport {
  sheetsUsed: number
  yield: number
  wasteArea: number
  totalArea: number
  time: { job: TimeByCategory; sheets: ({ sheetId: string } & TimeByCategory)[] }
  unplaced: { itemId: string; quantity: number; reasonCode: string; reason: string }[]
}

/** An explicit message about an incomplete, estimated, invalid or unavailable input. */
export interface CostNotice {
  severity: 'info' | 'warning' | 'error'
  code: CostNoticeCode | string
  message: string
  component?: CostCategory
  sheetId?: string
  partKey?: string
}

/** Serializable report linked to one artifact, with audit digests. */
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

/** Stable codes of the notices raised by the cost module. */
export type CostNoticeCode =
  | 'UNSUPPORTED_CONTRACT_VERSION'
  | 'NO_LAYOUT'
  | 'NO_CUT_PLAN'
  | 'INVALID_COST_MODEL'
  | 'MISSING_RATE'
  | 'MISSING_SPEED'
  | 'MISSING_DWELL'
  | 'MISSING_CONSUMABLE_LIFE'
  | 'MISSING_SHEET_PRICE'
  | 'MIXED_CURRENCY'
  | 'ESTIMATED_INPUT'
  | 'UNLINKED_ACTION'
  | 'UNKNOWN_PART'
  | 'PART_WITHOUT_AREA'
  | 'PART_WITHOUT_CUTTING'
  | 'AREA_WITHOUT_HOLES'
  | 'UNALLOCATED_DISTRIBUTED'
  | 'UNPLACED_NOT_CHARGED'
  | 'PLAN_SHEET_MISSING'
  | 'PLACEMENT_SHEET_UNRESOLVED'

/** The six cost categories in their fixed order. */
export const COST_CATEGORIES: readonly CostCategory[] = [
  'material', 'cutting', 'pierce', 'travel', 'consumable', 'labour',
]

/** A table of the export: fixed columns and rows of strings, numbers or empty cells. */
export interface CostTable {
  columns: string[]
  rows: (string | number | null)[][]
}
