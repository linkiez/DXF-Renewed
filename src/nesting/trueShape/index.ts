/**
 * True-Shape Nesting — Public Entry Point
 *
 * `nestTrueShape(request)` is async and free of wall-clock dependence: it awaits optional device
 * acquisition (feature 003) before running the deterministic search. It returns a partial result
 * with explicit reasons instead of throwing when parts cannot be placed (FR-006), maximizes
 * material use under a deterministic input-derived budget (FR-005, FR-007), and honours
 * FR-001/FR-002 clearances, FR-004 rotations and FR-008 remnant exclusion.
 *
 * @module nesting/trueShape
 */

import type {
  NestRequest,
  NestResponse,
  Placement,
  SortStrategy,
  StockItem,
  UnplacedPart,
} from '../types'
import {
  DEFAULT_ACCELERATION,
  DEFAULT_SEARCH_BUDGET_FACTOR,
  EPSILON,
} from '../config'
import { effectiveRotations, resolveAllowedRotations } from './rotations'
import { materialUse, searchBestArrangement } from './search'
import { normalizeObjective } from '../optimization/objective'
import { createBackendReport, selectBackendAsync } from '../optimization/backend'
import { Observable } from 'rxjs'
import { observeFlow, throwIfAborted } from '../async/observableFlow'

const DEFAULT_STRATEGIES: SortStrategy[] = [
  'area-desc',
  'perimeter-desc',
  'area-asc',
]

/** FR-008: drop remnants whose bounding-box area is below the caller threshold. */
function filterStock(stock: StockItem[], remnantThreshold?: number): StockItem[] {
  if (remnantThreshold === undefined) return stock
  return stock.filter((item) => {
    if (item.kind !== 'remnant') return true
    return item.width * item.height >= remnantThreshold
  })
}

/** Collect caller-input violations. Returned instead of thrown so callers get explicit reasons. */
function validateRequest(request: NestRequest): string[] {
  const errors: string[] = []

  if (!Number.isFinite(request.edgeClearance) || request.edgeClearance < 0) {
    errors.push(
      `edgeClearance must be a non-negative finite number, got ${request.edgeClearance}`,
    )
  }
  if (!Number.isFinite(request.partToPartClearance) || request.partToPartClearance < 0) {
    errors.push(
      `partToPartClearance must be a non-negative finite number, got ${request.partToPartClearance}`,
    )
  }

  const stock = request.stock ?? []
  if (stock.length === 0) errors.push('stock must contain at least one item')

  for (const part of request.parts ?? []) {
    if (!Number.isInteger(part.quantity) || part.quantity <= 0) {
      errors.push(
        `part "${part.shape?.id ?? '?'}" quantity must be a positive integer, got ${part.quantity}`,
      )
    }
  }

  const seen = new Set<string>()
  for (const item of stock) {
    if (!item.id) {
      errors.push('every stock item must have a non-empty id')
    } else if (seen.has(item.id)) {
      errors.push(`duplicate stock id "${item.id}"`)
    } else {
      seen.add(item.id)
    }

    if (!(item.width > 0) || !(item.height > 0)) {
      errors.push(
        `stock "${item.id}" must have positive dimensions, got ${item.width}x${item.height}`,
      )
    }

    for (const hole of item.holes ?? []) {
      const b = hole.bbox
      if (
        b.minX <= EPSILON ||
        b.minY <= EPSILON ||
        b.maxX >= item.width - EPSILON ||
        b.maxY >= item.height - EPSILON
      ) {
        errors.push(
          `stock "${item.id}" hole "${hole.id}" must be strictly inside the sheet boundary`,
        )
      }
    }
  }

  return errors
}

/** Response for a structurally invalid request: explicit reasons, zero placements, no throw. */
function invalidResponse(request: NestRequest, reason: string): NestResponse {
  const unplaced: UnplacedPart[] = (request.parts ?? []).map((part) => ({
    shapeId: part.shape.id,
    quantity: part.quantity,
    reason,
  }))
  return {
    placements: [],
    compoundPlacements: undefined,
    sheets: [],
    utilization: 0,
    wasteArea: 0,
    totalArea: 0,
    unplaced,
    budget: { iterations: 0 },
    seed: request.seed,
    edgeClearance: request.edgeClearance,
    partToPartClearance: request.partToPartClearance,
  }
}

/**
 * Runs true-shape nesting. Never throws for unplaceable parts — they are reported in `unplaced`.
 */
export function nestTrueShape(request: NestRequest): Observable<NestResponse> {
  return observeFlow(
    (signal) => runNestTrueShape(request, signal),
    request.signal,
  )
}

