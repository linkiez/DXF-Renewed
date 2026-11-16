import type { ActionUsage, SheetUsage, UsageResult } from './collectUsage'
import type { CostCategory, CostModel } from './types'

/** One input a category needs, with the value found in the model (undefined when absent). */
export interface Need {
  path: string
  code: 'MISSING_RATE' | 'MISSING_SPEED' | 'MISSING_DWELL' | 'MISSING_CONSUMABLE_LIFE' | 'MISSING_SHEET_PRICE'
  value: { estimated?: boolean } | undefined
  /** What the reason names instead of the path (a sheet id or a consumable id). */
  subject?: string
}

/** The inputs of every category and whether it depends on the cut plan. */
export interface CategoryNeeds {
  needs: Need[]
  needsPlan: boolean
}

const allActions = (usage: UsageResult): ActionUsage[] =>
  usage.sheets.flatMap((sheet) => [...sheet.parts.flatMap((part) => part.actions), ...sheet.unallocated])

const usedSheets = (usage: UsageResult): SheetUsage[] => usage.sheets.filter((sheet) => sheet.parts.length > 0)

const rate = (model: CostModel, name: keyof NonNullable<CostModel['rates']>): Need =>
  ({ path: `rates.${name}`, code: 'MISSING_RATE', value: model.rates?.[name] })

const handling = (model: CostModel, name: keyof NonNullable<CostModel['handling']>): Need =>
  ({ path: `handling.${name}`, code: 'MISSING_RATE', value: model.handling?.[name] })

const speed = (model: CostModel, name: 'cutting' | 'rapid'): Need =>
  ({ path: `speeds.${name}`, code: 'MISSING_SPEED', value: model.speeds?.[name] })

const dwell = (model: CostModel): Need =>
  ({ path: 'speeds.pierceDwellSeconds', code: 'MISSING_DWELL', value: model.speeds?.pierceDwellSeconds })

const materialNeeds = (usage: UsageResult, model: CostModel): Need[] =>
  usedSheets(usage).map((sheet) => {
    const group = sheet.kind === 'remnant' ? 'remnant' : 'fullSheet'
    return { path: `material.${group}.${sheet.sheetId}`, code: 'MISSING_SHEET_PRICE', value: model.material[group][sheet.sheetId], subject: sheet.sheetId }
  })

const consumableNeeds = (model: CostModel, usesCutSpeed: boolean): Need[] =>
  model.consumables.flatMap((consumable) => {
    const needs: Need[] = [
      { path: `consumables.${consumable.id}.cost`, code: 'MISSING_RATE', value: consumable.cost },
      { path: `consumables.${consumable.id}.life`, code: 'MISSING_CONSUMABLE_LIFE', value: consumable.life, subject: consumable.id },
    ]
    if (consumable.life?.value.unit === 'cuttingSeconds' && usesCutSpeed) needs.push(speed(model, 'cutting'))
    return needs
  })

const labourNeeds = (
  usage: UsageResult,
  model: CostModel,
  uses: { cut: boolean; rapid: boolean; dwell: boolean },
): Need[] => {
  const needs = [rate(model, 'labourPerHour')]
  if (uses.cut) needs.push(speed(model, 'cutting'))
  if (uses.rapid) needs.push(speed(model, 'rapid'))
  if (uses.dwell) needs.push(dwell(model))
  if (usedSheets(usage).length > 0) needs.push(handling(model, 'secondsPerSheet'), handling(model, 'secondsPerJob'))
  return needs
}

const unique = (needs: Need[]): Need[] => {
  const seen = new Set<string>()
  return needs.filter((need) => !seen.has(need.path) && seen.add(need.path))
}

/**
 * Lists, for each cost category, the inputs it depends on given what the usage actually needs: a
 * model speed only when some action carries no feed, a dwell only when some pierce carries none,
 * and so on. The list is independent of the amounts.
 *
 * @param usage - Usage collected from the artifact and the cut plan.
 * @param model - Cost model to look the inputs up in.
 * @returns Needs per category and whether the category depends on a cut plan.
 */
export function componentNeeds(usage: UsageResult, model: CostModel): Record<CostCategory, CategoryNeeds> {
  const actions = allActions(usage)
  const uses = {
    cut: actions.some((a) => a.category === 'cut' && a.length > 0 && a.feed === null),
    rapid: actions.some((a) => a.category === 'travel' && a.length > 0),
    dwell: actions.some((a) => a.category === 'pierce' && a.dwell === null),
  }
  const withCut = (needs: Need[]): Need[] => (uses.cut ? [...needs, speed(model, 'cutting')] : needs)
  const withRapid = (needs: Need[]): Need[] => (uses.rapid ? [...needs, speed(model, 'rapid')] : needs)
  return {
    material: { needs: unique(materialNeeds(usage, model)), needsPlan: false },
    cutting: { needs: unique(withCut([rate(model, 'cuttingPerHour')])), needsPlan: true },
    pierce: { needs: [rate(model, 'piercePerUnit')], needsPlan: true },
    travel: { needs: unique(withRapid([rate(model, 'travelPerHour')])), needsPlan: true },
    consumable: { needs: unique(consumableNeeds(model, uses.cut)), needsPlan: true },
    labour: { needs: unique(labourNeeds(usage, model, uses)), needsPlan: true },
  }
}
