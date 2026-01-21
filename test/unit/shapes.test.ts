import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('SHAPE', () => {
  it('parses SHAPE entity and renders SVG text fallback', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
SHAPE
5
S1
8
0
100
AcDbEntity
100
AcDbShape
39
0
10
10
20
20
30
0
40
5
2
MY_SHAPE
50
0
41
1
51
0
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('SHAPE')
    expect(entity.handle).toEqual('S1')
    expect(entity.insertionPoint).toEqual({ x: 10, y: 20, z: 0 })
    expect(entity.size).toEqual(5)
    expect(entity.name).toEqual('MY_SHAPE')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([
      [10, 20],
      [15, 20],
    ])
    const svg = toSVG(parsed)
    expect(svg).toContain('<text')
    expect(svg).toContain('MY_SHAPE')
  })
})