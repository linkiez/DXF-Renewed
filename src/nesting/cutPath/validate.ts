import type { Point2D } from '../types'
import { EPSILON } from '../config'
import {
  contourBounds,
  isContourWithinSheet,
  rapidCrossesContour,
  transformedContour,
} from './geometry'
import type {
  ClearanceRules,
  CutContour,
  CutLayout,
  CutPathProblem,
  CutProcessProfile,
} from './types'

const finite = (value: number): boolean => Number.isFinite(value)

function requireFinite(name: string, value: number, minimum = 0): void {
  if (!finite(value) || value < minimum) {
    throw new Error(`${name} must be a finite number greater than or equal to ${minimum}`)
  }
}

/** Validate structural layout references before geometry planning begins. */
export function validateCutLayout(layout: CutLayout): void {
  if (!layout || !Array.isArray(layout.sheets) || !Array.isArray(layout.contours)) {
    throw new Error('CutLayout must provide sheets and contours arrays')
  }
  const sheetIds = new Set<string>()
  for (const sheet of layout.sheets) {
    if (!sheet || typeof sheet.id !== 'string' || sheet.id.length === 0) {
      throw new Error('Every cut layout sheet must have a non-empty id')
    }
    if (sheetIds.has(sheet.id)) throw new Error(`Duplicate sheet id: ${sheet.id}`)
    sheetIds.add(sheet.id)
    requireFinite(`sheet ${sheet.id} width`, sheet.width, EPSILON)
    requireFinite(`sheet ${sheet.id} height`, sheet.height, EPSILON)
  }
  const contourIds = new Set<string>()
  for (const contour of layout.contours) {
    validateContour(contour, sheetIds, contourIds)
  }
  for (const contour of layout.contours) {
    if (contour.parentContourId && !contourIds.has(contour.parentContourId)) {
      throw new Error(
        `Contour ${contour.id} references missing parent contour ${contour.parentContourId}`,
      )
    }
    if (contour.parentContourId === contour.id) {
      throw new Error(`Contour ${contour.id} cannot reference itself as parent`)
    }
  }
  if (layout.startPoint) {
    requirePoint('layout startPoint', layout.startPoint)
  }
}

function validateContour(
  contour: CutContour,
  sheetIds: Set<string>,
  contourIds: Set<string>,
): void {
  if (!contour || typeof contour.id !== 'string' || contour.id.length === 0) {
    throw new Error('Every cut contour must have a non-empty id')
  }
  if (contourIds.has(contour.id)) throw new Error(`Duplicate contour id: ${contour.id}`)
  contourIds.add(contour.id)
  if (!contour.placement) {
    throw new Error(`Contour ${contour.id} must provide a placement`)
  }
  if (typeof contour.partId !== 'string' || contour.partId.length === 0) {
    throw new Error(`Contour ${contour.id} must have a non-empty partId`)
  }
  if (!sheetIds.has(contour.sheetId)) {
    throw new Error(`Contour ${contour.id} references missing sheet ${contour.sheetId}`)
  }
  if (!contour.shape || contour.shape.id !== contour.placement.shapeId) {
    throw new Error(`Contour ${contour.id} shape and placement references do not match`)
  }
  if (!Array.isArray(contour.shape.vertices) || contour.shape.vertices.length < 3) {
    throw new Error(`Contour ${contour.id} must contain at least three vertices`)
  }
  for (const vertex of contour.shape.vertices) requirePoint(`contour ${contour.id} vertex`, vertex)
  if (contour.placement.transformedVertices) {
    if (contour.placement.transformedVertices.length < 3) {
      throw new Error(`Contour ${contour.id} transformedVertices must contain at least three vertices`)
    }
    for (const vertex of contour.placement.transformedVertices) {
      requirePoint(`contour ${contour.id} transformed vertex`, vertex)
    }
  }
  requireFinite(`contour ${contour.id} placement x`, contour.placement.x, -Infinity)
  requireFinite(`contour ${contour.id} placement y`, contour.placement.y, -Infinity)
  requireFinite(`contour ${contour.id} rotation`, contour.placement.rotation)
}

function requirePoint(name: string, point: Point2D): void {
  if (!point || !finite(point.x) || !finite(point.y)) {
    throw new Error(`${name} must contain finite x and y coordinates`)
  }
}

