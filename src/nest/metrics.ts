// metrics.ts — Calculates nesting metrics and statistics

import type { NestPart, NestPlacement, NestMetrics } from './types'
import { polygonArea, getCombinedBBox } from './geometry'

/**
 * Calculate detailed metrics from a nesting result.
 */
export function calculateMetrics(
  placements: NestPlacement[],
  unplaced: NestPart[],
  binSize: { width: number; height: number },
  totalParts: number,
  processingTimeMs: number,
  gaIterations: number,
  bestFitness: number
): NestMetrics {
  const placedParts = placements.length
  const unplacedParts = unplaced.length

  // Calculate total part area
  let totalPartArea = 0
  let maxPartArea = 0
  let minPartArea = Infinity

  for (const p of placements) {
    const area = polygonArea(p.placedVertices)
    totalPartArea += area
    if (area > maxPartArea) maxPartArea = area
    if (area < minPartArea) minPartArea = area
  }
  for (const p of unplaced) {
    totalPartArea += p.area
    if (p.area > maxPartArea) maxPartArea = p.area
    if (p.area < minPartArea) minPartArea = p.area
  }

  if (minPartArea === Infinity) minPartArea = 0

  const binArea = binSize.width * binSize.height
  const utilization = binArea > 0 ? (totalPartArea / binArea) * 100 : 0
  const waste = Math.max(0, 100 - utilization)

  // Estimate bins needed
  const placedBBox = getCombinedBBox(placements.map((p) => p.placedVertices))
  const binsUsed = Math.max(
    1,
    Math.ceil(placedBBox.w / binSize.width) * Math.ceil(placedBBox.h / binSize.height)
  )

  const avgPartArea = totalParts > 0 ? totalPartArea / totalParts : 0

  return {
    totalParts,
    placedParts,
    unplacedParts,
    totalPartArea: Math.round(totalPartArea * 100) / 100,
    binArea: Math.round(binArea * 100) / 100,
    utilizationPercent: Math.round(utilization * 100) / 100,
    wastePercent: Math.round(waste * 100) / 100,
    binsUsed,
    avgPartArea: Math.round(avgPartArea * 100) / 100,
    maxPartArea: Math.round(maxPartArea * 100) / 100,
    minPartArea: Math.round(minPartArea * 100) / 100,
    processingTimeMs: Math.round(processingTimeMs * 100) / 100,
    gaIterations,
    bestFitness: Math.round(bestFitness * 100) / 100,
  }
}

/**
 * Format metrics as a human-readable summary string.
 */
export function formatMetricsSummary(metrics: NestMetrics): string {
  const lines = [
    `═══ NESTING METRICS ═══`,
    `Total parts:     ${metrics.totalParts}`,
    `Placed:          ${metrics.placedParts}`,
    `Unplaced:        ${metrics.unplacedParts}`,
    ``,
    `Bin area:        ${formatArea(metrics.binArea)}`,
    `Used area:       ${formatArea(metrics.totalPartArea)}`,
    `Utilization:     ${metrics.utilizationPercent}%`,
    `Waste:           ${metrics.wastePercent}%`,
    ``,
    `Bins needed:     ${metrics.binsUsed}`,
    `Avg part area:   ${formatArea(metrics.avgPartArea)}`,
    `Max part area:   ${formatArea(metrics.maxPartArea)}`,
    `Min part area:   ${formatArea(metrics.minPartArea)}`,
    ``,
    `Processing:      ${metrics.processingTimeMs}ms`,
    `GA iterations:   ${metrics.gaIterations}`,
    `Best fitness:    ${metrics.bestFitness}`,
  ]

  return lines.join('\n')
}

function formatArea(area: number): string {
  if (area > 10000) {
    return `${(area / 1000000).toFixed(2)} m²`
  }
  return `${area.toFixed(1)} mm²`
}
