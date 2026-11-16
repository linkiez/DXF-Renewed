import type { Units } from '../../types'

/** Options of the preparation block. */
export interface HyperthermPreparationOptions {
  readonly units: Units
  /** Text of the `(MATERIAL : ...)` comment, when known. */
  readonly materialComment?: string
  /** Texts of the controller settings the program relies on, one comment line each. */
  readonly preconditions: readonly string[]
  /** The program uses True Hole cut charts: the vendor comment is written first. */
  readonly trueHole?: boolean
  /** Write `G92 X0 Y0` after the absolute mode (program zero at the torch position of the init point). */
  readonly axisPreset?: boolean
}

/**
 * Preparation lines of a Hypertherm program.
 *
 * Order: True Hole comment, units, absolute mode, optional axis preset, material comment, controller preconditions.
 *
 * @param options - Units, comments and the axis preset.
 * @returns The lines.
 */
export function hyperthermPreparation(options: HyperthermPreparationOptions): string[] {
  const lines: string[] = []
  if (options.trueHole) lines.push('(EMBEDDED HYPERTHERM PATENT-PENDING TRUE HOLE TECHNOLOGY)')
  lines.push(options.units === 'inch' ? 'G20' : 'G21', 'G90')
  if (options.axisPreset) lines.push('G92 X0 Y0')
  if (options.materialComment) lines.push(`(MATERIAL : ${options.materialComment})`)
  for (const text of options.preconditions) lines.push(`(PRECONDITION: ${text})`)
  return lines
}
