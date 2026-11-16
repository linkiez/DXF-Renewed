import type { PartUsageRecord, SheetUsage, UsageResult } from './collectUsage'
import { categoryStatus } from './categoryStatus'
import type { CategoryStatusInfo } from './categoryStatus'
import { componentNeeds } from './componentNeeds'
import type { CategoryNeeds } from './componentNeeds'
import { estimateTimes } from './estimateTimes'
import type { ActionMeasures } from './estimateTimes'
import type { CostCategory, CostModel } from './types'

/** An amount that had no owner part and was distributed over the parts of its scope. */
export interface ExactDistribution {
  category: CostCategory
  scope: 'sheet' | 'job'
  scopeId?: string
  /** Exact (unrounded) amount in minor units. */
  exact: number
}

/** Exact amounts per part, in the order of `parts`. */
export interface ComponentAmounts {
  parts: PartUsageRecord[]
  measures: ActionMeasures[]
  /** Exact (unrounded) minor units per category and part; zero for an incomplete category. */
  exact: Record<CostCategory, number[]>
  distributed: ExactDistribution[]
  /** Status and reasons of each category. */
  status: Record<CostCategory, CategoryStatusInfo>
  /** The inputs each category depends on, for the notices. */
  needs: Record<CostCategory, CategoryNeeds>
}

type TimedCategory = 'cutting' | 'pierce' | 'travel' | 'consumable' | 'labour'

const SECONDS_PER_HOUR = 3600

const required = (value: number | undefined, path: string): number => {
  if (value === undefined) throw new RangeError(`missing cost input: ${path}`)
  return value
}

const minorUnits = (model: CostModel): ((major: number) => number) => {
  const factor = 10 ** model.currency.minorUnitDigits
  return (major) => major * factor
}

const perSecond = (model: CostModel, ratePerHour: number | undefined, path: string): number =>
  minorUnits(model)(required(ratePerHour, path)) / SECONDS_PER_HOUR

const sharesOf = (areas: readonly number[]): number[] => {
  const positive = areas.map((area) => Math.max(area, 0))
  const total = positive.reduce((sum, area) => sum + area, 0)
  return total > 0 ? positive.map((area) => area / total) : areas.map(() => 1 / areas.length)
}

const consumableCost = (measure: ActionMeasures, model: CostModel): number => {
  const toMinor = minorUnits(model)
  let total = 0
  for (const consumable of model.consumables) {
    const life = required(consumable.life?.value.amount, `consumables.${consumable.id}.life`)
    const unit = consumable.life?.value.unit
    const usage = unit === 'pierces' ? measure.pierceCount : required(measure.cuttingSeconds ?? undefined, 'speeds.cutting')
    total += (usage * toMinor(consumable.cost.value)) / life
  }
  return total
}

const categoryAmount = (category: TimedCategory, measure: ActionMeasures, model: CostModel): number => {
  const toMinor = minorUnits(model)
  const rates = model.rates
  switch (category) {
    case 'cutting': return required(measure.cuttingSeconds ?? undefined, 'speeds.cutting') * perSecond(model, rates?.cuttingPerHour?.value, 'rates.cuttingPerHour')
    case 'travel': return required(measure.travelSeconds ?? undefined, 'speeds.rapid') * perSecond(model, rates?.travelPerHour?.value, 'rates.travelPerHour')
    case 'pierce': return measure.pierceCount * toMinor(required(rates?.piercePerUnit?.value, 'rates.piercePerUnit'))
    case 'consumable': return consumableCost(measure, model)
    case 'labour': return machineSeconds(measure) * perSecond(model, rates?.labourPerHour?.value, 'rates.labourPerHour')
  }
}

const machineSeconds = (measure: ActionMeasures): number =>
  required(measure.cuttingSeconds ?? undefined, 'speeds.cutting') +
  required(measure.travelSeconds ?? undefined, 'speeds.rapid') +
  required(measure.pierceSeconds ?? undefined, 'speeds.pierceDwellSeconds')

const emptyExact = (count: number): Record<CostCategory, number[]> => ({
  material: new Array<number>(count).fill(0),
  cutting: new Array<number>(count).fill(0),
  pierce: new Array<number>(count).fill(0),
  travel: new Array<number>(count).fill(0),
  consumable: new Array<number>(count).fill(0),
  labour: new Array<number>(count).fill(0),
})

