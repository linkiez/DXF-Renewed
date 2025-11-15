import round10 from './round10'

/**
 * Copied and ported to code standard as the b-spline library is not maintained any longer.
 * Source:
 * https://github.com/thibauts/b-spline
 * Copyright (c) 2015 Thibaut Séguy <thibaut.seguy@gmail.com>
 */
export default function bSpline(
  t: number,
  degree: number,
  points: number[][],
  knots?: number[],
  weights?: number[]
): number[] {
  const n = points.length // points count
  const d = points[0].length // point dimensionality

  if (t < 0 || t > 1) {
    throw new Error('t out of bounds [0,1]: ' + t)
  }
  if (degree < 1) throw new Error('degree must be at least 1 (linear)')
  if (degree > n - 1)
    throw new Error('degree must be less than or equal to point count - 1')

  let actualWeights = weights
  if (!actualWeights) {
    // build weight vector of length [n]
    actualWeights = []
    for (let i = 0; i < n; i++) {
      actualWeights[i] = 1
    }
  }

  let actualKnots = knots
  if (!actualKnots) {
    // build knot vector of length [n + degree + 1]
    actualKnots = []
    for (let i = 0; i < n + degree + 1; i++) {
      actualKnots[i] = i
    }
  } else {
    if (actualKnots.length !== n + degree + 1)
      throw new Error('bad knot vector length')
  }

  const domain = [degree, actualKnots.length - 1 - degree]

  // remap t to the domain where the spline is defined
  const low = actualKnots[domain[0]]
  const high = actualKnots[domain[1]]
  let tMapped = t * (high - low) + low

  // Clamp to the upper &  lower bounds instead of
  // throwing an error like in the original lib
  // https://github.com/bjnortier/dxf/issues/28
  tMapped = Math.max(tMapped, low)
  tMapped = Math.min(tMapped, high)

  // find s (the spline segment) for the [t] value provided
  let s = domain[0]
  for (s = domain[0]; s < domain[1]; s++) {
    if (tMapped >= actualKnots[s] && tMapped <= actualKnots[s + 1]) {
      break
    }
  }

  // convert points to homogeneous coordinates
  const v: number[][] = []
  for (let i = 0; i < n; i++) {
    v[i] = []
    for (let j = 0; j < d; j++) {
      v[i][j] = points[i][j] * actualWeights[i]
    }
    v[i][d] = actualWeights[i]
  }

  // l (level) goes from 1 to the curve degree + 1
  let alpha: number
  for (let l = 1; l <= degree + 1; l++) {
    // build level l of the pyramid
    for (let i = s; i > s - degree - 1 + l; i--) {
      alpha = (tMapped - actualKnots[i]) / (actualKnots[i + degree + 1 - l] - actualKnots[i])

      // interpolate each component
      for (let j = 0; j < d + 1; j++) {
        v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j]
      }
    }
  }

  // convert back to cartesian and return
  const result: number[] = []
  for (let i = 0; i < d; i++) {
    result[i] = round10(v[s][i] / v[s][d], -9)
  }
  return result
}
