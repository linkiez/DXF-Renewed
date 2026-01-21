import expect from 'expect'
import { parseString, toPolylines, toSVG } from '../../src'
describe('RAY / XLINE', () => {
  it('parses RAY and XLINE and converts them to polylines', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
RAY
5
R1
8
0
100
AcDbEntity
100
AcDbRay
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
0
XLINE
5
X1
8
0
100
AcDbEntity
100
AcDbXline
10
0
20
0
30
0
11
0
21
1
31
0
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(2)
    expect(parsed.entities[0].type).toEqual('RAY')
    expect(parsed.entities[1].type).toEqual('XLINE')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(2)
    expect(polylinesResult.polylines[0].vertices).toEqual([
      [0, 0],
      [1000, 0],
    ])
    expect(polylinesResult.polylines[1].vertices).toEqual([
      [0, -1000],
      [0, 1000],
    ])
    const svg = toSVG(parsed)
    expect(svg).toContain('<path')
  })
})