/** Validate process values and enum-like options before planning. */
export function validateCutProcessProfile(profile: CutProcessProfile): void {
  if (!profile) throw new Error('CutProcessProfile is required')
  if (!profile.sequence || !profile.lead || !profile.pierce || !profile.tabs ||
      !profile.overcut || !profile.clearance || !profile.commonLine) {
    throw new Error('CutProcessProfile must provide all process sections')
  }
  if (!['input', 'nearest-neighbour', 'stable-2-opt'].includes(profile.sequence.strategy)) {
    throw new Error(`Unsupported cut sequence strategy: ${profile.sequence.strategy}`)
  }
  if (profile.sequence.budget !== undefined) requireFinite('sequence budget', profile.sequence.budget)
  validateLead('lead', profile.lead)
  requireFinite('pierce clearance', profile.pierce.clearance)
  if (profile.pierce.smallHoleThreshold !== undefined) {
    requireFinite('small-hole threshold', profile.pierce.smallHoleThreshold)
  }
  requireFinite('tab width', profile.tabs.width ?? 0)
  requireFinite('tab count', profile.tabs.count ?? 0)
  requireFinite('tab minimum spacing', profile.tabs.minimumSpacing ?? 0)
  requireFinite('overcut length', profile.overcut.length ?? 0)
  validateClearance(profile.clearance)
  requireFinite('common-line tolerance', profile.commonLine.tolerance ?? 0)
}

function validateLead(name: string, lead: CutProcessProfile['lead']): void {
  if (!['none', 'straight', 'arc'].includes(lead.type)) {
    throw new Error(`Unsupported ${name} type: ${lead.type}`)
  }
  if (!['inside', 'outside', 'automatic'].includes(lead.placement)) {
    throw new Error(`Unsupported ${name} placement: ${lead.placement}`)
  }
  requireFinite(`${name} length`, lead.length)
  requireFinite(`${name} angle`, lead.angle)
}

function validateClearance(clearance: ClearanceRules): void {
  requireFinite('contour clearance', clearance.contour)
  requireFinite('tab clearance', clearance.tab)
  requireFinite('kept-material clearance', clearance.keptMaterial)
  if (clearance.sheetEdge !== undefined) requireFinite('sheet-edge clearance', clearance.sheetEdge)
}

/** Validate expected geometric failures without throwing structural exceptions. */
export function validateCutGeometry(
  layout: CutLayout,
  contours: readonly CutContour[],
  profile: CutProcessProfile,
): CutPathProblem[] {
  const problems: CutPathProblem[] = []
  const sheets = new Map(layout.sheets.map((sheet) => [sheet.id, sheet]))
  for (const contour of contours) {
    const sheet = sheets.get(contour.sheetId)
    if (!sheet) continue
    const edge = profile.clearance.sheetEdge ?? 0
    if (!isContourWithinSheet(contour, sheet, edge)) {
      problems.push({
        code: 'OUT_OF_BOUNDS',
        severity: 'error',
        message: `Move contour ${contour.id} inside sheet ${sheet.id} bounds and edge clearance.`,
        sheetId: sheet.id,
        partId: contour.partId,
        contourId: contour.id,
      })
    }
    if (
      contour.placement.x < -EPSILON ||
      contour.placement.y < -EPSILON ||
      contour.placement.x > sheet.width + EPSILON ||
      contour.placement.y > sheet.height + EPSILON
    ) {
      problems.push({
        code: 'OUT_OF_BOUNDS',
        severity: 'error',
        message: `Move contour ${contour.id} inside sheet ${sheet.id} bounds.`,
        sheetId: sheet.id,
        partId: contour.partId,
        contourId: contour.id,
      })
    }
    if (contourBounds(contour).width <= EPSILON || contourBounds(contour).height <= EPSILON) {
      problems.push({
        code: 'ENTRY_INVALID',
        severity: 'error',
        message: `Contour ${contour.id} has no usable entry geometry.`,
        sheetId: sheet.id,
        partId: contour.partId,
        contourId: contour.id,
      })
    }
  }
  if (profile.commonLine.enabled && profile.commonLine.candidates) {
    const contoursById = new Map(contours.map((contour) => [contour.id, contour]))
    for (const candidate of profile.commonLine.candidates) {
      const first = contoursById.get(candidate.firstContourId)
      const second = contoursById.get(candidate.secondContourId)
      if (
        first &&
        second &&
        sharedEdge(first, second, profile.commonLine.tolerance)
      ) continue
      if (!first && !second) continue
      if (!first || !second || !sharedEdge(first, second, profile.commonLine.tolerance)) {
        problems.push({
          code: 'COMMON_LINE_REJECTED',
          severity: 'error',
          message: `Common-line candidate ${candidate.firstContourId}/${candidate.secondContourId} has no verified shared geometry.`,
          sheetId: first?.sheetId ?? second?.sheetId,
          partId: first?.partId ?? second?.partId,
          contourId: first?.id ?? second?.id,
        })
      }
    }
  }
  return problems
}

/** Return the verified shared segment for a common-line candidate. */
export function sharedEdge(
  first: CutContour,
  second: CutContour,
  tolerance: number,
): readonly [Point2D, Point2D] | undefined {
  if (first.sheetId !== second.sheetId) return undefined
  const firstVertices = transformedContour(first)
  const secondVertices = transformedContour(second)
  for (let firstIndex = 1; firstIndex < firstVertices.length; firstIndex += 1) {
    const firstStart = firstVertices[firstIndex - 1]
    const firstEnd = firstVertices[firstIndex]
    for (let secondIndex = 1; secondIndex < secondVertices.length; secondIndex += 1) {
      const secondStart = secondVertices[secondIndex - 1]
      const secondEnd = secondVertices[secondIndex]
      const segment = sharedSegment(
        firstStart,
        firstEnd,
        secondStart,
        secondEnd,
        tolerance,
      )
      if (segment) return segment
    }
  }
  return undefined
}

