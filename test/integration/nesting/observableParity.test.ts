import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import parseString from '../../../src/parseString'
import { nest } from '../../../src/nesting/applyNesting'
import { nestDXF, nestWithPreset, quickNest } from '../../../src/nest'
import { nestFromDxf } from '../../../src/nesting/applyNesting'
import { nestTrueShape } from '../../../src/nesting/trueShape'
import { prepareParts } from '../../../src/nesting/pro/partPrep'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

type Baseline = {
  [job: string]: unknown
}

const baseline = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'test/integration/nesting/fixtures/observable-baseline.json'),
    'utf8',
  ),
) as Baseline

const dxf = fs.readFileSync(
  path.join(
    process.cwd(),
    'test/integration/nesting/fixtures/observable-reference-two-shape.dxf',
  ),
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

    const rawOptions = {
      binSize: { width: 200, height: 100 },
      gaPopulation: 4,
      maxIterations: 3,
      seed: 20260101,
      baselineCompatibility: '7.7.6',
    }
    const baselineOptions = {
      seed: 20260101,
      baselineCompatibility: '7.7.6' as const,
    }
    const actual = {
      'parsed-dxf-simple': {
        nest: await firstValueFrom(
          nest(parseString(dxf), {
            stockSheet: { width: 200, height: 100 },
            margin: 10,
            kerf: 2,
          }),
        ),
        nestFromDxf: await firstValueFrom(
          nestFromDxf(dxf, {
            stockSheet: { width: 200, height: 100 },
            margin: 10,
            kerf: 2,
          }),
        ),
      },
      'raw-dxf-preset': {
        nestDXF: await firstValueFrom(nestDXF(dxf, rawOptions)),
        nestWithPreset: await firstValueFrom(
          nestWithPreset(dxf, 'laser', rawOptions.binSize, baselineOptions),
        ),
        quickNest: await firstValueFrom(
          quickNest(dxf, baselineOptions),
        ),
      },
      'true-shape-mixed': await firstValueFrom(
        nestTrueShape({
          stock: [{ id: 'fixture-sheet', kind: 'sheet', width: 100, height: 100 }],
          parts: [{ shape, quantity: 2 }],
          edgeClearance: 1,
          partToPartClearance: 1,
          iterations: 5000,
          seed: 20260101,
        }),
      ),
      'part-prep-boundary': await firstValueFrom(
        prepareParts(
          {
            entities: [
              {
                type: 'LWPOLYLINE',
                handle: 'accepted',
                layer: '0',
                closed: true,
                vertices: [
                  { x: 0, y: 0 },
                  { x: 10, y: 0 },
                  { x: 10, y: 10 },
                  { x: 0, y: 10 },
                ],
              },
              {
                type: 'LWPOLYLINE',
                handle: 'rejected',
                layer: '0',
                closed: false,
                vertices: [
                  { x: 0, y: 0 },
                  { x: 10, y: 0 },
                  { x: 10, y: 10 },
                  { x: 0, y: 10 },
                  { x: 0, y: 5 },
                ],
              },
            ],
          },
          { tolerance: 0.1, cutWidthAllowance: 0 },
        ),
      ),
    }

    assert.deepEqual(normalize(actual), baseline)
  })
})
