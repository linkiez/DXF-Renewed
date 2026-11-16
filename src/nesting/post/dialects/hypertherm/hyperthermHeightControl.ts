import { message } from '../../machine/messages'
import type { Units, ValidationIssue } from '../../types'
import type { ProcessSettings } from './hyperthermSelection'

interface Variable {
  readonly key: string
  /** A value of zero means "not set" and writes nothing (the vendor post never writes zero for these). */
  readonly skipZero: boolean
  readonly variable: string
  readonly min: number
  readonly max: (units: Units) => number
}

const fixed = (max: number) => () => max

/** Vendor ranges of the `G59 V6xx` height control overrides (EDGE Connect Programmer Reference 809550). */
const VARIABLES: readonly Variable[] = [
  { key: 'arcVoltage', skipZero: true, variable: 'V600', min: 10, max: fixed(300) },
  { key: 'pierceTime', skipZero: true, variable: 'V601', min: 0, max: fixed(9) },
  { key: 'pierceHeightFactor', skipZero: true, variable: 'V602', min: 50, max: fixed(400) },
  { key: 'cutHeight', skipZero: true, variable: 'V603', min: 0, max: (units) => (units === 'inch' ? 1 : 25.4) },
  { key: 'transferHeightFactor', skipZero: true, variable: 'V604', min: 50, max: fixed(400) },
  { key: 'cutHeightDelay', skipZero: false, variable: 'V605', min: 0, max: fixed(5) },
  { key: 'kerfDetectTime', skipZero: false, variable: 'V606', min: 0, max: fixed(10) },
]

/** Override lines and the range issues found while building them. */
export interface HyperthermHeightControl {
  readonly lines: string[]
  readonly issues: ValidationIssue[]
}

/**
 * Write the optional `G59 V6xx` height control overrides and validate each against the vendor's range.
 *
 * A value outside its range is an error and is never clamped. The cut height is in the program units. A zero for
 * the voltage, the pierce time or a height means "not set" and writes nothing, as the vendor post does.
 *
 * @param settings - Process settings.
 * @param units - Program units.
 * @returns The lines (only for the keys present) and the issues.
 */
export function hyperthermHeightControl(settings: ProcessSettings, units: Units): HyperthermHeightControl {
  const lines: string[] = []
  const issues: ValidationIssue[] = []
  for (const item of VARIABLES) {
    const value = settings[item.key]
    if (typeof value !== 'number' || (item.skipZero && value === 0)) continue
    const max = item.max(units)
    lines.push(`G59 ${item.variable} F${Math.round(value * 10000) / 10000}`)
    if (value < item.min || value > max) {
      issues.push({
        severity: 'error',
        code: 'HEIGHT_CONTROL_OUT_OF_RANGE',
        message: message('HEIGHT_CONTROL_OUT_OF_RANGE', { variable: item.variable, value, range: `${item.min} a ${max}` }),
      })
    }
  }
  return { lines, issues }
}
