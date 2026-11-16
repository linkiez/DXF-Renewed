import { expect } from 'expect'
import { createNeighbourIndex } from '../../../../src/nesting/linking/neighbourIndex'
import type { BoundingBox } from '../../../../src/nesting'

const box = (x: number, y: number, size = 20): BoundingBox => ({ minX: x, minY: y, maxX: x + size, maxY: y + size, width: size, height: size })

const grid = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ key: `p${index}`, bbox: box((index % 25) * 24, Math.floor(index / 25) * 24) }))

describe('edit/neighbourIndex', () => {
  it('returns only the parts whose box meets the query box expanded by the margin, in a stable order', () => {
    const index = createNeighbourIndex([
      { key: 'a', bbox: box(0, 0) },
      { key: 'b', bbox: box(30, 0) },
      { key: 'c', bbox: box(200, 200) },
    ], 24)

    expect(index.query(box(0, 0), 15)).toEqual(['a', 'b'])
    expect(index.query(box(0, 0), 5)).toEqual(['a'])
  })

  it('moves a part between cells when its box is replaced', () => {
    const index = createNeighbourIndex([{ key: 'a', bbox: box(0, 0) }, { key: 'b', bbox: box(200, 200) }], 24)

    const moved = index.with('a', box(190, 190))

    expect(moved.query(box(200, 200), 0)).toEqual(['a', 'b'])
    expect(index.query(box(200, 200), 0)).toEqual(['b'])
    expect(moved.query(box(0, 0), 0)).toEqual([])
  })

  it('answers a query on a 500-part sheet with the neighbours only', () => {
    const index = createNeighbourIndex(grid(500), 24)

    const result = index.query(box(12 * 24, 10 * 24), 4)

    expect(result.length).toBeLessThanOrEqual(9)
    expect(result).toContain('p262')
  })

  it('keeps a part larger than a cell in every cell it covers', () => {
    const index = createNeighbourIndex([{ key: 'wide', bbox: box(0, 0, 100) }], 24)

    expect(index.query(box(90, 90, 5), 0)).toEqual(['wide'])
  })
})