const materialPrice = (sheet: SheetUsage, model: CostModel): number => {
  const prices = sheet.kind === 'remnant' ? model.material.remnant : model.material.fullSheet
  return minorUnits(model)(required(prices[sheet.sheetId]?.value, `material.${sheet.kind === 'remnant' ? 'remnant' : 'fullSheet'}.${sheet.sheetId}`))
}

const spread = (
  exact: Record<CostCategory, number[]>,
  category: CostCategory,
  indexes: readonly number[],
  areas: readonly number[],
  amount: number,
): void => {
  const shares = sharesOf(areas)
  indexes.forEach((partIndex, position) => {
    exact[category][partIndex] += amount * shares[position]
  })
}

const TIMED: readonly TimedCategory[] = ['cutting', 'travel', 'pierce', 'consumable', 'labour']

/**
 * Computes the exact (unrounded) amount of each cost category for every placed part.
 *
 * Material is the sheet price (full sheet or remnant) distributed by net area; the other
 * categories come from time, counts and the supplied rates. Amounts that no part owns (unlinked
 * actions, handling per sheet and per job) are distributed over the parts of their scope by net
 * area and reported in `distributed`. A category whose inputs are missing is not calculated: its
 * amounts stay zero and its status says why.
 *
 * @param usage - Usage collected from the artifact and the cut plan.
 * @param model - Cost model with the rates, speeds, prices and consumables.
 * @returns Exact amounts per category and part, the measures, the distributed amounts and statuses.
 */
export function componentAmounts(usage: UsageResult, model: CostModel): ComponentAmounts {
  const needs = componentNeeds(usage, model)
  const status = Object.fromEntries(
    (Object.keys(needs) as CostCategory[]).map((category) => [category, categoryStatus(needs[category], usage.planPresent)]),
  ) as Record<CostCategory, CategoryStatusInfo>
  const active = (category: CostCategory): boolean => status[category].status !== 'incomplete'
  const parts = usage.sheets.flatMap((sheet) => sheet.parts)
  const measures = parts.map((part) => estimateTimes(part.actions, model))
  const exact = emptyExact(parts.length)
  const distributed: ExactDistribution[] = []

  parts.forEach((_, index) => {
    for (const category of TIMED) if (active(category)) exact[category][index] = categoryAmount(category, measures[index], model)
  })

  let offset = 0
  for (const sheet of usage.sheets) {
    const indexes = sheet.parts.map((_, position) => offset + position)
    offset += sheet.parts.length
    if (indexes.length === 0) continue
    const areas = sheet.parts.map((part) => part.netArea)
    if (active('material')) spread(exact, 'material', indexes, areas, materialPrice(sheet, model))
    const unallocated = estimateTimes(sheet.unallocated, model)
    for (const category of TIMED.filter(active)) {
      const amount = categoryAmount(category, unallocated, model)
      if (amount <= 0) continue
      spread(exact, category, indexes, areas, amount)
      distributed.push({ category, scope: 'sheet', scopeId: sheet.sheetId, exact: amount })
    }
    if (active('labour')) addHandling(exact, distributed, model, { scope: 'sheet', scopeId: sheet.sheetId, indexes, areas })
  }
  if (parts.length > 0 && active('labour')) {
    addHandling(exact, distributed, model, { scope: 'job', indexes: parts.map((_, index) => index), areas: parts.map((part) => part.netArea) })
  }

  return { parts, measures, exact, distributed, status, needs }
}

const addHandling = (
  exact: Record<CostCategory, number[]>,
  distributed: ExactDistribution[],
  model: CostModel,
  target: { scope: 'sheet' | 'job'; scopeId?: string; indexes: readonly number[]; areas: readonly number[] },
): void => {
  const seconds = target.scope === 'sheet' ? model.handling?.secondsPerSheet?.value : model.handling?.secondsPerJob?.value
  const amount = required(seconds, `handling.${target.scope === 'sheet' ? 'secondsPerSheet' : 'secondsPerJob'}`) *
    perSecond(model, model.rates?.labourPerHour?.value, 'rates.labourPerHour')
  spread(exact, 'labour', target.indexes, target.areas, amount)
  if (amount > 0) distributed.push({ category: 'labour', scope: target.scope, ...(target.scopeId ? { scopeId: target.scopeId } : {}), exact: amount })
}
