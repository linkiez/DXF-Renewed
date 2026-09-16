import type { Point2D } from '../types'
import { EPSILON } from '../config'
import { distance } from '../polygonUtils'
import { transformedContour } from './geometry'
import type { CutContour, CutSequenceStrategy } from './types'

interface IndexedContour {
  contour: CutContour
  index: number
}

const entryPoint = (contour: CutContour): Point2D =>
  transformedContour(contour)[0] ?? { x: 0, y: 0 }

const compareStable = (a: IndexedContour, b: IndexedContour): number =>
  a.contour.id.localeCompare(b.contour.id) || a.index - b.index

function dependenciesSatisfied(
  candidate: CutContour,
  selected: readonly CutContour[],
  allContours: readonly CutContour[],
): boolean {
  if (!candidate.isOuter) return true
  return allContours
    .filter((contour) => contour.parentContourId === candidate.id)
    .every((contour) => selected.some((item) => item.id === contour.id))
}

function safeOrder(contours: readonly CutContour[]): IndexedContour[] {
  const indexed = contours.map((contour, index) => ({ contour, index }))
  const result: IndexedContour[] = []
  const remaining = [...indexed]
  while (remaining.length > 0) {
    const selected = remaining.filter((item) =>
      dependenciesSatisfied(
        item.contour,
        result.map((entry) => entry.contour),
        contours,
      ),
    )
    const candidates = selected.length > 0 ? selected : remaining
    const next = candidates.slice().sort(compareStable)[0]
    result.push(next)
    remaining.splice(remaining.indexOf(next), 1)
  }
  return result
}

function nearestNeighbour(
  contours: readonly CutContour[],
  startPoint: Point2D,
): CutContour[] {
  const remaining = contours.map((contour, index) => ({ contour, index }))
  const ordered: CutContour[] = []
  let current = startPoint
  while (remaining.length > 0) {
    const eligible = remaining.filter((item) =>
      dependenciesSatisfied(item.contour, ordered, contours),
    )
    const candidates = eligible.length > 0 ? eligible : remaining
    candidates.sort((a, b) =>
      distance(current, entryPoint(a.contour)) -
        distance(current, entryPoint(b.contour)) ||
      a.contour.id.localeCompare(b.contour.id) ||
      a.index - b.index,
    )
    const next = candidates[0]
    ordered.push(next.contour)
    current = entryPoint(next.contour)
    remaining.splice(remaining.indexOf(next), 1)
  }
  return ordered
}

function orderIsSafe(contours: readonly CutContour[]): boolean {
  const seen = new Set<string>()
  for (const contour of contours) {
    if (contour.parentContourId && !seen.has(contour.parentContourId)) return false
    seen.add(contour.id)
  }
  return true
}

function twoOpt(
  initial: readonly CutContour[],
  startPoint: Point2D,
  budget: number,
): CutContour[] {
  const result = [...initial]
  let steps = 0
  let improved = true
  const routeLength = (items: readonly CutContour[]): number => {
    let total = 0
    let current = startPoint
    for (const item of items) {
      const next = entryPoint(item)
      total += distance(current, next)
      current = next
    }
    return total
  }
  while (improved && steps < budget) {
    improved = false
    const currentLength = routeLength(result)
    for (let first = 0; first < result.length - 1 && steps < budget; first += 1) {
      for (let second = first + 1; second < result.length && steps < budget; second += 1) {
        steps += 1
        const candidate = [
          ...result.slice(0, first),
          ...result.slice(first, second + 1).reverse(),
          ...result.slice(second + 1),
        ]
        if (!orderIsSafe(candidate)) continue
        if (routeLength(candidate) + EPSILON < currentLength) {
          result.splice(0, result.length, ...candidate)
          improved = true
          break
        }
      }
      if (improved) break
    }
  }
  return result
}

/** Return a deterministic, dependency-safe contour order. */
export function sequenceContours(
  contours: readonly CutContour[],
  strategy: CutSequenceStrategy,
  startPoint: Point2D = { x: 0, y: 0 },
  budget = Math.max(1, contours.length * contours.length * 2),
): CutContour[] {
  const safe = safeOrder(contours)
  if (strategy === 'input') return safe.map((item) => item.contour)
  const nearest = nearestNeighbour(safe.map((item) => item.contour), startPoint)
  return strategy === 'stable-2-opt'
    ? twoOpt(nearest, startPoint, Math.max(0, Math.floor(budget)))
    : nearest
}
