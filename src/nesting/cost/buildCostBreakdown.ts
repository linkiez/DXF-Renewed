import { apportion } from './apportion'
import { buildProductionReport } from './buildProductionReport'
import { collectUsage } from './collectUsage'
import type { PartUsageRecord, SheetUsage } from './collectUsage'
import type { CategoryStatusInfo } from './categoryStatus'
import { componentAmounts } from './componentAmounts'
import type { ComponentAmounts } from './componentAmounts'
import type { ActionMeasures } from './estimateTimes'
import { costMessages } from './messages'
import { statusNotices } from './statusNotices'
import { validateCostModel } from './validateCostModel'
import { ERP_CONTRACT_VERSION } from '../erp/types'
import { COST_CATEGORIES } from './types'
import type {
  CostBreakdown,
  ComponentStatus,
  CostCategory,
  CostGroup,
  CostNotice,
  CostRequest,
  DistributedAmount,
  PartCost,
  PartTypeCost,
  ProductionReport,
  SheetCost,
} from './types'

type Amounts = Record<CostCategory, number>

const zero = (): Amounts => ({ material: 0, cutting: 0, pierce: 0, travel: 0, consumable: 0, labour: 0 })

const add = (target: Amounts, source: Amounts): void => {
  for (const category of COST_CATEGORIES) target[category] += source[category]
}

const worstStatus = (statuses: readonly ComponentStatus[]): ComponentStatus => {
  if (statuses.includes('incomplete')) return 'incomplete'
  return statuses.includes('estimated') ? 'estimated' : 'complete'
}

const groupOf = (amounts: Amounts, status: Record<CostCategory, CategoryStatusInfo>): CostGroup => {
  const components = {} as CostGroup['components']
  let subtotal = 0
  for (const category of COST_CATEGORIES) {
    const incomplete = status[category].status === 'incomplete'
    components[category] = { status: status[category].status, amount: incomplete ? null : amounts[category], reasons: status[category].reasons }
    if (!incomplete) subtotal += amounts[category]
  }
  const overall = worstStatus(COST_CATEGORIES.map((category) => status[category].status))
  return { components, total: { status: overall, amount: overall === 'incomplete' ? null : subtotal, partialSubtotal: subtotal } }
}

const roundedByPart = (amounts: ComponentAmounts): Amounts[] => {
  const perCategory = Object.fromEntries(
    COST_CATEGORIES.map((category) => [category, apportion(amounts.exact[category])]),
  ) as Record<CostCategory, number[]>
  return amounts.parts.map((_, index) => {
    const row = zero()
    for (const category of COST_CATEGORIES) row[category] = perCategory[category][index]
    return row
  })
}

const usageOf = (part: PartUsageRecord, measure: ActionMeasures): PartCost['usage'] => ({
  netArea: part.netArea,
  cutLength: measure.cutLength,
  travelLength: measure.travelLength,
  pierceCount: measure.pierceCount,
  cuttingSeconds: measure.cuttingSeconds,
  travelSeconds: measure.travelSeconds,
  pierceSeconds: measure.pierceSeconds,
})

const partCosts = (amounts: ComponentAmounts, rounded: readonly Amounts[]): PartCost[] =>
  amounts.parts.map((part, index) => ({
    key: part.key,
    shapeId: part.shapeId,
    instanceIndex: part.instanceIndex,
    sheetId: part.sheetId,
    usage: usageOf(part, amounts.measures[index]),
    ...groupOf(rounded[index], amounts.status),
  }))

const sheetCosts = (sheets: readonly SheetUsage[], amounts: ComponentAmounts, rounded: readonly Amounts[]): SheetCost[] =>
  sheets.map((sheet) => {
    const total = zero()
    amounts.parts.forEach((part, index) => {
      if (part.sheetId === sheet.sheetId) add(total, rounded[index])
    })
    return { sheetId: sheet.sheetId, kind: sheet.kind, ...groupOf(total, amounts.status) }
  })

