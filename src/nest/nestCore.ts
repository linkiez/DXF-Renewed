// nestCore.ts — Wrapper TypeScript em volta do SvgNest incorporado
//
// Converte NestPart[] para o formato que o PlacementWorker do SvgNest espera
// (arrays de {x, y} com propriedades extras como id, source, rotation).
// Pré-computa NFPs e roda o placement direto, contornando WebWorkers.

import type { NestPart, NestPlacement, NestOptions } from './types'
import { loadSvgNest } from './svgnest-loader'

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Shuffle an array in place (Fisher-Yates).
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice(0)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Convert [number, number][] to {x, y}[] array that SvgNest expects.
 */
function toSvgPoints(vertices: [number, number][]): { x: number; y: number }[] {
  return vertices.map((v) => ({ x: v[0], y: v[1] }))
}

/**
 * Create a NestPart-compatible polygon array for SvgNest.
 * The array itself contains {x, y} points and also has id/source/rotation properties.
 */
function createSvgNestPart(
  part: NestPart,
  index: number
): { x: number; y: number }[] & {
  id: number
  source: number
  rotation: number
} {
  const points = toSvgPoints(part.vertices)
  ;(points as any).id = index
  ;(points as any).source = index
  ;(points as any).rotation = 0

  // Attach holes as children if present
  if (part.holes && part.holes.length > 0) {
    ;(points as any).children = part.holes.map((hole) => toSvgPoints(hole))
  }

  return points as any
}

/**
 * Create a rectangular bin polygon.
 */
function createBinPolygon(
  width: number,
  height: number
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

/**
 * Compute final vertices after applying translation and rotation.
 */
function computePlacedVertices(
  vertices: [number, number][],
  tx: number,
  ty: number,
  rotationDeg: number
): [number, number][] {
  if (rotationDeg === 0) {
    return vertices.map((v) => [v[0] + tx, v[1] + ty] as [number, number])
  }

  const angle = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // Compute centroid for rotation pivot
  let cx = 0,
    cy = 0
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

// ─── Core Nesting ──────────────────────────────────────────────────────

/**
 * Nest parts into a rectangular bin using the real SVGnest algorithm.
 *
 * Strategy:
 * 1. Convert NestPart vertices to {x,y}[] arrays (SvgNest format)
 * 2. Pre-compute all NFPs (Non-Fitting Polygons) using GeometryUtil.noFitPolygon
 * 3. Feed NFP cache to PlacementWorker (bypassing WebWorkers)
 * 4. Run GA iterations with different orderings/rotations
 * 5. Convert results back to NestPlacement[]
 */
export async function nestParts(
  parts: NestPart[],
  options: NestOptions
): Promise<NestPlacement[]> {
  if (parts.length === 0) return []

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

  // 1. Load the SVGnest core libraries (injected into globalThis)
  await loadSvgNest()
  const GeometryUtil = (globalThis as any).GeometryUtil
  const PlacementWorker = (globalThis as any).PlacementWorker

  if (!GeometryUtil || !PlacementWorker) {
    throw new Error('[nestCore] SVGnest core not loaded')
  }

  // 2. Convert parts to SvgNest format
  const svgParts = parts.map((part, idx) => createSvgNestPart(part, idx))

  // 3. Create bin polygon
  const binPolygon = createBinPolygon(binSize.width, binSize.height)

  // 4. Config
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

  // 5. Determine rotation angles to test
  const rotationAngles =
    maxRotations > 0
      ? Array.from({ length: maxRotations }, (_, i) => (360 / maxRotations) * i)
      : [0]

  // 6. Pre-compute all NFPs needed
  const nfpCache: Record<string, any[]> = {}

  // 6a. NFP between bin and each part (inside = true)
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
            exploreConcave ?? false
          )
          nfpCache[key] = nfp || []
        } catch {
          nfpCache[key] = []
        }
      }
    }
  }

  // 6b. NFP between each pair of parts (inside = false)
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
                exploreConcave ?? false
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
    `[nestCore] Pre-computed ${Object.keys(nfpCache).length} NFPs for ${svgParts.length} parts`
  )

  // 7. Sort parts by decreasing area (largest first — same strategy as SVGnest)
  svgParts.sort((a, b) => {
    const areaA = Math.abs(GeometryUtil.polygonArea(a))
    const areaB = Math.abs(GeometryUtil.polygonArea(b))
    return areaB - areaA
  })

  // 8. Run placement iterations
  let bestResult: any = null
  let bestFitness = Infinity

  for (let iter = 0; iter < maxIterations; iter++) {
    // Shuffle parts for diversity (first iter uses area-sorted order)
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
            })
          )

    // Assign rotations
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
        nfpCache
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

  // 9. Convert results back to NestPlacement[]
  const placements: NestPlacement[] = []

  if (bestResult && bestResult.placements) {
    for (const binPlacements of bestResult.placements) {
      for (const placement of binPlacements) {
        const sourceIdx = placement.id
        const originalPart = parts[sourceIdx]

        if (!originalPart) continue

        const placedVertices = computePlacedVertices(
          originalPart.vertices,
          placement.x,
          placement.y,
          placement.rotation
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

  const elapsed = performance.now() - startMs
  console.log(
    `[nestCore] Placed ${placements.length}/${parts.length} parts in ${elapsed.toFixed(0)}ms (fitness: ${bestFitness.toFixed(2)})`
  )

  return placements
}
