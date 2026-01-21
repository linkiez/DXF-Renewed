import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('REGION', () => {
  it('parses REGION entity and safely ignores rendering', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
REGION
5
R1
8
0
100
AcDbEntity
100
AcDbRegion
1
ACIS_LINE_1
3
ACIS_LINE_2
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('REGION')
    expect(entity.handle).toEqual('R1')
    expect(entity.layer).toEqual('0')
    expect(entity.acisData).toEqual(['ACIS_LINE_1', 'ACIS_LINE_2'])
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<svg')
  })
})