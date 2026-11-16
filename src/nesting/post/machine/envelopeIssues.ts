import { EPSILON } from '../../config'
import type { CutPlan } from '../../cutPath'
import type { ValidationIssue } from '../types'
import { mapToMachineFrame } from './mapToMachineFrame'
import { message } from './messages'
import type { MachineConfiguration } from './types'

type Axis = 'X' | 'Y'

function outside(value: number, min: number, max: number): number | undefined {
  if (value < min - EPSILON) return min
  if (value > max + EPSILON) return max
  return undefined
}

function pointIssues(
  point: { x: number; y: number },
  envelope: MachineConfiguration['envelope']['value'],
  seen: Set<Axis>,
): Array<{ axis: Axis; value: number; bound: number }> {
  const found: Array<{ axis: Axis; value: number; bound: number }> = []
  const x = outside(point.x, envelope.minX, envelope.maxX)
  const y = outside(point.y, envelope.minY, envelope.maxY)
  if (x !== undefined && !seen.has('X')) found.push({ axis: 'X', value: point.x, bound: x })
  if (y !== undefined && !seen.has('Y')) found.push({ axis: 'Y', value: point.y, bound: y })
  for (const item of found) seen.add(item.axis)
  return found
}

/**
 * Compare every point of a plan, in the machine frame, with the confirmed work envelope.
 *
 * Each action reports its first offending point per axis. The sheet itself is also checked once per axis.
 * The controller soft limits are never read: only the configured envelope counts.
 *
 * @param plan - Cut plan in nesting coordinates.
 * @param configuration - Machine configuration with the frame and the envelope.
 * @param sheet - Sheet size in nesting coordinates.
 * @returns `OUT_OF_ENVELOPE` and `SHEET_DOES_NOT_FIT` issues.
 */
export function envelopeIssues(
  plan: CutPlan,
  configuration: MachineConfiguration,
  sheet: { readonly width: number; readonly height: number },
): readonly ValidationIssue[] {
  const frame = configuration.frame.value
  const envelope = configuration.envelope.value
  const issues: ValidationIssue[] = []
  plan.actions.forEach((action, actionIndex) => {
    const seen = new Set<Axis>()
    for (const point of action.points) {
      for (const item of pointIssues(mapToMachineFrame(point, sheet, frame), envelope, seen)) {
        const contour = action.contourId ?? `#${actionIndex}`
        issues.push({
          severity: 'error',
          code: 'OUT_OF_ENVELOPE',
          message: message('OUT_OF_ENVELOPE', { contour, axis: item.axis, value: item.value, bound: item.bound }),
          actionIndex,
          ...(action.contourId ? { contourId: action.contourId } : {}),
        })
      }
    }
  })
  const corners = [{ x: 0, y: 0 }, { x: sheet.width, y: 0 }, { x: 0, y: sheet.height }, { x: sheet.width, y: sheet.height }]
  const seenCorner = new Set<Axis>()
  for (const corner of corners) {
    for (const item of pointIssues(mapToMachineFrame(corner, sheet, frame), envelope, seenCorner)) {
      issues.push({ severity: 'error', code: 'SHEET_DOES_NOT_FIT', message: message('SHEET_DOES_NOT_FIT', { axis: item.axis }) })
    }
  }
  return issues
}
