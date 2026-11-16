import { satCollision } from '../collision'
import { EPSILON } from '../config'
import { computeBoundingBox, pointInPolygon } from '../polygonUtils'
import { isInsideOuterBoundary, polygonDistance } from '../trueShape/bounds'
import type { Point2D } from '../types'
import type { EditState, Violation, WorkingPart } from './types'
import { violation } from './violation'

/** Violations of one candidate part, grouped in the fixed report order. */
export interface GeometryViolations {
  overlap: Violation[]
  area: Violation[]
  zone: Violation[]
  spacing: Violation[]
  /** True when a neighbour that was compared has only a bounding box as outline. */
  approximateNeighbour: boolean
}

type Ring = Point2D[]

const hostingHole = (ring: Ring, other: WorkingPart): Ring | undefined =>
  other.outlines.slice(1).find((hole) => ring.every((vertex) => pointInPolygon(vertex, hole)))

const zoneViolations = (state: EditState, part: WorkingPart, ring: Ring, edge: number): Violation[] => {
  const sheet = state.working.sheets.get(part.sheetId)
  const holes = (sheet?.holes ?? []).filter((hole) => polygonDistance(ring, hole.vertices) < edge - EPSILON)
  const zones = (state.input.constraints?.exclusions ?? []).filter((zone) => zone.sheetId === part.sheetId && satCollision(ring, zone.outline, 0))
  return [
    ...holes.map((hole) => violation('FORBIDDEN_ZONE', { partKey: part.key, zoneId: hole.id })),
    ...zones.map((zone) => violation('FORBIDDEN_ZONE', { partKey: part.key, zoneId: zone.id })),
  ]
}

const againstNeighbour = (part: WorkingPart, ring: Ring, other: WorkingPart, spacing: number): { overlap?: Violation; spacing?: Violation } => {
  const context = { partKey: part.key, otherPartKey: other.key, limit: spacing }
  const hole = hostingHole(ring, other)
  if (!hole && satCollision(ring, other.outlines[0], 0)) return { overlap: violation('OVERLAP', context) }
  const distance = polygonDistance(ring, hole ?? other.outlines[0])
  return distance < spacing - EPSILON ? { spacing: violation('SPACING_TOO_SMALL', { ...context, value: distance }) } : {}
}

/**
 * Judges the geometry of one candidate part against the usable area, the forbidden zones and its
 * neighbours: overlap, bounds, stock holes, caller zones and the minimum spacing.
 *
 * A part that lies wholly inside a hole of a neighbour is compared with that hole, which is what
 * lets a hole host a smaller part.
 *
 * @param state - Session state, carrying the layout, the clearances and the constraints.
 * @param part - Candidate part already transformed.
 * @param exclude - Keys that are not neighbours: the part itself and its enclosed group.
 * @returns The violations by kind and whether an approximate neighbour was compared.
 */
export function geometryViolations(state: EditState, part: WorkingPart, exclude: ReadonlySet<string>): GeometryViolations {
  const layout = state.input.artifact.layout as NonNullable<EditState['input']['artifact']['layout']>
  const ring = part.outlines[0]
  const sheet = state.working.sheets.get(part.sheetId)
  const result: GeometryViolations = { overlap: [], area: [], zone: [], spacing: [], approximateNeighbour: false }
  if (sheet && !isInsideOuterBoundary(ring, sheet.width, sheet.height, layout.edgeClearance)) {
    result.area.push(violation('OUTSIDE_USABLE_AREA', { partKey: part.key }))
  }
  result.zone.push(...zoneViolations(state, part, ring, layout.edgeClearance))
  const keys = state.working.index.get(part.sheetId)?.query(computeBoundingBox(ring), layout.partToPartClearance) ?? []
  for (const key of keys.filter((candidate) => !exclude.has(candidate))) {
    const other = state.working.parts.get(key)
    if (!other) continue
    result.approximateNeighbour ||= other.approximate
    const found = againstNeighbour(part, ring, other, layout.partToPartClearance)
    if (found.overlap) result.overlap.push(found.overlap)
    if (found.spacing) result.spacing.push(found.spacing)
  }
  return result
}
