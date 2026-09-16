/**
 * T013 — FR-004/FR-006/FR-007: backend selection and report.
 *
 * The report always states the real path; a failed probe records an explicit fallback reason and
 * never silently degrades. The SC-004 gate is 2× the baseline.
 */

import { expect } from 'expect'
import {
  ACCELERATION_GAIN_FACTOR,
  createBackendReport,
  meetsAccelerationGate,
  nestTrueShape,
  selectBackend,
} from '../../../../src/nesting'
import type { Point2D } from '../../../../src/nesting'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

function square(id: string, size: number) {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ] as Point2D[])
}

const stock = [{ id: 's1', kind: 'sheet' as const, width: 100, height: 100 }]
const parts = [{ shape: square('a', 20), quantity: 2 }]

describe('optimization/backend — selection and report', () => {
  it('acceleration:false pins the CPU baseline without probing', async () => {
    const selection = selectBackend(false)
    expect(selection.backend).toBe('cpu')
    expect(selection.requested).toBe(false)
    expect(selection.accelerated).toBe(false)
    expect(selection.fallbackReason).toBeUndefined()
  })

  it('acceleration enabled records an explicit fallback reason when no GPU is present', async () => {
    const selection = selectBackend(true, {
      available: false,
      reason: 'WebGPU unavailable: navigator.gpu is not present',
    })
    expect(selection.backend).toBe('cpu')
    expect(selection.requested).toBe(true)
    expect(selection.accelerated).toBe(false)
    expect(selection.fallbackReason).toContain('navigator.gpu')
  })

  it('never reports acceleration while no accelerated executor is wired', async () => {
    const selection = selectBackend(true, { available: true })
    expect(selection.backend).toBe('cpu')
    expect(selection.requested).toBe(true)
    expect(selection.accelerated).toBe(false)
    expect(selection.fallbackReason).toContain('no accelerated executor')
  })

  it('createBackendReport carries timings and the fallback reason when present', async () => {
    const report = createBackendReport(
      { backend: 'cpu', requested: true, accelerated: false, fallbackReason: 'no adapter' },
      { scoringMs: 3, totalMs: 7 },
    )
    expect(report.timings).toEqual({ scoringMs: 3, totalMs: 7 })
    expect(report.fallbackReason).toBe('no adapter')
    expect(report.accelerated).toBe(false)
  })

  it('meetsAccelerationGate requires at least 2× and rejects invalid timings', async () => {
    expect(ACCELERATION_GAIN_FACTOR).toBe(2)
    expect(meetsAccelerationGate(200, 100)).toBe(true)
    expect(meetsAccelerationGate(199, 100)).toBe(false)
    expect(meetsAccelerationGate(100, 0)).toBe(false)
    expect(meetsAccelerationGate(0, 100)).toBe(false)
  })

  it('nestTrueShape always returns a backend report reflecting the real path', async () => {
    const response = await nestTrueShape({
      stock,
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
    })
    expect(response.backend).toBeDefined()
    expect(response.backend?.accelerated).toBe(response.backend?.backend === 'webgpu')
    expect(response.backend?.requested).toBe(true)
    expect(response.backend?.timings.scoringMs).toBeGreaterThanOrEqual(0)
  })
})
