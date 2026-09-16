// nest/index.ts — Public API for DXF nesting

import parseString from '../parseString'
import { extractParts, autoDetectBin, type ExtractPartsOptions } from './extractParts'
import { nestParts } from './nestCore'
import { calculateMetrics, formatMetricsSummary } from './metrics'
import { generateNestSVG, generateNestDXF } from './output'

import type {
  NestOptions,
  NestResult,
} from './types'
import { DEFAULT_NEST_OPTIONS, NEST_PRESETS } from './types'
import { Observable } from 'rxjs'
import { observeFlow, throwIfAborted } from '../nesting/async/observableFlow'

const LEGACY_BASELINE_SEEDS = {
  nestDXF: 241,
  preset: 11,
  quick: 0,
} as const

// Re-export types
export type { NestPart, NestPlacement, NestOptions, NestResult, NestMetrics } from './types'
export type { ExtractPartsOptions } from './extractParts'
export { DEFAULT_NEST_OPTIONS, NEST_PRESETS, COMMON_BIN_SIZES } from './types'

/**
 * Main nesting API — parse a DXF, extract parts, nest them, and return results.
 *
 * @param dxfText - Raw DXF text content
 * @param options - Nesting options (binSize is required unless autoDetect is true)
 * @param extractOptions - Options for part extraction
 * @returns Nesting result with placements, metrics, and output generators
 */
export function nestDXF(
  dxfText: string,
  options: Partial<NestOptions> & { autoDetectBin?: boolean },
  extractOptions?: Partial<ExtractPartsOptions>,
): Observable<
  NestResult & { svg: () => string; dxf: () => string; metricsSummary: () => string }
> {
  return observeFlow(
    (signal) => runNestDXF(dxfText, options, extractOptions, signal),
    options.signal,
  )
}

async function runNestDXF(
  dxfText: string,
  options: Partial<NestOptions> & { autoDetectBin?: boolean },
  extractOptions: Partial<ExtractPartsOptions> | undefined,
  signal: AbortSignal,
): Promise<
  NestResult & { svg: () => string; dxf: () => string; metricsSummary: () => string }
> {
  const startMs = performance.now()
  throwIfAborted(signal)

  // 1. Parse DXF
  const parsed = parseString(dxfText)

  // 2. Determine bin size
  const binSize = options.binSize ??
    (options.autoDetectBin ? autoDetectBin(parsed) : undefined)

  if (!binSize) {
    throw new Error('nestDXF: binSize is required (or set autoDetectBin: true)')
  }

  // 3. Merge defaults
  const fullOptions: NestOptions = {
    ...DEFAULT_NEST_OPTIONS,
    ...options,
    binSize,
    seed:
      options.baselineSeedOverride ??
      (options.baselineCompatibility === '7.7.6'
        ? LEGACY_BASELINE_SEEDS.nestDXF
        : options.seed),
  }

  // 4. Extract parts
  const parts = extractParts(parsed, extractOptions)

  if (parts.length === 0) {
    return {
      placements: [],
      unplaced: [],
      metrics: {
        totalParts: 0,
        placedParts: 0,
        unplacedParts: 0,
        totalPartArea: 0,
        binArea: binSize.width * binSize.height,
        utilizationPercent: 0,
        wastePercent: 100,
        binsUsed: 0,
        avgPartArea: 0,
        maxPartArea: 0,
        minPartArea: 0,
        processingTimeMs: 0,
        gaIterations: 0,
        bestFitness: 0,
      },
      svg: () => '',
      dxf: () => '',
      metricsSummary: () => 'No parts extracted.',
    }
  }

  throwIfAborted(signal)

  // 5. Run nesting (supports multi-bin)
  const placements = await nestParts(parts, fullOptions)
  throwIfAborted(signal)

  // 6. Determine unplaced parts
  const placedIds = new Set(placements.map((p) => p.partId))
  const unplaced = parts.filter((p) => !placedIds.has(p.id))

  // 7. Calculate metrics
  const elapsed = performance.now() - startMs
  const metrics = calculateMetrics(
    placements,
    unplaced,
    binSize,
    parts.length,
    elapsed,
    fullOptions.maxIterations,
    0, // bestFitness placeholder
  )

  // 8. Generate output functions
  const svg = () => generateNestSVG(placements, unplaced, binSize)
  const dxf = () => generateNestDXF(placements, binSize)
  const metricsSummary = () => formatMetricsSummary(metrics)

  // Print metrics once at the end
  console.log(metricsSummary())

  return {
    placements,
    unplaced,
    metrics,
    svg,
    dxf,
    metricsSummary,
  }
}

/**
 * Convenience: nest with a preset configuration.
 *
 * @param dxfText - Raw DXF text
 * @param preset - Preset name ('laser', 'plasma', 'waterjet', 'cnc')
 * @param binSize - Bin/chapa size
 */
export function nestWithPreset(
  dxfText: string,
  preset: keyof typeof NEST_PRESETS,
  binSize: { width: number; height: number },
  options: Partial<NestOptions> = {},
): Observable<
  NestResult & { svg: () => string; dxf: () => string; metricsSummary: () => string }
> {
  const presetOpts = NEST_PRESETS[preset] ?? {}
  return nestDXF(dxfText, {
    ...presetOpts,
    ...options,
    binSize,
    ...(options.baselineCompatibility === '7.7.6' &&
    options.baselineSeedOverride === undefined
      ? { baselineSeedOverride: LEGACY_BASELINE_SEEDS.preset }
      : {}),
  })
}

/**
 * Quick nest: auto-detect everything and nest with laser defaults.
 */
export function quickNest(
  dxfText: string,
  options: Partial<NestOptions> = {},
): Observable<
  NestResult & { svg: () => string; dxf: () => string; metricsSummary: () => string }
> {
  return nestWithPreset(
    dxfText,
    'laser',
    { width: 2000, height: 4000 },
    options.baselineCompatibility === '7.7.6'
      ? {
          ...options,
          baselineSeedOverride: LEGACY_BASELINE_SEEDS.quick,
        }
      : options,
  )
}
