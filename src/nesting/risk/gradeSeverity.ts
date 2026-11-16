import type { RiskSeverity } from './types'

/**
 * Grades a finding from how far the measure is past its limit.
 *
 * @param ratio - Measured value over the limit, so 1 or more means the limit was reached.
 * @param criticalFactor - Factor from the profile; absent means findings are never critical.
 * @returns `critical` when the ratio reaches the critical factor, otherwise `warning`.
 */
export function gradeSeverity(ratio: number, criticalFactor: number | undefined): RiskSeverity {
  return criticalFactor !== undefined && ratio >= criticalFactor ? 'critical' : 'warning'
}
