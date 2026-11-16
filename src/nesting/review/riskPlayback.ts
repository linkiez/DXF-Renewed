import { buildRiskContext } from '../risk/riskContext'
import type { RiskContext } from '../risk/riskContext'
import { freedMoments } from '../risk/freedMoments'
import { heatViewOf } from '../risk/heatViewOf'
import { planTimeAt } from '../risk/planTimeAt'
import type { FreedMoment, RiskFinding, RiskRequest, RiskResult } from '../risk/types'
import { messages } from './messages'
import type { OverlayMarker, ReviewOverlay, ReviewPosition } from './types'

/** Builds the overlay of the risk views for a playback position. */
export interface RiskPlayback {
  overlayAt(position: ReviewPosition, showHeat: boolean): ReviewOverlay
}

const markerOf = (context: RiskContext, finding: RiskFinding): OverlayMarker => {
  const part = context.partsBySheet.get(finding.sheetId)?.find((candidate) => candidate.key === finding.partKey)
  const box = part?.bbox
  const x = finding.region?.x ?? (box ? (box.minX + box.maxX) / 2 : 0)
  const y = finding.region?.y ?? (box ? (box.minY + box.maxY) / 2 : 0)
  return {
    id: finding.id,
    category: finding.category,
    severity: finding.severity,
    x,
    y,
    label: `${messages.risk.severityLabel(finding.severity)}: ${messages.risk.categoryLabel(finding.category)}`,
  }
}

const freedAt = (context: RiskContext, moments: readonly FreedMoment[], position: ReviewPosition): NonNullable<ReviewOverlay['freed']> =>
  moments
    .filter((moment) => moment.sheetId === position.sheetId && !moment.held && moment.actionIndex < position.actionIndex)
    .map((moment) => ({
      key: moment.partKey,
      outline: context.partsBySheet.get(moment.sheetId)?.find((part) => part.key === moment.partKey)?.outline ?? [],
    }))

/**
 * Prepares the playback views of a risk result: the parts that are free at each moment, the
 * accumulated heat and one marker per finding. The context is built once, so seeking back and forth
 * is cheap and gives identical overlays.
 *
 * @param request - The inputs the result was assessed from.
 * @param result - The result whose findings become markers.
 * @returns The playback, or `null` when the inputs cannot be prepared.
 */
export function createRiskPlayback(request: RiskRequest, result: RiskResult): RiskPlayback | null {
  let context: RiskContext
  try {
    context = buildRiskContext(request)
  } catch {
    return null
  }
  const moments = freedMoments(context)
  const markers = result.findings.map((finding) => markerOf(context, finding))
  return {
    overlayAt(position, showHeat) {
      const overlay: ReviewOverlay = {
        freed: freedAt(context, moments, position),
        markers: markers.filter((marker) => result.findings.find((finding) => finding.id === marker.id)?.sheetId === position.sheetId),
      }
      if (!showHeat) return overlay
      const seconds = planTimeAt(context, position.sheetId, position.actionIndex, position.progress)
      return { ...overlay, heat: seconds === null ? { available: false, missing: ['speeds'], cells: [], max: 0 } : heatViewOf(context, position.sheetId, seconds) }
    },
  }
}
