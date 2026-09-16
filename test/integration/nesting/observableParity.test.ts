import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import parseString from '../../../src/parseString'
import { nest } from '../../../src/nesting/applyNesting'
import { nestDXF } from '../../../src/nest'
import { nestTrueShape } from '../../../src/nesting/trueShape'
import { prepareParts } from '../../../src/nesting/pro/partPrep'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

type Baseline = {
  seed: number
  jobs: Record<string, unknown>
}

const baseline = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'test/integration/nesting/fixtures/observable-baseline.json'),
    'utf8',
  ),
) as Baseline

const dxf = fs.readFileSync(
  path.join(process.cwd(), 'test/resources/nest-fixtures/simple-parts.dxf'),
  'utf8',
)

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize)
  if (!value || typeof value !== 'object') return value
  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (key === 'processingTimeMs' || key === 'timings') continue
    if (typeof item === 'function' || item === undefined) continue
    result[key] = normalize(item)
  }
  return result
}

describe('Observable baseline parity', () => {
  it('matches the frozen reference jobs apart from measurement-only timings', async () => {
    const shape = shapeFrom('fixture-square', [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ])

    const actual = {
      'parsed-dxf-simple': await firstValueFrom(nest(parseString(dxf))),
      'raw-dxf-preset': await firstValueFrom(
        nestDXF(dxf, { binSize: { width: 100, height: 100 }, maxIterations: 0 }),
      ),
      'true-shape-mixed': await firstValueFrom(
        nestTrueShape({
          stock: [{ id: 'fixture-sheet', kind: 'sheet', width: 100, height: 100 }],
          parts: [{ shape, quantity: 2 }],
          edgeClearance: 1,
          partToPartClearance: 1,
          seed: baseline.seed,
        }),
      ),
      'part-prep-boundary': await firstValueFrom(
        prepareParts({ entities: [] }, { tolerance: 0.1, cutWidthAllowance: 0 }),
      ),
    }

    assert.deepEqual(normalize(actual), baseline.jobs)
  })
})
