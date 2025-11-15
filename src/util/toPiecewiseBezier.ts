import type { BezierResult, UtilPoint } from '../types/util-types'
import insertKnot from './insertKnot'

/**
 * For a pinned spline, the knots have to be repeated k times
 * (where k is the order), at both the beginning and the end
 */
export const checkPinned = (k: number, knots: number[]): void => {
  // Pinned at the start
  for (let i = 1; i < k; ++i) {
    if (knots[i] !== knots[0]) {
      throw new Error(`not pinned. order: ${k} knots: ${knots}`)
    }
  }
  // Pinned at the end
  for (let i = knots.length - 2; i > knots.length - k - 1; --i) {
    if (knots[i] !== knots[knots.length - 1]) {
      throw new Error(`not pinned. order: ${k} knots: ${knots}`)
    }
  }
}

export const multiplicity = (knots: number[], index: number): number => {
  let m = 1
  for (let i = index + 1; i < knots.length; ++i) {
    if (knots[i] === knots[index]) {
      ++m
    } else {
      break
    }
  }
  return m
}

/**
 * https://saccade.com/writing/graphics/KnotVectors.pdf
 * A quadratic piecewise Bézier knot vector with seven control points
 * will look like this [0 0 0 1 1 2 2 3 3 3]. In general, in a
 * piecewise Bézier knot vector the first k knots are the same,
 * then each subsequent group of k-1 knots is the same,
 * until you get to the end.
 */
export const computeInsertions = (k: number, knots: number[]): number[] => {
  const inserts: number[] = []
  let i = k
  while (i < knots.length - k) {
    const knot = knots[i]
    const m = multiplicity(knots, i)
    for (let j = 0; j < k - m - 1; ++j) {
      inserts.push(knot)
    }
    i = i + m
  }
  return inserts
}

export default function toPiecewiseBezier(
  k: number,
  controlPoints: UtilPoint[],
  knots: number[]
): BezierResult {
  checkPinned(k, knots)
  const insertions = computeInsertions(k, knots)
  return insertions.reduce(
    (acc, tNew) => {
      return insertKnot(k, acc.controlPoints, acc.knots, tNew)
    },
    { controlPoints, knots },
  )
}
