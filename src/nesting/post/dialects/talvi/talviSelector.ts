import type { ValidationIssue } from '../../types'
import { message } from '../../machine/messages'
import type { ProcessMapping } from '../../machine/types'
import type { Contour } from '../contourBlocks'

/** Selector line of a contour and the issues it raised. */
export interface TalviSelector {
  readonly line: string
  readonly issues: readonly ValidationIssue[]
}

function selectorValue(contour: Contour, key: string): string | undefined {
  const actions = [contour.pierce, ...contour.motions.map((m) => m.action)]
  const found = actions.find((a) => a.metadata?.[key] !== undefined)
  const value = found?.metadata?.[key]
  return value === undefined ? undefined : String(value)
}

/**
 * Build the `M101` process selector line of a contour from the approved mapping.
 *
 * Without a mapping entry the line is a draft comment and an error is returned; no selector is invented.
 *
 * @param contour - Contour whose actions carry the mapping key in their metadata.
 * @param mapping - Approved process mapping, when the configuration has one.
 * @returns The line and its issues.
 */
export function talviSelector(contour: Contour, mapping: ProcessMapping | undefined): TalviSelector {
  const value = mapping ? selectorValue(contour, mapping.key) : undefined
  const entry = mapping?.entries.find((e) => e.value === value)
  const usable = entry !== undefined && (entry.q !== undefined || mapping?.omitQ === 'when-undefined')
  if (entry && usable) {
    return { line: entry.q === undefined ? `M101 P${entry.p}` : `M101 P${entry.p} Q${entry.q}`, issues: [] }
  }
  const contourId = contour.contourId ?? 'sem identificador'
  return {
    line: `(PROCESS_MAPPING_MISSING ${value ?? ''})`.replace(' )', ')'),
    issues: [{
      severity: 'error',
      code: 'PROCESS_MAPPING_MISSING',
      message: message('PROCESS_MAPPING_MISSING', { contour: contourId, value }),
      ...(contour.contourId ? { contourId: contour.contourId } : {}),
    }],
  }
}
