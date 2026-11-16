import type { SheetUsage, UsageResult } from './collectUsage'
import { estimateTimes } from './estimateTimes'
import type { CostModel, CostRequest, ProductionReport, TimeByCategory } from './types'

const sum = (values: readonly (number | null)[]): number | null =>
  values.some((value) => value === null) ? null : values.reduce<number>((total, value) => total + (value as number), 0)

const timesOf = (
  sheets: readonly SheetUsage[],
  model: CostModel,
  planPresent: boolean,
  handling: (number | null)[],
): TimeByCategory => {
  const measures = sheets.flatMap((sheet) => [...sheet.parts.map((part) => estimateTimes(part.actions, model)), estimateTimes(sheet.unallocated, model)])
  const pick = (read: (m: ReturnType<typeof estimateTimes>) => number | null): number | null =>
    planPresent ? sum(measures.map(read)) : null
  const cuttingSeconds = pick((m) => m.cuttingSeconds)
  const travelSeconds = pick((m) => m.travelSeconds)
  const pierceSeconds = pick((m) => m.pierceSeconds)
  const handlingSeconds = sum(handling)
  return {
    cuttingSeconds,
    travelSeconds,
    pierceSeconds,
    handlingSeconds,
    totalSeconds: sum([cuttingSeconds, travelSeconds, pierceSeconds, handlingSeconds]),
  }
}

const sheetHandling = (sheet: SheetUsage, model: CostModel): number | null =>
  sheet.parts.length === 0 ? 0 : (model.handling?.secondsPerSheet?.value ?? null)

/**
 * Builds the operational summary of a job: sheets used, the artifact's own yield and waste, the
 * time by category per sheet and for the job, and the unplaced items.
 *
 * Yield, waste and areas are copied from the artifact, never recomputed. A time is `null` where it
 * cannot be calculated (missing speed, dwell or handling, or no cut plan).
 *
 * @param request - Artifact, optional plan inputs and the cost model.
 * @param usage - Usage collected for the same request.
 * @returns The production report.
 */
export function buildProductionReport(request: CostRequest, usage: UsageResult): ProductionReport {
  const layout = request.artifact.layout
  const model = request.costModel
  const used = usage.sheets.filter((sheet) => sheet.parts.length > 0)
  const perSheet = usage.sheets.map((sheet) => ({
    sheetId: sheet.sheetId,
    ...timesOf([sheet], model, usage.planPresent, [sheetHandling(sheet, model)]),
  }))
  const jobHandling = used.length > 0 ? (model.handling?.secondsPerJob?.value ?? null) : 0
  return {
    sheetsUsed: used.length,
    yield: layout?.utilization ?? 0,
    wasteArea: layout?.wasteArea ?? 0,
    totalArea: layout?.totalArea ?? 0,
    time: {
      job: timesOf(usage.sheets, model, usage.planPresent, [jobHandling, ...usage.sheets.map((sheet) => sheetHandling(sheet, model))]),
      sheets: perSheet,
    },
    unplaced: request.artifact.unplaced.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      reasonCode: item.reasonCode,
      reason: item.reason,
    })),
  }
}
