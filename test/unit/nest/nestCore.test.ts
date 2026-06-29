import { expect } from 'expect'
import { nestParts } from '../../../src/nest/nestCore'
import type { NestPart } from '../../../src/nest/types'

describe('nest/nestCore', () => {
  const createSquarePart = (id: string, size: number): NestPart => ({
    id,
    layer: 'TEST',
    vertices: [
      [0, 0],
      [size, 0],
      [size, size],
      [0, size],
    ],
    holes: [],
    bbox: { x: 0, y: 0, w: size, h: size },
    area: size * size,
  })

  it('returns empty for no parts', async () => {
    const result = await nestParts([], {
      binSize: { width: 100, height: 100 },
      spacing: 1,
      curveTolerance: 0.1,
      maxRotations: 4,
      partInPart: false,
      gaPopulation: 5,
      gaMutationRate: 10,
      maxIterations: 5,
      exploreConcave: false,
    })
    expect(result).toEqual([])
  })

  it('places simple squares in a bin', async () => {
    const parts: NestPart[] = [
      createSquarePart('a', 20),
      createSquarePart('b', 20),
      createSquarePart('c', 20),
    ]

    const placements = await nestParts(parts, {
      binSize: { width: 100, height: 100 },
      spacing: 1,
      curveTolerance: 0.1,
      maxRotations: 0,
      partInPart: false,
      gaPopulation: 5,
      gaMutationRate: 5,
      maxIterations: 10,
      exploreConcave: false,
    })

    expect(placements.length).toBeGreaterThanOrEqual(1)
  })

  it('handles parts larger than bin', async () => {
    const parts: NestPart[] = [
      createSquarePart('big', 200),
    ]

    const placements = await nestParts(parts, {
      binSize: { width: 50, height: 50 },
      spacing: 1,
      curveTolerance: 0.1,
      maxRotations: 0,
      partInPart: false,
      gaPopulation: 3,
      gaMutationRate: 5,
      maxIterations: 5,
      exploreConcave: false,
    })

    expect(placements.length).toBe(0)
  })

  it('reports progress via callback', async () => {
    const parts: NestPart[] = [
      createSquarePart('a', 10),
      createSquarePart('b', 10),
    ]

    const progressLog: number[] = []

    const placements = await nestParts(parts, {
      binSize: { width: 100, height: 100 },
      spacing: 1,
      curveTolerance: 0.1,
      maxRotations: 0,
      partInPart: false,
      gaPopulation: 3,
      gaMutationRate: 5,
      maxIterations: 5,
      exploreConcave: false,
      onProgress: (iter) => progressLog.push(iter),
    })

    expect(progressLog.length).toBeGreaterThan(0)
  })
})
