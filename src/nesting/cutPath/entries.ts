import type { Point2D } from '../types'
import { EPSILON } from '../config'
import { degToRad, distance } from '../polygonUtils'
import { transformedContour } from './geometry'
import type { CutContour, CutProcessProfile, LeadSpec } from './types'

export interface PierceCandidate {
  point: Point2D
  lead: LeadSpec
}

export interface LeadCandidate {
  start: Point2D
  end: Point2D
  lead: LeadSpec
}

export interface TabCandidate {
  point: Point2D
  width: number
}

export interface OvercutCandidate {
  start: Point2D
  end: Point2D
}

/** Select the stable first vertex as the pierce point and lead anchor. */
export function pierceCandidate(
  contour: CutContour,
  profile: CutProcessProfile,
): PierceCandidate {
  const vertices = transformedContour(contour)
  const point = vertices[0] ?? { x: 0, y: 0 }
  const isSmall = Math.max(
    contour.shape.bbox.width,
    contour.shape.bbox.height,
  ) <= (profile.pierce.smallHoleThreshold ?? -1)
  return {
    point,
    lead: isSmall && profile.pierce.smallHoleLead
      ? profile.pierce.smallHoleLead
      : profile.lead,
  }
}

/** Build a straight or arc-independent lead segment. */
export function leadCandidate(
  contour: CutContour,
  lead: LeadSpec,
): LeadCandidate {
  const point = pierceCandidate(contour, {
    lead,
    pierce: { clearance: 0 },
    sequence: { strategy: 'input' },
    tabs: { enabled: false },
    overcut: { enabled: false },
    clearance: { contour: 0, tab: 0, keptMaterial: 0 },
    commonLine: { enabled: false, tolerance: 0 },
  }).point
  const direction = degToRad(lead.angle)
  const sign = lead.placement === 'inside' ? 1 : -1
  const start = {
    x: point.x + sign * Math.cos(direction) * lead.length,
    y: point.y + sign * Math.sin(direction) * lead.length,
  }
  return { start, end: point, lead }
}

/** Generate evenly distributed tab candidates on the contour perimeter. */
export function tabCandidates(
  contour: CutContour,
  width: number,
  count: number,
): TabCandidate[] {
  const vertices = transformedContour(contour)
  if (vertices.length < 2 || count <= 0) return []
  const perimeter = vertices.slice(1).reduce(
    (total, point, index) => total + distance(vertices[index], point),
    0,
  )
  return Array.from({ length: count }, (_, index) => {
    const target = (perimeter * (index + 1)) / (count + 1)
    let travelled = 0
    for (let segment = 1; segment < vertices.length; segment += 1) {
      const start = vertices[segment - 1]
      const end = vertices[segment]
      const length = distance(start, end)
      if (travelled + length + EPSILON >= target) {
        const ratio = length <= EPSILON ? 0 : (target - travelled) / length
        return {
          point: {
            x: start.x + (end.x - start.x) * ratio,
            y: start.y + (end.y - start.y) * ratio,
          },
          width,
        }
      }
      travelled += length
    }
    return { point: vertices[0], width }
  })
}

/** Extend the final contour segment for a deterministic overcut. */
export function overcutCandidate(
  contour: CutContour,
  length: number,
): OvercutCandidate {
  const vertices = transformedContour(contour)
  const end = vertices[0] ?? { x: 0, y: 0 }
  const previous = vertices[vertices.length - 2] ?? end
  const dx = end.x - previous.x
  const dy = end.y - previous.y
  const magnitude = Math.hypot(dx, dy)
  return {
    start: end,
    end: magnitude <= EPSILON
      ? end
      : { x: end.x + (dx / magnitude) * length, y: end.y + (dy / magnitude) * length },
  }
}