function sharedSegment(
  firstStart: Point2D,
  firstEnd: Point2D,
  secondStart: Point2D,
  secondEnd: Point2D,
  tolerance: number,
): readonly [Point2D, Point2D] | undefined {
  const firstLength = Math.hypot(firstEnd.x - firstStart.x, firstEnd.y - firstStart.y)
  const secondLength = Math.hypot(secondEnd.x - secondStart.x, secondEnd.y - secondStart.y)
  if (firstLength <= EPSILON || secondLength <= EPSILON) return undefined

  const firstDirection = {
    x: (firstEnd.x - firstStart.x) / firstLength,
    y: (firstEnd.y - firstStart.y) / firstLength,
  }
  const secondDirection = {
    x: (secondEnd.x - secondStart.x) / secondLength,
    y: (secondEnd.y - secondStart.y) / secondLength,
  }
  const parallel = Math.abs(
    firstDirection.x * secondDirection.y -
    firstDirection.y * secondDirection.x,
  ) <= tolerance + EPSILON
  if (!parallel) return undefined

  const lineDistance = Math.min(
    pointToLineDistance(secondStart, firstStart, firstDirection),
    pointToLineDistance(secondEnd, firstStart, firstDirection),
  )
  if (lineDistance > tolerance + EPSILON) return undefined

  const firstProjection = (point: Point2D): number =>
    (point.x - firstStart.x) * firstDirection.x +
    (point.y - firstStart.y) * firstDirection.y
  const secondRange = [firstProjection(secondStart), firstProjection(secondEnd)].sort((a, b) => a - b)
  const overlapStart = Math.max(0, secondRange[0])
  const overlapEnd = Math.min(firstLength, secondRange[1])
  if (overlapEnd - overlapStart <= EPSILON) return undefined
  return [
    {
      x: firstStart.x + firstDirection.x * overlapStart,
      y: firstStart.y + firstDirection.y * overlapStart,
    },
    {
      x: firstStart.x + firstDirection.x * overlapEnd,
      y: firstStart.y + firstDirection.y * overlapEnd,
    },
  ]
}

/** Return a structured problem when a pierce point is too close to kept geometry. */
export function validatePiercePoint(
  point: Point2D,
  contour: CutContour,
  layout: CutLayout,
  clearance: number,
): CutPathProblem | undefined {
  if (clearance <= EPSILON) return undefined
  const nearby = layout.contours
    .filter((item) =>
      item.id !== contour.id &&
      item.id !== contour.parentContourId &&
      item.sheetId === contour.sheetId,
    )
    .find((item) => {
      const vertices = transformedContour(item)
      return vertices.some((vertex, index) =>
        pointToSegmentDistance(
          point,
          vertex,
          vertices[(index + 1) % vertices.length],
        ) <= clearance + EPSILON,
      )
    })
  if (!nearby) return undefined
  return {
    code: 'ENTRY_INVALID',
    severity: 'error',
    message: `Pierce point for contour ${contour.id} violates the configured clearance from contour ${nearby.id}.`,
    sheetId: contour.sheetId,
    partId: contour.partId,
    contourId: contour.id,
  }
}

function pointToSegmentDistance(
  point: Point2D,
  start: Point2D,
  end: Point2D,
): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared <= EPSILON * EPSILON) {
    return Math.hypot(point.x - start.x, point.y - start.y)
  }
  const ratio = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
    ),
  )
  return Math.hypot(
    point.x - (start.x + ratio * dx),
    point.y - (start.y + ratio * dy),
  )
}

function pointToLineDistance(
  point: Point2D,
  lineStart: Point2D,
  direction: Point2D,
): number {
  return Math.abs(
    (point.x - lineStart.x) * direction.y -
    (point.y - lineStart.y) * direction.x,
  )
}

/** Validate rapid actions against kept contour material. */
export function validateRapidRoute(
  start: Point2D,
  end: Point2D,
  keptContours: readonly CutContour[],
  clearance: number,
): CutPathProblem | undefined {
  const crossed = keptContours.find((contour) =>
    rapidCrossesContour(start, end, contour, clearance),
  )
  if (!crossed) return undefined
  return {
    code: 'RAPID_OVER_PART',
    severity: 'error',
    message: `Route from (${start.x}, ${start.y}) to (${end.x}, ${end.y}) crosses kept material; reroute the rapid move.`,
    sheetId: crossed.sheetId,
    partId: crossed.partId,
    contourId: crossed.id,
  }
}
