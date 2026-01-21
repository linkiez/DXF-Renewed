import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('MLINE', () => {
  it('parses MLINE entity and safely ignores rendering', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
MLINE
5
ML1
8
0
100
AcDbEntity
100
AcDbMline
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
71
2
72
1
73
0
2
MLSTYLE_NAME
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('MLINE')
    expect(entity.handle).toEqual('ML1')
    expect(entity.layer).toEqual('0')
    expect(entity.startPoint).toEqual({ x: 1, y: 2, z: 0 })
    expect(entity.endPoint).toEqual({ x: 11, y: 22, z: 0 })
    expect(entity.vertexCount).toEqual(2)
    expect(entity.styleName).toEqual('MLSTYLE_NAME')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<svg')
  })
})