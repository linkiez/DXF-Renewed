import { computeBoundingBox, isCounterClockwise, rotatePoint } from '../polygonUtils'
import type { CompoundPlacement, Placement, Point2D } from '../types'
import { pivotOf } from './pivotOf'
import type { CandidateEdit, WorkingPart } from './types'

type Ring = Point2D[]

const FULL_TURN = 360

const pointMapper = (edit: CandidateEdit, pivot: Point2D): ((point: Point2D) => Point2D) => {
  if (edit.kind === 'move') return (point) => ({ x: point.x + edit.delta.dx, y: point.y + edit.delta.dy })
  if (edit.kind === 'rotate') return (point) => rotatePoint(point, pivot, edit.delta.degrees)
  return (point) => ({ x: 2 * pivot.x - point.x, y: point.y })
}

const mapRing = (ring: Ring, map: (point: Point2D) => Point2D, keepWinding: boolean): Ring => {
  const mapped = ring.map(map)
  if (!keepWinding || mapped.length < 3) return mapped
  return isCounterClockwise(mapped) === isCounterClockwise(ring) ? mapped : mapped.reverse()
}

const turned = (rotation: number, edit: CandidateEdit): number =>
  edit.kind === 'rotate' ? (((rotation + edit.delta.degrees) % FULL_TURN) + FULL_TURN) % FULL_TURN : rotation

const retarget = (placement: Placement, ring: Ring, edit: CandidateEdit, writeVertices: boolean): Placement => {
  const bbox = computeBoundingBox(ring)
  const next: Placement = { ...placement, x: bbox.minX, y: bbox.minY, rotation: turned(placement.rotation, edit), bbox }
  if (writeVertices) next.transformedVertices = ring
  return next
}

const isCompound = (placement: Placement | CompoundPlacement): placement is CompoundPlacement => 'outerPlacement' in placement

const placementsOf = (part: WorkingPart, rings: Ring[], edit: CandidateEdit): Placement | CompoundPlacement => {
  const write = !part.approximate
  const { placement } = part
  if (!isCompound(placement)) return retarget(placement, rings[0], edit, write)
  const bbox = computeBoundingBox(rings[0])
  return {
    ...placement,
    x: bbox.minX,
    y: bbox.minY,
    rotation: turned(placement.rotation, edit),
    bbox,
    outerPlacement: retarget(placement.outerPlacement, rings[0], edit, write),
    holePlacements: placement.holePlacements.map((hole, index) => retarget(hole, rings[index + 1], edit, write)),
  }
}

/**
 * Applies a move, rotation or mirror to one placed part and its outlines.
 *
 * `(x, y)` stays the bounding-box minimum of the outline, the convention of the true-shape search.
 * A rotation turns the outline about the center of its bounding box and adds to `rotation` modulo
 * 360; a mirror reflects about the vertical axis through that center and keeps the winding. A
 * compound placement is transformed as one unit.
 *
 * @param part - Working part to transform; never mutated.
 * @param edit - Move, rotation or mirror to apply.
 * @param pivot - Center of a rotation or mirror; defaults to the center of the part's outer box.
 * @returns A new working part.
 * @example
 * ```typescript
 * const moved = transformPart(part, { partKey: part.key, kind: 'move', delta: { dx: 5, dy: 0 } })
 * ```
 */
export function transformPart(part: WorkingPart, edit: CandidateEdit, pivot?: Point2D): WorkingPart {
  const center = pivot ?? pivotOf(part)
  const map = pointMapper(edit, center)
  const rings = part.outlines.map((ring) => mapRing(ring, map, edit.kind === 'mirror'))
  return {
    ...part,
    placement: placementsOf(part, rings, edit),
    outlines: rings,
    mirrored: edit.kind === 'mirror' ? !part.mirrored : part.mirrored,
  }
}
