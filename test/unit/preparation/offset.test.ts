import assert from 'node:assert'
import { applyCutWidth } from '../../../src/nesting/pro/partPrep/offset'
import { ring } from './helpers'

function area(vertices: [number, number][]): number {
  let sum = 0
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length
    sum += vertices[i][0] * vertices[j][1] - vertices[j][0] * vertices[i][1]
  }
  return Math.abs(sum) / 2
}

describe('cut-width allowance', () => {
  it('offsets an outer boundary outward by kerf/2', async () => {
    const base = ring(0, 0, 20, 180)
    const allowance = 1
    const result = applyCutWidth(base, allowance, 'outer')
    const expected = Math.PI * Math.pow(20 + allowance / 2, 2)
    assert.ok(
      Math.abs(area(result) - expected) / expected < 0.005,
      `area ${area(result)} vs ${expected}`,
    )
  })

  it('offsets a hole inward by kerf/2', async () => {
    const base = ring(0, 0, 10, 180)
    const result = applyCutWidth(base, 1, 'hole')
    const expected = Math.PI * Math.pow(10 - 0.5, 2)
    assert.ok(
      Math.abs(area(result) - expected) / expected < 0.005,
      `area ${area(result)} vs ${expected}`,
    )
  })
})
