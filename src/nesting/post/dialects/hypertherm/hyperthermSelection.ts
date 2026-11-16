import { message } from '../../machine/messages'
import type { ValidationIssue } from '../../types'

/** Process settings as the host supplies them. */
export type ProcessSettings = Readonly<Record<string, boolean | number | string>>

const CODES: Readonly<Record<string, { variable: string; key: string; required: boolean }>> = {
  type: { variable: 'V502', key: 'torchType', required: true },
  material: { variable: 'V503', key: 'materialType', required: true },
  current: { variable: 'V504', key: 'current', required: true },
  gas: { variable: 'V505', key: 'shieldGas', required: true },
  thickness: { variable: 'V507', key: 'thickness', required: true },
  surface: { variable: 'V506', key: 'cuttingSurface', required: false },
}

/** Selection lines and the issues found while building them. */
export interface HyperthermSelection {
  readonly lines: string[]
  readonly issues: ValidationIssue[]
}

const formatCode = (value: number): string => String(Math.round(value * 10000) / 10000)

/**
 * Write the `G59 V5xx` cut chart selection in the order the vendor requires.
 *
 * The order comes from the configuration (`chartOrder`): torch type, material, current, gas, thickness, cutting
 * surface. A missing required key is an error; hand-supplied settings (without `chartSource: 'table'`) carry a
 * warning because the CNC refuses a `G59` value that is absent from its cut chart.
 *
 * @param settings - Process settings.
 * @param chartOrder - Order of the selection codes.
 * @returns The lines and the issues.
 */
export function hyperthermSelection(settings: ProcessSettings, chartOrder: readonly string[]): HyperthermSelection {
  const lines: string[] = []
  const issues: ValidationIssue[] = []
  for (const name of chartOrder) {
    const code = CODES[name]
    if (!code) continue
    const value = settings[code.key]
    if (typeof value === 'number') lines.push(`G59 ${code.variable} F${formatCode(value)}`)
    else if (code.required) issues.push({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: message('PROCESS_SETTING_REQUIRED', { key: code.key }) })
  }
  if (settings.chartSource !== 'table') issues.push({ severity: 'warning', code: 'CUTCHART_UNVERIFIED', message: message('CUTCHART_UNVERIFIED') })
  return { lines, issues }
}