const partTypeCosts = (amounts: ComponentAmounts, rounded: readonly Amounts[]): PartTypeCost[] => {
  const types = new Map<string, { quantity: number; total: Amounts }>()
  amounts.parts.forEach((part, index) => {
    const entry = types.get(part.shapeId) ?? { quantity: 0, total: zero() }
    entry.quantity += 1
    add(entry.total, rounded[index])
    types.set(part.shapeId, entry)
  })
  return [...types].map(([shapeId, entry]) => ({ shapeId, quantity: entry.quantity, ...groupOf(entry.total, amounts.status) }))
}

const distributedOf = (amounts: ComponentAmounts): { items: DistributedAmount[]; notices: CostNotice[] } => {
  const items: DistributedAmount[] = []
  const notices: CostNotice[] = []
  for (const entry of amounts.distributed) {
    const amount = Math.round(entry.exact)
    items.push({ category: entry.category, scope: entry.scope, ...(entry.scopeId ? { scopeId: entry.scopeId } : {}), amount })
    notices.push({
      severity: 'info',
      code: 'UNALLOCATED_DISTRIBUTED',
      message: costMessages.unallocatedDistributed(entry.category, entry.scope, entry.scopeId ?? '', amount),
      component: entry.category,
      ...(entry.scopeId ? { sheetId: entry.scopeId } : {}),
    })
  }
  return { items, notices }
}

const unplacedNotices = (request: CostRequest): CostNotice[] =>
  request.artifact.unplaced.map((item) => ({
    severity: 'info',
    code: 'UNPLACED_NOT_CHARGED',
    message: costMessages.unplacedNotCharged(item.itemId, item.quantity),
  }))

const blockingNotices = (request: CostRequest): CostNotice[] => {
  const { artifact } = request
  if (artifact.contractVersion !== ERP_CONTRACT_VERSION) {
    return [{ severity: 'error', code: 'UNSUPPORTED_CONTRACT_VERSION', message: costMessages.unsupportedContractVersion(artifact.contractVersion, ERP_CONTRACT_VERSION) }]
  }
  if (!artifact.layout) {
    return [{ severity: 'error', code: 'NO_LAYOUT', message: costMessages.noLayout(artifact.status) }]
  }
  return validateCostModel(request.costModel)
}

/**
 * Calculates the cost breakdown of a completed nesting job.
 *
 * Pure and synchronous: it reads only the request, never recomputes layout, sequence or metrics,
 * and never mutates its input. Amounts are integers in the smallest currency unit; every part
 * amount is apportioned so the parts add up exactly to the job for each component.
 *
 * @param request - Artifact, optional layout and cut plan, and the cost model.
 * @returns The breakdown and the production report (both `null` when nothing can be calculated)
 *   and the notices.
 * @example
 * ```typescript
 * const { breakdown } = buildCostBreakdown({ artifact, layout, cutPlan, costModel })
 * ```
 */
export function buildCostBreakdown(request: CostRequest): {
  breakdown: CostBreakdown | null
  production: ProductionReport | null
  notices: CostNotice[]
} {
  const blocking = blockingNotices(request)
  if (blocking.length > 0) return { breakdown: null, production: null, notices: blocking }
  const usage = collectUsage(request)
  const amounts = componentAmounts(usage, request.costModel)
  const rounded = roundedByPart(amounts)
  const total = zero()
  for (const row of rounded) add(total, row)
  const distributed = distributedOf(amounts)
  return {
    breakdown: {
      job: groupOf(total, amounts.status),
      sheets: sheetCosts(usage.sheets, amounts, rounded),
      parts: partCosts(amounts, rounded),
      partTypes: partTypeCosts(amounts, rounded),
      distributed: distributed.items,
    },
    production: buildProductionReport(request, usage),
    notices: [...usage.notices, ...statusNotices(amounts.needs), ...distributed.notices, ...unplacedNotices(request)],
  }
}
