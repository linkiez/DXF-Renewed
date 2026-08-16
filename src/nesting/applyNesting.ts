/**
 * Nesting Pipeline
 *
 * Main entry point for the nesting process.
 * Orchestrates shape extraction, geometry analysis, bin packing,
 * and result generation.
 */

import type { ParsedDXF } from '../types'
import type {
  NestingOptions,
  NestingResult,
  NestingAlgorithm,
  NestingMetrics,
  StockSheet,
  Placement,
} from './types'
import { extractShapes, resetShapeIdCounter } from './shapeExtractor'
import { analyzeShapes, sortShapes } from './geometryAnalysis'
import { guillotinePack } from './binPacking/guillotine'
import { maxRectsPack } from './binPacking/maxrects'
import { shelfPack } from './binPacking/shelf'
import { validateNestingOptions } from './config'
import denormalise from '../denormalise'
import logger from '../util/logger'

// ─────────────────────────────────────────────
// Algorithm Router
// ─────────────────────────────────────────────

/** Route to the appropriate bin packing algorithm */
function packWithAlgorithm(
  algorithm: NestingAlgorithm,
  shapes: Parameters<typeof guillotinePack>[0],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number,
  maxSheets: number
) {
  switch (algorithm) {
    case 'guillotine':
    case 'bliss':
      return guillotinePack(shapes, sheetWidth, sheetHeight, margin, kerf, maxSheets)
    case 'maxrects':
      return maxRectsPack(shapes, sheetWidth, sheetHeight, margin, kerf, maxSheets)
    case 'shelf':
      return shelfPack(shapes, sheetWidth, sheetHeight, margin, kerf, maxSheets)
    default:
      logger.warn(`Unknown algorithm "${algorithm}", falling back to guillotine`)
      return guillotinePack(shapes, sheetWidth, sheetHeight, margin, kerf, maxSheets)
  }
}

// ─────────────────────────────────────────────
// Result Computation
// ─────────────────────────────────────────────

/** Compute nesting metrics from results */
function computeMetrics(
  placements: Placement[][],
  unplaced: Parameters<typeof guillotinePack>[0],
  sheets: StockSheet[],
  shapesTotalArea: number,
  algorithm: NestingAlgorithm,
  processingTimeMs: number
): NestingMetrics {
  const totalPlaced = placements.reduce((sum, sheet) => sum + sheet.length, 0)
  const totalArea = sheets.reduce((sum, sheet) => sum + sheet.width * sheet.height, 0)

  return {
    totalShapes: totalPlaced + unplaced.length,
    placedShapes: totalPlaced,
    unplacedShapes: unplaced.length,
    sheetsUsed: sheets.length,
    utilization: totalArea > 0 ? (shapesTotalArea / totalArea) * 100 : 0,
    wasteArea: Math.max(0, totalArea - shapesTotalArea),
    processingTimeMs,
    algorithm,
  }
}

// ─────────────────────────────────────────────
// Main Nesting Function
// ─────────────────────────────────────────────

/**
 * Perform nesting on DXF entities.
 *
 * @param parsed - Parsed DXF object
 * @param options - Nesting options
 * @returns Nesting result with placements and metrics
 */
export async function nest(
  parsed: ParsedDXF,
  partialOptions: Partial<NestingOptions> = {}
): Promise<NestingResult> {
  const startTime = performance.now()

  try {
    // Validate and merge options
    const options = validateNestingOptions(partialOptions)

    // Step 1: Denormalize entities (expand blocks)
    const entities = denormalise(parsed)

    // Step 2: Extract closed shapes
    const extraction = extractShapes(entities, options)

    if (extraction.shapes.length === 0) {
      logger.warn('No closed shapes found for nesting')
      return emptyResult(options, startTime)
    }

    logger.info(
      `Extracted ${extraction.shapes.length} shapes from ${entities.length} entities`
    )

    // Step 3: Analyze shapes
    const analyzedShapes = analyzeShapes(
      extraction.shapes,
      options.computeConvexHull ?? false
    )

    // Step 4: Sort shapes
    const sortedShapes = sortShapes(
      analyzedShapes as any,
      options.sortBy ?? 'area-desc'
    ) as typeof analyzedShapes

    // Step 5: Compute total shape area
    const shapesTotalArea = sortedShapes.reduce(
      (sum, shape) => sum + shape.area,
      0
    )

    // Step 6: Pack shapes using selected algorithm
    const sheets = Array.isArray(options.stockSheet)
      ? options.stockSheet
      : [options.stockSheet]

    const primarySheet = sheets[0]

    // Pack all shapes in one call (algorithm handles multi-sheet)
    const packResult = packWithAlgorithm(
      options.algorithm ?? 'guillotine',
      sortedShapes as any,
      primarySheet.width,
      primarySheet.height,
      options.margin ?? 10,
      options.kerf ?? 2,
      options.maxSheets ?? 0
    )

    const allPlacements = packResult.sheetPlacements
    const unplacedShapes = packResult.unplaced

    // Step 7: Flatten placements
    const allFlatPlacements: Placement[] = []
    for (const sheetPlacements of allPlacements) {
      allFlatPlacements.push(...sheetPlacements)
    }

    // Step 8: Compute metrics
    const processingTimeMs = performance.now() - startTime
    const metrics = computeMetrics(
      allPlacements,
      unplacedShapes as any,
      sheets.slice(0, allPlacements.length),
      shapesTotalArea,
      options.algorithm ?? 'guillotine',
      processingTimeMs
    )

    // Build result
    const totalArea = sheets
      .slice(0, allPlacements.length)
      .reduce((sum, s) => sum + s.width * s.height, 0)

    return {
      placements: allFlatPlacements,
      sheets: sheets.slice(0, allPlacements.length),
      unplacedShapes,
      utilization: metrics.utilization,
      wasteArea: metrics.wasteArea,
      totalArea,
      shapesTotalArea,
      sheetCount: allPlacements.length,
      processingTimeMs,
    }
  } catch (error) {
    logger.error('Nesting failed:', error)
    throw error
  }
}

/** Return an empty nesting result */
function emptyResult(
  options: NestingOptions,
  startTime: number
): NestingResult {
  return {
    placements: [],
    sheets: [],
    unplacedShapes: [],
    utilization: 0,
    wasteArea: 0,
    totalArea: 0,
    shapesTotalArea: 0,
    sheetCount: 0,
    processingTimeMs: performance.now() - startTime,
  }
}

// ─────────────────────────────────────────────
// Convenience Functions
// ─────────────────────────────────────────────

/**
 * Nest from raw DXF string.
 */
export async function nestFromDxf(
  dxfString: string,
  partialOptions: Partial<NestingOptions> = {}
): Promise<NestingResult> {
  const { default: parseString } = await import('../parseString')
  const parsed = parseString(dxfString)
  return nest(parsed, partialOptions)
}

/** Reset internal state (for testing) */
export function resetNestingState(): void {
  resetShapeIdCounter()
}
