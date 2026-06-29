// nestCore.ts — Wrapper TypeScript em volta do SvgNest incorporado
//
// Converte NestPart[] para o formato que o PlacementWorker do SvgNest espera
// (arrays de {x, y} com propriedades extras como id, source, rotation).
// Pré-computa NFPs e roda o placement direto, contornando WebWorkers.
// Suporta multi-bin: peças que não cabem vão para bins adicionais.

import type { NestPart, NestPlacement, NestOptions } from './types'
import { loadSvgNest } from './svgnest-loader'

// ─── Helpers ───────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice(0)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function toSvgPoints(vertices: [number, number][]): { x: number; y: number }[] {
  return vertices.map((v) => ({ x: v[0], y: v[1] }))
}

function createSvgNestPart(
  part: NestPart,
  index: number,
): { x: number; y: number }[] & {
  id: number
  source: number
  rotation: number
} {
  const points = toSvgPoints(part.vertices)
  ;(points as any).id = index
  ;(points as any).source = index
  ;(points as any).rotation = 0

  if (part.holes && part.holes.length > 0) {
    ;(points as any).children = part.holes.map((hole) => toSvgPoints(hole))
  }

  return points as any
}

function createBinPolygon(
  width: number,
  height: number,
): { x: number; y: number }[] & { id: number } {
  const bin = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ]
  ;(bin as any).id = -1
  return bin as any
}

function computePlacedVertices(
  vertices: [number, number][],
  tx: number,
  ty: number,
  rotationDeg: number,
): [number, number][] {
  if (rotationDeg === 0) {
    return vertices.map((v) => [v[0] + tx, v[1] + ty] as [number, number])
  }

  const angle = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  let cx = 0, cy = 0
  for (const v of vertices) {
    cx += v[0]
    cy += v[1]
  }
  cx /= vertices.length
  cy /= vertices.length

  return vertices.map((v) => {
    const dx = v[0] - cx
    const dy = v[1] - cy
    const rx = dx * cos - dy * sin
    const ry = dx * sin + dy * cos
    return [rx + cx + tx, ry + cy + ty] as [number, number]
  })
}

// ─── Single Bin Nesting ────────────────────────────────────────────────

interface BinNestResult {
  placements: NestPlacement[]
  unplaced: NestPart[]
  fitness: number
  timeMs: number
}

/**
 * Nest a set of parts into a single bin.
 */
