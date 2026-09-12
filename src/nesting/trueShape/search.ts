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
import { EPSILON } from '../config'

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

interface Arrangement {
  placements: Placement[]
  placedVertices: Map<string, Point2D[]>
  placedArea: number
  consumedArea: number
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
            return { placements, placedVertices, placedArea, consumedArea: consumedAreaOf(placements, stock) }
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
          placed = true
          break
        }
      }
    }
  }

  return { placements, placedVertices, placedArea, consumedArea: consumedAreaOf(placements, stock) }
}

/**
 * FR-006 yield metric: placed part area divided by consumed stock area, as a percentage.
 */
export function materialUse(placedArea: number, consumedArea: number): number {
  if (consumedArea <= 0) return 0
  return (placedArea / consumedArea) * 100
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
): { arrangement: Arrangement; iterations: number } {
  const budget = new SearchBudget(budgetLimit)

  const instances: Instance[] = []
  requests.forEach(({ request, rotations }) => {
    for (let i = 0; i < request.quantity; i++) {
      instances.push({ shape: request.shape, rotations, instanceIndex: i })
    }
  })

  let best: Arrangement = {
    placements: [],
    placedVertices: new Map(),
    placedArea: 0,
    consumedArea: 0,
  }
  let bestUse = -1
  let bestPlaced = -1
  let bestConsumed = Infinity

  for (const strategy of strategies) {
    for (const stockOrder of STOCK_ORDERS) {
      if (budget.exhausted) break
      const ordered = sortInstances(instances, strategy)
      const result = runArrangement(
        ordered,
        orderStock(stock, stockOrder),
        edgeClearance,
        partToPartClearance,
        budget,
      )
      const use = materialUse(result.placedArea, result.consumedArea)
      const better =
        use > bestUse + EPSILON ||
        (Math.abs(use - bestUse) <= EPSILON &&
          (result.placedArea > bestPlaced ||
            (result.placedArea === bestPlaced && result.consumedArea < bestConsumed)))
      if (better) {
        bestUse = use
        bestPlaced = result.placedArea
        bestConsumed = result.consumedArea
        best = result
      }
    }
  }

  return { arrangement: best, iterations: budget.iterations }
}
