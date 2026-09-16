/**
 * True-Shape Nesting — Bounded Search
 *
 * Global-yield search (FR-005) over alternative orderings and placements. The bound is a
 * deterministic count of candidate evaluations derived from the input size (never wall-clock,
 * FR-007). Within the budget the best arrangement by material use — placed part area divided by
 * consumed stock area (FR-006) — wins; ties fall back to the strategy order, which is stable.
 */

import type {
  NestableShape,
  OptimizationObjective,
  PartRequest,
  Placement,
  Point2D,
  SortStrategy,
  StockItem,
} from '../types'
import { computeBoundingBox, rotatePolygon, translatePolygon } from '../polygonUtils'
import { isWithinBounds } from './bounds'
import { isSeparatedFromAll } from './separation'
import { candidatePositions } from './candidates'
import { DEFAULT_OBJECTIVE_WEIGHTS, EPSILON } from '../config'
import { scoreLayout, type LayoutMetrics } from '../optimization/objective'

/** Deterministic iteration budget. Wall-clock time is never a term. */
export class SearchBudget {
  private used = 0

  constructor(private readonly limit: number) {}

  /** Returns false once the budget is exhausted. */
  tick(): boolean {
    if (this.used >= this.limit) return false
    this.used++
    return true
  }

  get iterations(): number {
    return this.used
  }

  get exhausted(): boolean {
    return this.used >= this.limit
  }
}

interface Instance {
  shape: NestableShape
  rotations: number[]
  instanceIndex: number
}

export interface Arrangement {
  placements: Placement[]
  placedVertices: Map<string, Point2D[]>
  placedArea: number
  consumedArea: number
  travelLength: number
}

/**
 * Layout metrics on a comparable 0–100 scale, higher-is-better. The single deterministic input to
 * the weighted score (FR-001); nothing here reads wall-clock time.
 */
function arrangementMetrics(
  result: Arrangement,
  stock: StockItem[],
): LayoutMetrics {
  const usedIds = new Set(result.placements.map((p) => p.sheetId))
  const usedSheets = usedIds.size

  let remnantConsumed = 0
  for (const item of stock) {
    if (usedIds.has(item.id) && item.kind === 'remnant') {
      remnantConsumed += item.width * item.height
    }
  }

  return {
    materialUse: materialUse(result.placedArea, result.consumedArea),
    travel: 100 / (1 + result.travelLength / 100),
    sheetCount: usedSheets > 0 ? 100 / usedSheets : 0,
    remnant:
      result.consumedArea > 0
        ? (remnantConsumed / result.consumedArea) * 100
        : 0,
  }
}

function sortInstances(instances: Instance[], strategy: SortStrategy): Instance[] {
  const sorted = [...instances]
  switch (strategy) {
    case 'area-desc':
      sorted.sort((a, b) => b.shape.area - a.shape.area)
      break
    case 'area-asc':
      sorted.sort((a, b) => a.shape.area - b.shape.area)
      break
    case 'perimeter-desc':
      sorted.sort((a, b) => b.shape.perimeter - a.shape.perimeter)
      break
    case 'none':
      break
  }
  return sorted
}

/** Material area of the stock items an arrangement actually consumes. */
function consumedAreaOf(placements: Placement[], stock: StockItem[]): number {
  const used = new Set(placements.map((p) => p.sheetId))
  return stock
    .filter((item) => used.has(item.id))
    .reduce((sum, item) => sum + item.width * item.height, 0)
}

/**
 * FR-005 stock-selection dimension: the caller's order is a preference, not a priority, so the
 * search also evaluates smallest-first and largest-first orderings and keeps the better yield.
 */
const STOCK_ORDERS = ['input', 'area-desc', 'area-asc'] as const

function orderStock(stock: StockItem[], order: (typeof STOCK_ORDERS)[number]): StockItem[] {
  if (order === 'input') return stock
  const sorted = [...stock]
  if (order === 'area-asc') {
    sorted.sort((a, b) => a.width * a.height - b.width * b.height)
  } else {
    sorted.sort((a, b) => b.width * b.height - a.width * a.height)
  }
  return sorted
}

