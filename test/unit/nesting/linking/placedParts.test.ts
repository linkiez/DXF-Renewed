import { expect } from 'expect'
import type { StockItem } from '../../../../src/nesting'
import { placedParts } from '../../../../src/nesting/linking/placedParts'
import type { ErpNestingArtifact } from '../../../../src/nesting/erp/types'
import { compoundFixture, smallFixture, sparsePlacementFixture } from '../review/fixtures'

type Layout = NonNullable<ErpNestingArtifact['layout']>

const run = (artifact: ErpNestingArtifact) => {
  const layout = artifact.layout as Layout
  return placedParts(layout, layout.sheets as StockItem[])
}

describe('linking/placedParts', () => {
  it('groups parts by sheet in artifact order with the part key shapeId#instanceIndex', async () => {
    const { artifact } = await smallFixture()

    const result = run(artifact)

    expect([...result.partsBySheet.keys()]).toEqual(['sheet-1', 'sheet-2'])
    expect(result.partsBySheet.get('sheet-1')?.map((p) => p.key)).toEqual(['part-1#0', 'part-2#0'])
    expect(result.partsBySheet.get('sheet-2')?.map((p) => p.sheetId)).toEqual(['sheet-2', 'sheet-2'])
    expect(result.findings).toEqual([])
  })

  it('uses the only sheet when a placement has no sheetId, with deterministic instances', async () => {
    const { artifact } = { artifact: (await sparsePlacementFixture(1)).artifact }

    const result = run(artifact)

    expect(result.partsBySheet.get('sheet-1')?.map((p) => p.key)).toEqual(['part-1#0', 'part-2#0'])
  })

  it('returns a finding and no part when the sheet cannot be determined', async () => {
    const result = run((await sparsePlacementFixture(2)).artifact)

    expect([...result.partsBySheet.values()].flat()).toEqual([])
    expect(result.findings).toHaveLength(4)
    expect(result.findings[0]).toEqual({ kind: 'sheet-unresolved', key: 'part-1#0' })
  })

  it('draws the bounding box and flags the part as approximate when no outline exists', async () => {
    const result = run((await sparsePlacementFixture(1)).artifact)
    const part = result.partsBySheet.get('sheet-1')?.[0]

    expect(part?.approximate).toBe(true)
    expect(part?.outlines).toHaveLength(1)
    expect(part?.outlines[0]).toHaveLength(5)
    expect(result.findings.filter((f) => f.kind === 'geometry-approximate')).toHaveLength(2)
    expect(result.findings[0]).toEqual({ kind: 'geometry-approximate', key: 'part-1#0', sheetId: 'sheet-1' })
  })

  it('keeps the real outline and does not flag a placement that has one', async () => {
    const { artifact } = await smallFixture()
    const part = run(artifact).partsBySheet.get('sheet-1')?.[0]

    expect(part?.approximate).toBe(false)
    expect(part?.outlines[0].length).toBeGreaterThanOrEqual(4)
  })

  it('turns a compound placement into one part with the outer and hole outlines', async () => {
    const result = run((await compoundFixture()).artifact)
    const parts = result.partsBySheet.get('sheet-1') ?? []

    expect(parts).toHaveLength(1)
    expect(parts[0].key).toBe('compound-1#0')
    expect(parts[0].outlines).toHaveLength(2)
  })

  it('carries no user text', async () => {
    const result = run((await sparsePlacementFixture(2)).artifact)

    expect(JSON.stringify(result.findings)).not.toMatch(/não|chapa|peça/i)
  })
})
