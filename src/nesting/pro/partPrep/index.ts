import { extractContours } from './extract'
import { resolveUnit } from './units'
import { closeGap, hasSelfIntersection, normalizeOrientation } from './repair'
import { simplify } from './simplify'
import { applyCutWidth } from './offset'
import { bboxOf, classify, classificationFor, pointInRing, samplePoint } from './classify'
import type {
  BBox,
  Boundary,
  Classification,
  PrepareOptions,
  PrepareResult,
  PreparedPart,
  PreparationIssue,
  Repair,
  SourceRef,
  Warning,
} from '../types'

export type {
  BBox,
  Boundary,
  Classification,
  IssueCode,
  PrepareOptions,
  PrepareResult,
  PreparedPart,
  PreparationIssue,
  Repair,
  SourceRef,
  Unit,
  Warning,
} from '../types'

const EPS = 1e-9

const REQUEST_SOURCE: SourceRef = { handle: 'request', layer: '', entityType: '' }

/** Primitives that are open by definition and cannot be gap-repaired (FR-006). */
const OPEN_PRIMITIVES = new Set(['LINE', 'ARC', 'SPLINE', 'RAY', 'XLINE', 'ELLIPSE'])

function ringArea(vertices: [number, number][]): number {
  let sum = 0
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length
    sum += vertices[i][0] * vertices[j][1] - vertices[j][0] * vertices[i][1]
  }
  return Math.abs(sum) / 2
}

function ringPerimeter(vertices: [number, number][]): number {
  let perimeter = 0
  for (let i = 0; i < vertices.length - 1; i++) {
    perimeter += Math.hypot(
      vertices[i + 1][0] - vertices[i][0],
      vertices[i + 1][1] - vertices[i][1],
    )
  }
  return perimeter
}

function combinedBBox(rings: [number, number][][]): BBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const ring of rings) {
    const box = bboxOf(ring)
    if (box.minX < minX) minX = box.minX
    if (box.minY < minY) minY = box.minY
    if (box.maxX > maxX) maxX = box.maxX
    if (box.maxY > maxY) maxY = box.maxY
  }
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { minX, minY, maxX, maxY }
}

interface Candidate {
  ring: [number, number][]
  source: SourceRef
  repairs: Repair[]
  warnings: Warning[]
}

/**
 * Prepare parsed DXF geometry into classified, cuttable parts (contract:
 * specs/001-part-preparation/contracts/preparation-api.ts).
 *
 * Async so every nesting pipeline shares one shape (feature 003); the work itself stays pure CPU
 * with no I/O and no timing budget.
 */
