/**
 * Benchmark fixture for SC-002 / SC-003 (T023).
 *
 * 100 mixed parts over 5 sheets of 200×200: squares and notched squares (rectangular plus
 * irregular, FR-003), all with a 37×37 bounding box so the corpus is physically packable.
 *
 * Sizing rule that makes SC-003 meaningful: total part area must be at least 85% of the stock
 * area the job actually consumes. 100 parts of ~1.36k mm² total 136,260 mm², which is 85.2% of
 * the four sheets (160,000 mm²) they need. A corpus whose parts total less than 85% of their
 * consumed area cannot reach the floor under any packing algorithm — that is a fixture defect,
 * not a search defect.
 */

import type { NestableShape, Point2D, StockItem } from '../../../src/nesting/types'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'

/** Reads a shape from vertices, mirroring the existing fixture builder conventions. */
export function shapeFrom(id: string, vertices: Point2D[]): NestableShape {
  const bbox = computeBoundingBox(vertices)
  const area = Math.abs(
    vertices.reduce((sum, v, i) => {
      const w = vertices[(i + 1) % vertices.length]
      return sum + (v.x * w.y - w.x * v.y)
    }, 0) / 2,
  )
  return {
    id,
    layer: 'benchmark',
    vertices,
    bbox,
    area,
    perimeter: 4 * Math.max(bbox.width, bbox.height),
    centroid: { x: bbox.minX + bbox.width / 2, y: bbox.minY + bbox.height / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 0,
    isHole: false,
  }
}

function square(id: string, size: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ])
}

function notch(id: string, size: number, notchSize: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size - notchSize },
    { x: size - notchSize, y: size - notchSize },
    { x: size - notchSize, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ])
}

function triangle(id: string, size: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ])
}

export const BENCHMARK_SHEET_COUNT = 5
export const BENCHMARK_PART_COUNT = 100

/** Five 200×200 sheets. */
export function buildBenchmarkStock(): StockItem[] {
  return Array.from({ length: BENCHMARK_SHEET_COUNT }, (_, i) => ({
    id: `bench-sheet-${i + 1}`,
    kind: 'sheet' as const,
    width: 200,
    height: 200,
  }))
}

/** 100 mixed parts: 60 squares and 40 notched squares, every one 37×37 overall. */
export function buildBenchmarkParts(): NestableShape[] {
  const parts: NestableShape[] = []
  for (let i = 0; i < BENCHMARK_PART_COUNT; i++) {
    parts.push(i < 60 ? square(`bench-${i}`, 37) : notch(`bench-${i}`, 37, 4))
  }
  return parts
}
