/**
 * T021 — integration through the public barrel: the 100-part benchmark job runs end to end,
 * places every part with no invalid placement, and stays inside the SC-002 time floor.
 */
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import {
  buildBenchmarkParts,
  buildBenchmarkStock,
} from '../../resources/nest-fixtures/trueShapeBenchmark'

describe('trueShape/integração pelo barrel público', () => {
  it('100 peças: todas colocadas, sem colocação inválida, dentro de 2 s', () => {
    const parts = buildBenchmarkParts().map((shape) => ({ shape, quantity: 1 }))
    const started = Date.now()
    const r = nestTrueShape({
      stock: buildBenchmarkStock(),
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 20260912,
    })
    expect(Date.now() - started).toBeLessThan(2000)
    expect(r.unplaced).toHaveLength(0)
    expect(r.placements).toHaveLength(100)
    expect(r.utilization).toBeGreaterThanOrEqual(85)
  })
})