/** Transform an instance so its bounding-box minimum lands on (x, y). */
function placeAt(
  shape: NestableShape,
  rotation: number,
  x: number,
  y: number,
): Point2D[] {
  const rotated = rotatePolygon(shape.vertices, shape.centroid, rotation)
  const bbox = computeBoundingBox(rotated)
  return translatePolygon(rotated, x - bbox.minX, y - bbox.minY)
}

/**
 * One deterministic pass: place every instance on the first stock item that accepts it.
 */
function runArrangement(
  instances: Instance[],
  stock: StockItem[],
  edgeClearance: number,
  partToPartClearance: number,
  budget: SearchBudget,
): Arrangement {
  const placements: Placement[] = []
  const placedVertices = new Map<string, Point2D[]>()
  const perStock = new Map<string, Point2D[][]>()
  let placedArea = 0
  let travelLength = 0

  for (const item of stock) perStock.set(item.id, [])

  for (const instance of instances) {
    let placed = false

    for (const item of stock) {
      if (placed) break
      const already = perStock.get(item.id) ?? []

      for (const rotation of instance.rotations) {
        if (placed) break

        for (const position of candidatePositions(
          already,
          edgeClearance,
          partToPartClearance,
          item.holes,
        )) {
          if (!budget.tick()) {
            return {
              placements,
              placedVertices,
              placedArea,
              consumedArea: consumedAreaOf(placements, stock),
              travelLength,
            }
          }

          const vertices = placeAt(instance.shape, rotation, position.x, position.y)

          if (!isWithinBounds(vertices, item, edgeClearance)) continue
          if (
            !isSeparatedFromAll(vertices, already, partToPartClearance)
          ) {
            continue
          }

          placements.push({
            shapeId: instance.shape.id,
            sheetId: item.id,
            instanceIndex: instance.instanceIndex,
            x: position.x,
            y: position.y,
            rotation,
            bbox: computeBoundingBox(vertices),
            transformedVertices: vertices,
          })
          already.push(vertices)
          placedVertices.set(`${instance.shape.id}#${instance.instanceIndex}`, vertices)
          placedArea += Math.abs(instance.shape.area)
          travelLength += Math.abs(instance.shape.perimeter)
          placed = true
          break
        }
      }
    }
  }

  return {
    placements,
    placedVertices,
    placedArea,
    consumedArea: consumedAreaOf(placements, stock),
    travelLength,
  }
}

/**
 * FR-006 yield metric: placed part area divided by consumed stock area, as a percentage.
 */
export function materialUse(placedArea: number, consumedArea: number): number {
  if (consumedArea <= 0) return 0
  return (placedArea / consumedArea) * 100
}

/** Deterministic empty arrangement: the starting point of every best-so-far comparison. */
function emptyArrangement(): Arrangement {
  return {
    placements: [],
    placedVertices: new Map(),
    placedArea: 0,
    consumedArea: 0,
    travelLength: 0,
  }
}

/** Expands part requests into one instance per requested unit (shared by both search paths). */
function buildInstances(
  requests: Array<{ request: PartRequest; rotations: number[] }>,
): Instance[] {
  const instances: Instance[] = []
  requests.forEach(({ request, rotations }) => {
    for (let i = 0; i < request.quantity; i++) {
      instances.push({ shape: request.shape, rotations, instanceIndex: i })
    }
  })
  return instances
}

/**
 * The single `better` rule shared by the synchronous and asynchronous searches: a higher score
 * wins; within `EPSILON` the larger placed area wins, then the smaller consumed area. Stable and
 * independent of candidate identity.
 */
function isBetter(
  score: number,
  placedArea: number,
  consumedArea: number,
  best: { score: number; placedArea: number; consumedArea: number },
): boolean {
  return (
    score > best.score + EPSILON ||
    (Math.abs(score - best.score) <= EPSILON &&
      (placedArea > best.placedArea ||
        (placedArea === best.placedArea && consumedArea < best.consumedArea)))
  )
}

