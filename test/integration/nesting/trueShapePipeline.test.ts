/**
 * T021 — integração pelo barrel público: o job de referência (100 peças / 5 chapas) roda ponta a
 * ponta, coloca todas as peças sem colocação inválida e fica dentro do piso de tempo SC-002.
 * T012 — reforça o eco do objetivo aplicado e a ausência de sobreposição (SC-002).
 */
import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import type { OptimizationObjective } from '../../../src/nesting'
import { isWithinBounds } from '../../../src/nesting/trueShape/bounds'
import { isSeparated } from '../../../src/nesting/trueShape/separation'
import {
  buildBenchmarkParts,
  buildBenchmarkStock,
} from '../../resources/nest-fixtures/trueShapeBenchmark'

const edgeClearance = 2
const partToPartClearance = 2

async function job(objective?: OptimizationObjective) {
  const parts = buildBenchmarkParts().map((shape) => ({ shape, quantity: 1 }))
  return await firstValueFrom(nestTrueShape({
    stock: buildBenchmarkStock(),
    parts,
    edgeClearance,
    partToPartClearance,
    seed: 20260912,
    ...(objective === undefined ? {} : { objective }),
  }))
}

describe('trueShape/integração pelo barrel público', () => {
  it('100 peças: todas colocadas, sem colocação inválida, dentro de 2 s', async () => {
    const started = Date.now()
    const r = await job()
    expect(Date.now() - started).toBeLessThan(2000)
    expect(r.unplaced).toHaveLength(0)
    expect(r.placements).toHaveLength(100)
    expect(r.utilization).toBeGreaterThanOrEqual(85)
  })

  it('ecoa o objetivo aplicado e não produz sobreposição nem saída dos limites (SC-002)', async () => {
    const objective: OptimizationObjective = {
      materialUse: 1,
      travel: 1,
      sheetCount: 1,
      remnant: 1,
    }
    const r = await job(objective)

    expect(r.objective).toBeDefined()
    expect(r.objective).not.toEqual(objective)
    const normalized = r.objective as OptimizationObjective
    const sum =
      normalized.materialUse +
      normalized.travel +
      normalized.sheetCount +
      normalized.remnant
    expect(Math.abs(sum - 1)).toBeLessThanOrEqual(1e-6)
    expect(r.backend?.backend).toBeDefined()

    const sheetById = new Map(buildBenchmarkStock().map((s) => [s.id, s]))
    for (const placement of r.placements) {
      const sheet = sheetById.get(placement.sheetId ?? '')
      expect(sheet).toBeDefined()
      expect(
        isWithinBounds(placement.transformedVertices ?? [], sheet!, edgeClearance),
      ).toBe(true)
    }
    for (let i = 0; i < r.placements.length; i++) {
      for (let j = i + 1; j < r.placements.length; j++) {
        if (r.placements[i].sheetId !== r.placements[j].sheetId) continue
        expect(
          isSeparated(
            r.placements[i].transformedVertices ?? [],
            r.placements[j].transformedVertices ?? [],
            partToPartClearance,
          ),
        ).toBe(true)
      }
    }
  })
})
