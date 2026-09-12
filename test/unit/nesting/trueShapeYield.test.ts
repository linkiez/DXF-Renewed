/**
 * T014 — FR-005: global yield and deterministic tie-breaking.
 *
 * The engine evaluates alternative placements and keeps the arrangement that maximizes placed
 * part area; among equally yielding arrangements it consumes the least stock and resolves ties in
 * a stable order.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import type { Point2D, StockItem } from '../../../src/nesting/types'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

function square(id: string, size: number) {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ] as Point2D[])
}

describe('trueShape/yield', () => {
  it('prefers the arrangement that consumes less stock for the same placed area', () => {
    const stock: StockItem[] = [
      { id: 'big', kind: 'sheet', width: 100, height: 100 },
      { id: 'small', kind: 'sheet', width: 30, height: 30 },
    ]

    const response = nestTrueShape({
      stock,
      parts: [{ shape: square('a', 20), quantity: 1 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
    })

    expect(response.sheets).toHaveLength(1)
    expect(response.sheets[0].id).toBe('small')
  })

  it('maximizes placed part area across the job', () => {
    const response = nestTrueShape({
      stock: [{ id: 's1', kind: 'sheet', width: 60, height: 60 }],
      parts: [{ shape: square('a', 20), quantity: 4 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
    })

    expect(response.unplaced).toEqual([])
    expect(response.placements).toHaveLength(4)
  })

  it('maximizes material use when several stock items can host the same job', () => {
    const stock: StockItem[] = [
      { id: 'large', kind: 'sheet', width: 200, height: 200 },
      { id: 'dense', kind: 'sheet', width: 100, height: 100 },
    ]

    const response = nestTrueShape({
      stock,
      parts: [{ shape: square('a', 30), quantity: 2 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 11,
    })

    // Both sheets fit the parts; material use favors the smaller consumed area.
    expect(response.sheets.map((s) => s.id)).toEqual(['dense'])
    expect(response.unplaced).toEqual([])
    expect(response.utilization).toBeCloseTo(((2 * 30 * 30) / (100 * 100)) * 100, 5)
  })

  it('resolves equally yielding arrangements in a stable deterministic order', () => {
    const stock: StockItem[] = [
      { id: 's1', kind: 'sheet', width: 100, height: 100 },
      { id: 's2', kind: 'sheet', width: 100, height: 100 },
    ]
    const request = {
      stock,
      parts: [{ shape: square('a', 20), quantity: 2 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 5,
    }

    const first = nestTrueShape(request)
    const second = nestTrueShape(request)

    expect(JSON.stringify(first.placements)).toBe(JSON.stringify(second.placements))
    expect(first.sheets.map((s) => s.id)).toEqual(second.sheets.map((s) => s.id))
  })
})