export async function prepareParts(
  dxf: string | { entities: unknown[] },
  options: PrepareOptions,
): Promise<PrepareResult> {
  const issues: PreparationIssue[] = []

  const unit = resolveUnit(options.unit)
  if (!unit.ok) {
    issues.push({
      code: 'UNSUPPORTED_UNIT',
      severity: 'rejection',
      source: REQUEST_SOURCE,
      detail: unit.reason,
    })
    return { parts: [], issues, unit: 'mm' }
  }

  const { tolerance, cutWidthAllowance } = options
  const candidates: Candidate[] = []

  for (const contour of extractContours(dxf, issues)) {
    const repairs: Repair[] = []
    const warnings: Warning[] = []
    let ring = contour.vertices

    if (!contour.closed) {
      if (OPEN_PRIMITIVES.has(contour.source.entityType)) {
        issues.push({
          code: 'OPEN_BOUNDARY',
          severity: 'rejection',
          source: contour.source,
          detail: `${contour.source.entityType} is an open primitive`,
        })
        continue
      }
      const result = closeGap(ring, tolerance, contour.source)
      if (result.gap > EPS && result.gap <= tolerance) {
        ring = result.vertices
        repairs.push(...result.repairs)
        warnings.push({
          code: 'GAP_CLOSED',
          source: contour.source,
          detail: `closed gap of ${result.gap}`,
        })
      } else {
        const tooLarge = result.gap > tolerance
        issues.push({
          code: tooLarge ? 'GAP_TOO_LARGE' : 'OPEN_BOUNDARY',
          severity: 'rejection',
          source: contour.source,
          detail: tooLarge ? `gap ${result.gap} exceeds tolerance` : 'contour is not closed',
        })
        continue
      }
    }

    const orientation = normalizeOrientation(ring, contour.source)
    ring = orientation.vertices
    if (orientation.repairs.length > 0) {
      repairs.push(...orientation.repairs)
      warnings.push({
        code: 'ORIENTATION_REPAIRED',
        source: contour.source,
        detail: 'winding normalized to CCW',
      })
    }

    ring = simplify(ring, tolerance)

    if (hasSelfIntersection(ring)) {
      issues.push({
        code: 'SELF_INTERSECTION',
        severity: 'rejection',
        source: contour.source,
        detail: 'contour self-intersects',
      })
      continue
    }
    if (ring.length < 4 || ringArea(ring) <= EPS) {
      issues.push({
        code: 'ZERO_AREA',
        severity: 'rejection',
        source: contour.source,
        detail: 'zero usable area',
      })
      continue
    }

    candidates.push({ ring, source: contour.source, repairs, warnings })
  }

  const depths = classify(candidates.map((candidate) => candidate.ring))
  const samples = candidates.map((candidate) => samplePoint(candidate.ring))
  const boxes = candidates.map((candidate) => bboxOf(candidate.ring))

  candidates.forEach((candidate, index) => {
    if (options.minFeatureSize != null) {
      const box = boxes[index]
      const size = Math.min(box.maxX - box.minX, box.maxY - box.minY)
      if (size < options.minFeatureSize) {
        candidate.warnings.push({
          code: 'MIN_FEATURE',
          source: candidate.source,
          detail: `feature size ${size} below ${options.minFeatureSize}`,
        })
      }
    }
    if (options.minArea != null && ringArea(candidate.ring) < options.minArea) {
      candidate.warnings.push({
        code: 'MIN_AREA',
        source: candidate.source,
        detail: `area ${ringArea(candidate.ring)} below ${options.minArea}`,
      })
    }
  })

  const toBoundary = (
    candidate: Candidate,
    depth: number,
    classification: Classification,
  ): Boundary => {
    const vertices = applyCutWidth(candidate.ring, cutWidthAllowance, classification)
    return {
      classification,
      depth,
      source: candidate.source,
      vertices,
      area: ringArea(vertices),
      perimeter: ringPerimeter(vertices),
      bbox: bboxOf(vertices),
    }
  }

  const parts: PreparedPart[] = []
  const partIndexByCandidate = new Map<number, number>()

  candidates.forEach((candidate, index) => {
    if (depths[index] !== 0) return
    partIndexByCandidate.set(index, parts.length)
    const outer = toBoundary(candidate, 0, 'outer')
    parts.push({
      id: `${candidate.source.handle}#${index}`,
      outer,
      holes: [],
      islands: [],
      bbox: outer.bbox,
      area: outer.area,
      repairs: candidate.repairs.slice(),
      warnings: candidate.warnings.slice(),
    })
  })

  candidates.forEach((candidate, index) => {
    const depth = depths[index]
    if (depth === 0) return
    let owner = -1
    for (let j = 0; j < candidates.length; j++) {
      if (depths[j] !== 0) continue
      const sample = samples[index]
      const box = boxes[j]
      if (
        sample[0] < box.minX ||
        sample[0] > box.maxX ||
        sample[1] < box.minY ||
        sample[1] > box.maxY
      ) {
        continue
      }
      if (pointInRing(sample, candidates[j].ring)) {
        owner = j
        break
      }
    }
    if (owner < 0) return
    const part = parts[partIndexByCandidate.get(owner)!]
    const classification = classificationFor(depth)
    const boundary = toBoundary(candidate, depth, classification)
    if (classification === 'hole') part.holes.push(boundary)
    else part.islands.push(boundary)
    part.repairs.push(...candidate.repairs)
    part.warnings.push(...candidate.warnings)
  })

  for (const part of parts) {
    part.bbox = combinedBBox([
      part.outer.vertices,
      ...part.holes.map((hole) => hole.vertices),
      ...part.islands.map((island) => island.vertices),
    ])
    part.area =
      part.outer.area -
      part.holes.reduce((sum, hole) => sum + hole.area, 0) +
      part.islands.reduce((sum, island) => sum + island.area, 0)
  }

  parts.sort((a, b) => a.outer.source.handle.localeCompare(b.outer.source.handle))
  issues.sort((a, b) => {
    if (a.source.handle !== b.source.handle) {
      return a.source.handle < b.source.handle ? -1 : 1
    }
    return a.code < b.code ? -1 : a.code > b.code ? 1 : 0
  })

  return { parts, issues, unit: 'mm' }
}
