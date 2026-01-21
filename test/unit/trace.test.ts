import expect from 'expect'
import { parseString, toPolylines } from '../../src'
describe('TRACE', () => {
  it('parses and converts TRACE to a closed polyline', () => {
    const dxf = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
TRACE
8
0
10
0
20
0
11
10
21
0
12
10
22
5
13
0
23
5
0
ENDSEC
0
EOF
`
    const parsed = parseString(dxf)
    expect(parsed.entities.length).toEqual(1)
    expect(parsed.entities[0].type).toEqual('TRACE')
    const { polylines } = toPolylines(parsed)
    expect(polylines.length).toEqual(1)
    expect(polylines[0].vertices).toEqual([
      [0, 0],
      [10, 0],
      [10, 5],
      [0, 5],
      [0, 0],
    ])
  })
})