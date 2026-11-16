import type { CutChartEntry } from './types'

/**
 * Turn a cut chart entry into the process settings that the Hypertherm processor reads.
 *
 * The result carries `chartSource: 'table'`, so the program does not get the unverified-cut-chart warning.
 *
 * @param entry - Entry found in the table.
 * @returns Scalar process settings.
 */
export function cutChartSettings(entry: CutChartEntry): Record<string, boolean | number | string> {
  const { chart, height, outputs } = entry
  return {
    torchType: chart.type,
    materialType: chart.material,
    current: chart.current,
    shieldGas: chart.gas,
    thickness: chart.thickness,
    ...(chart.surface !== undefined ? { cuttingSurface: chart.surface } : {}),
    ...(height.arcVoltage !== undefined ? { arcVoltage: height.arcVoltage } : {}),
    ...(height.pierceTime !== undefined ? { pierceTime: height.pierceTime } : {}),
    ...(height.pierceHeightFactor !== undefined ? { pierceHeightFactor: height.pierceHeightFactor } : {}),
    ...(height.cutHeight !== undefined ? { cutHeight: height.cutHeight } : {}),
    ...(height.transferHeightFactor !== undefined ? { transferHeightFactor: height.transferHeightFactor } : {}),
    ...(height.cutHeightDelay !== undefined ? { cutHeightDelay: height.cutHeightDelay } : {}),
    kerf: entry.kerf.value,
    feed: entry.feed.value,
    leadInFeed: entry.feed.leadIn,
    trueHole: entry.toggles.trueHole,
    m50n: outputs.m50n,
    rt: outputs.rt,
    hs: outputs.hs,
    chartSource: 'table',
  }
}