async function runNestTrueShape(
  request: NestRequest,
  signal: AbortSignal,
): Promise<NestResponse> {
  throwIfAborted(signal)
  const edgeClearance = request.edgeClearance
  const partToPartClearance = request.partToPartClearance

  const errors = validateRequest(request)
  if (errors.length > 0) {
    return invalidResponse(request, `invalid request: ${errors.join('; ')}`)
  }

  // FR-001: reject invalid objectives with an explicit reason instead of coercing silently.
  const objectiveResult = normalizeObjective(request.objective)
  if (!objectiveResult.ok) {
    return invalidResponse(request, `invalid objective: ${objectiveResult.reason}`)
  }
  const objective = objectiveResult.normalized

  throwIfAborted(signal)

  // FR-004/FR-006: pick the backend up front so the report always reflects the actual path.
  const selection = await selectBackendAsync(
    request.acceleration ?? DEFAULT_ACCELERATION,
  )
  const startedAtMs = Date.now()

  const allowed = resolveAllowedRotations(request.options?.allowedRotations)
  const strategies = request.options?.sortBy
    ? [request.options.sortBy]
    : DEFAULT_STRATEGIES
  const stock = filterStock(request.stock, request.remnantThreshold)

  const requests: Array<{
    request: (typeof request.parts)[number]
    rotations: number[]
  }> = []
  const unplaced: UnplacedPart[] = []
  const skipped = new Set<(typeof request.parts)[number]>()

  for (const part of request.parts) {
    const rotations = effectiveRotations(part, allowed)
    if (rotations === null) {
      skipped.add(part)
      unplaced.push({
        shapeId: part.shape.id,
        quantity: part.quantity,
        reason:
          'grain-locked part has no declared grainAngle; declare it or clear grainLocked',
      })
      continue
    }
    if (rotations.length === 0) {
      skipped.add(part)
      unplaced.push({
        shapeId: part.shape.id,
        quantity: part.quantity,
        reason: `grain-locked part has no permitted rotation aligned with grainAngle ${part.grainAngle}`,
      })
      continue
    }
    requests.push({ request: part, rotations })
  }

  const instanceCount = requests.reduce((sum, r) => sum + r.request.quantity, 0)
  const budgetLimit = Math.max(
    instanceCount * Math.max(stock.length, 1) * DEFAULT_SEARCH_BUDGET_FACTOR,
    1,
  )

  throwIfAborted(signal)

  const scoringStartedAtMs = Date.now()
  const { arrangement, iterations } = searchBestArrangement(
    requests,
    stock,
    edgeClearance,
    partToPartClearance,
    budgetLimit,
    strategies,
    objective,
  )
  const scoringMs = Date.now() - scoringStartedAtMs

  const placements = arrangement.placements

  const placedByShape = new Map<string, number>()
  for (const placement of placements) {
    placedByShape.set(
      placement.shapeId,
      (placedByShape.get(placement.shapeId) ?? 0) + 1,
    )
  }

  for (const part of request.parts) {
    if (skipped.has(part)) continue
    const placed = placedByShape.get(part.shape.id) ?? 0
    const missing = part.quantity - placed
    if (missing > 0) {
      unplaced.push({
        shapeId: part.shape.id,
        quantity: missing,
        reason:
          'no feasible placement on the supplied stock within the clearances and permitted rotations',
      })
    }
  }

  const usedIds = new Set(placements.map((p) => p.sheetId))
  const sheets = stock.filter((item) => usedIds.has(item.id))
  const consumedArea = sheets.reduce((sum, s) => sum + s.width * s.height, 0)
  const placedArea = arrangement.placedArea

  const backend = createBackendReport(selection, {
    scoringMs,
    totalMs: Date.now() - startedAtMs,
  })

  return {
    placements,
    compoundPlacements: undefined,
    sheets,
    utilization: materialUse(placedArea, consumedArea),
    wasteArea: Math.max(consumedArea - placedArea, 0),
    totalArea: consumedArea,
    unplaced,
    budget: { iterations },
    seed: request.seed,
    edgeClearance,
    partToPartClearance,
    backend,
    ...(request.objective === undefined ? {} : { objective }),
  }
}

export type { Placement }
export { effectiveRotations, resolveAllowedRotations } from './rotations'
export { isWithinBounds, polygonDistance } from './bounds'
export { isSeparated, isSeparatedFromAll } from './separation'
export { candidateAnchors, candidatePositions } from './candidates'
export {
  materialUse,
  searchBestArrangement,
  searchBestArrangementAsync,
  SearchBudget,
} from './search'
export type { AsyncScorer } from './search'
