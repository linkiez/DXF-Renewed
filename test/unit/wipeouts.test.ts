import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('WIPEOUT', () => {
  it('parses WIPEOUT entity and renders outline fallback', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
WIPEOUT
5
W1
8
0
100
AcDbEntity
100
AcDbRasterImage
90
1
10
0
20
0
30
0
11
1
21
0
31
0
12
0
22
1
32
0
13
100
23
100
70
4
71
2
91
4
14
0
24
0
14
10
24
0
14
10
24
5
14
0
24
5
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('WIPEOUT')
    expect(entity.handle).toEqual('W1')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([
      [0, 0],
      [10, 0],
      [10, 5],
      [0, 5],
      [0, 0],
    ])
    const svg = toSVG(parsed)
    expect(svg).toContain('<path')
  })
})