/** Applies `isBetter` in enumeration order and returns the winning arrangement. */
function pickBest(
  candidates: Array<{ arrangement: Arrangement; metrics: LayoutMetrics }>,
  scores: number[],
): Arrangement {
  let best = emptyArrangement()
  const bestState = { score: -1, placedArea: -1, consumedArea: Infinity }

  candidates.forEach((candidate, index) => {
    const score = scores[index] ?? -1
    const { arrangement } = candidate
    if (isBetter(score, arrangement.placedArea, arrangement.consumedArea, bestState)) {
      bestState.score = score
      bestState.placedArea = arrangement.placedArea
      bestState.consumedArea = arrangement.consumedArea
      best = arrangement
    }
  })

  return best
}

/**
 * Enumerates the strategy × stock-order candidate arrangements under the deterministic budget.
 * The budget (a count of candidate evaluations) is the only bound; wall-clock time is never a term.
 */
function enumerateCandidates(
  instances: Instance[],
  stock: StockItem[],
  edgeClearance: number,
  partToPartClearance: number,
  budget: SearchBudget,
  strategies: SortStrategy[],
): Array<{ arrangement: Arrangement; metrics: LayoutMetrics }> {
  const candidates: Array<{ arrangement: Arrangement; metrics: LayoutMetrics }> = []

  for (const strategy of strategies) {
    for (const stockOrder of STOCK_ORDERS) {
      if (budget.exhausted) break
      const orderedStock = orderStock(stock, stockOrder)
      const arrangement = runArrangement(
        sortInstances(instances, strategy),
        orderedStock,
        edgeClearance,
        partToPartClearance,
        budget,
      )
      candidates.push({ arrangement, metrics: arrangementMetrics(arrangement, orderedStock) })
    }
  }

  return candidates
}

/**
 * Async scoring seam: an accelerator proposes one score per candidate arrangement, while the CPU
 * keeps selection, tie-break and validation authority (FR-004/FR-006).
 */
export interface AsyncScorer {
  score(metrics: readonly LayoutMetrics[]): Promise<number[]>
}

/**
 * Runs the bounded global-yield search over the supplied orderings and keeps the best
 * arrangement. Ties resolve to the earlier strategy in `strategies`, which is a stable order.
 */
export function searchBestArrangement(
  requests: Array<{ request: PartRequest; rotations: number[] }>,
  stock: StockItem[],
  edgeClearance: number,
  partToPartClearance: number,
  budgetLimit: number,
  strategies: SortStrategy[],
  weights: OptimizationObjective = DEFAULT_OBJECTIVE_WEIGHTS,
): { arrangement: Arrangement; iterations: number } {
  const budget = new SearchBudget(budgetLimit)
  const candidates = enumerateCandidates(
    buildInstances(requests),
    stock,
    edgeClearance,
    partToPartClearance,
    budget,
    strategies,
  )
  const scores = candidates.map((candidate) => scoreLayout(candidate.metrics, weights))
  return { arrangement: pickBest(candidates, scores), iterations: budget.iterations }
}

/**
 * Async counterpart of `searchBestArrangement`. Without a scorer the CPU scores inline, so the
 * result is identical to the synchronous baseline; with a scorer the accelerator only proposes
 * scores and the CPU still selects the winner.
 */
export async function searchBestArrangementAsync(
  requests: Array<{ request: PartRequest; rotations: number[] }>,
  stock: StockItem[],
  edgeClearance: number,
  partToPartClearance: number,
  budgetLimit: number,
  strategies: SortStrategy[],
  weights: OptimizationObjective = DEFAULT_OBJECTIVE_WEIGHTS,
  scorer?: AsyncScorer,
): Promise<{ arrangement: Arrangement; iterations: number }> {
  const budget = new SearchBudget(budgetLimit)
  const candidates = enumerateCandidates(
    buildInstances(requests),
    stock,
    edgeClearance,
    partToPartClearance,
    budget,
    strategies,
  )
  const scores = scorer
    ? await scorer.score(candidates.map((candidate) => candidate.metrics))
    : candidates.map((candidate) => scoreLayout(candidate.metrics, weights))
  return { arrangement: pickBest(candidates, scores), iterations: budget.iterations }
}
