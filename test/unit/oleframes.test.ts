import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('OLEFRAME', () => {
  it('parses OLEFRAME entity and safely ignores rendering', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
OLEFRAME
5
OF1
8
0
100
AcDbEntity
100
AcDbOleFrame
10
1
20
2
30
0
11
11
21
22
31
0
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('OLEFRAME')
    expect(entity.handle).toEqual('OF1')
    expect(entity.layer).toEqual('0')
    // Bounding box points (optional fields)
    expect(entity.upperLeftX).toEqual(1)
    expect(entity.upperLeftY).toEqual(2)
    expect(entity.lowerRightX).toEqual(11)
    expect(entity.lowerRightY).toEqual(22)
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<svg')
  })
})