async function nestSingleBin(
  parts: NestPart[],
  options: NestOptions,
): Promise<BinNestResult> {
  if (parts.length === 0) {
    return { placements: [], unplaced: [], fitness: 0, timeMs: 0 }
  }

  const startMs = performance.now()

  const {
    binSize,
    spacing,
    curveTolerance,
    maxRotations,
    partInPart,
    gaPopulation,
    gaMutationRate,
    maxIterations,
    exploreConcave,
    onProgress,
  } = options

  await loadSvgNest()
  const GeometryUtil = (globalThis as any).GeometryUtil
  const PlacementWorker = (globalThis as any).PlacementWorker

  if (!GeometryUtil || !PlacementWorker) {
    throw new Error('[nestCore] SVGnest core not loaded')
  }

  // Convert parts to SvgNest format
  const svgParts = parts.map((part, idx) => createSvgNestPart(part, idx))

  // Create bin polygon
  const binPolygon = createBinPolygon(binSize.width, binSize.height)

  // Config
  const config = {
    clipperScale: 100,
    exploreConcave: exploreConcave ?? false,
    useHoles: partInPart ?? false,
    populationSize: gaPopulation ?? 10,
    mutationRate: gaMutationRate ?? 10,
    rotations: maxRotations ?? 4,
    curveTolerance: curveTolerance ?? 0.1,
    spacing: spacing ?? 0.2,
  }

  // Rotation angles to test
  const rotationAngles =
    maxRotations > 0
      ? Array.from({ length: maxRotations }, (_, i) => (360 / maxRotations) * i)
      : [0]

  // Pre-compute all NFPs
  const nfpCache: Record<string, any[]> = {}

  // NFP between bin and each part (inside = true)
  for (const part of svgParts) {
    for (const rot of rotationAngles) {
      const key = JSON.stringify({
        A: -1,
        B: part.id,
        inside: true,
        Arotation: 0,
        Brotation: rot,
      })

      if (!nfpCache[key]) {
        try {
          const rotatedPart = GeometryUtil.rotatePolygon(part, rot)
          const nfp = GeometryUtil.noFitPolygon(
            binPolygon,
            rotatedPart,
            true,
            exploreConcave ?? false,
          )
          nfpCache[key] = nfp || []
        } catch {
          nfpCache[key] = []
        }
      }
    }
  }

  // NFP between each pair of parts (inside = false)
  for (let i = 0; i < svgParts.length; i++) {
    for (let j = 0; j < svgParts.length; j++) {
      if (i === j) continue

      for (const rotA of rotationAngles) {
        for (const rotB of rotationAngles) {
          const key = JSON.stringify({
            A: svgParts[i].id,
            B: svgParts[j].id,
            inside: false,
            Arotation: rotA,
            Brotation: rotB,
          })

          if (!nfpCache[key]) {
            try {
              const rotatedA = GeometryUtil.rotatePolygon(svgParts[i], rotA)
              const rotatedB = GeometryUtil.rotatePolygon(svgParts[j], rotB)
              const nfp = GeometryUtil.noFitPolygon(
                rotatedA,
                rotatedB,
                false,
                exploreConcave ?? false,
              )
              nfpCache[key] = nfp || []
            } catch {
              nfpCache[key] = []
            }
          }
        }
      }
    }
  }

  console.log(
    `[nestCore] Pre-computed ${Object.keys(nfpCache).length} NFPs for ${svgParts.length} parts`,
  )

  // Sort parts by decreasing area (largest first)
  svgParts.sort((a, b) => {
    const areaA = Math.abs(GeometryUtil.polygonArea(a))
    const areaB = Math.abs(GeometryUtil.polygonArea(b))
    return areaB - areaA
  })

  // Run placement iterations
  let bestResult: any = null
  let bestFitness = Infinity

  for (let iter = 0; iter < maxIterations; iter++) {
    // First iteration uses area-sorted order; subsequent ones shuffle
    const iterParts =
      iter === 0
        ? svgParts.map((p) => {
            const pts = toSvgPoints(parts[p.source].vertices)
            ;(pts as any).id = p.id
            ;(pts as any).source = p.source
            ;(pts as any).rotation = 0
            return pts as any
          })
        : shuffleArray(
            svgParts.map((p) => {
              const pts = toSvgPoints(parts[p.source].vertices)
              ;(pts as any).id = p.id
              ;(pts as any).source = p.source
              ;(pts as any).rotation = 0
              return pts as any
            }),
          )

    // Assign random rotations
    const iterRotations = iterParts.map(() => {
      return rotationAngles[Math.floor(Math.random() * rotationAngles.length)]
    })

    iterParts.forEach((part, idx) => {
      part.rotation = iterRotations[idx]
    })

    // Set up worker context
    const oldEnv = (globalThis as any).env
    ;(globalThis as any).env = {
      self: {
        binPolygon,
        nfpCache,
        searchEdges: exploreConcave ?? false,
        useHoles: partInPart ?? false,
        config,
      },
    }

    try {
      const worker = new PlacementWorker(
        binPolygon,
        iterParts.map((p) => p.id),
        iterParts.map((p) => p.id),
        iterRotations,
        config,
        nfpCache,
      )

      const result = worker.placePaths(iterParts)

      if (result && result.fitness < bestFitness) {
        bestFitness = result.fitness
        bestResult = result
      }
    } finally {
      ;(globalThis as any).env = oldEnv
    }

    if (onProgress) {
      onProgress(iter, bestFitness)
    }
  }

  // Convert results back to NestPlacement[]
  const placements: NestPlacement[] = []
  const placedIds = new Set<number>()

  if (bestResult && bestResult.placements) {
    for (const binPlacements of bestResult.placements) {
      for (const placement of binPlacements) {
        const sourceIdx = placement.id
        const originalPart = parts[sourceIdx]

        if (!originalPart) continue

        placedIds.add(sourceIdx)

        const placedVertices = computePlacedVertices(
          originalPart.vertices,
          placement.x,
          placement.y,
          placement.rotation,
        )

        placements.push({
          partId: originalPart.id,
          layer: originalPart.layer,
          x: placement.x,
          y: placement.y,
          rotation: placement.rotation,
          vertices: originalPart.vertices,
          placedVertices,
          color: originalPart.color,
        })
      }
    }
  }

  // Determine unplaced parts
  const unplaced = parts.filter((_, idx) => !placedIds.has(idx))

  const elapsed = performance.now() - startMs
  console.log(
    `[nestCore] Bin: placed ${placements.length}/${parts.length}, ` +
      `unplaced ${unplaced.length} in ${elapsed.toFixed(0)}ms ` +
      `(fitness: ${bestFitness.toFixed(2)})`,
  )

  return { placements, unplaced, fitness: bestFitness, timeMs: elapsed }
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Nest parts into one or more bins using the real SVGnest algorithm.
 *
 * If parts don't fit in a single bin, they are automatically distributed
 * across multiple identical bins (multi-bin mode).
 *
 * Strategy per bin:
 * 1. Convert NestPart vertices to {x,y}[] arrays (SvgNest format)
 * 2. Pre-compute all NFPs (Non-Fitting Polygons) using GeometryUtil.noFitPolygon
 * 3. Feed NFP cache to PlacementWorker (bypassing WebWorkers)
 * 4. Run GA iterations with different orderings/rotations
 * 5. Convert results back to NestPlacement[]
 * 6. Repeat with unplaced parts until all fit or maxBins reached
 */
export async function nestParts(
  parts: NestPart[],
  options: NestOptions,
): Promise<NestPlacement[]> {
  if (parts.length === 0) return []

  const allPlacements: NestPlacement[] = []
  let remaining = parts
  let binCount = 0
  const maxBins = options.maxBins ?? 10

  while (remaining.length > 0 && binCount < maxBins) {
    binCount++

    if (binCount > 1) {
      console.log(`[nestCore] Opening bin ${binCount} for ${remaining.length} remaining parts`)
    }

    const result = await nestSingleBin(remaining, options)

    allPlacements.push(...result.placements)
    remaining = result.unplaced

    // If nothing was placed in this bin, stop to avoid infinite loop
    if (result.placements.length === 0 && remaining.length > 0) {
      console.log(
        `[nestCore] ⚠ No parts placed in bin ${binCount} — ` +
          `parts may be larger than the bin`,
      )
      break
    }
  }

  if (remaining.length > 0) {
    console.log(
      `[nestCore] ⚠ ${remaining.length} parts could not be placed after ${binCount} bins`,
    )
  }

  return allPlacements
}
