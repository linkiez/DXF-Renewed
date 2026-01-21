import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('TABLE (entity)', () => {
  it('parses TABLE entity and safely ignores rendering', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
TABLE
5
T1
8
0
100
AcDbEntity
100
AcDbTable
90
2
91
3
1
CELL_1
1
CELL_2
1
CELL_3
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('TABLE')
    expect(entity.handle).toEqual('T1')
    expect(entity.layer).toEqual('0')
    // Minimal payload
    expect(entity.rows).toEqual(2)
    expect(entity.columns).toEqual(3)
    expect(entity.cellText).toEqual(['CELL_1', 'CELL_2', 'CELL_3'])
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<svg')
  })
})