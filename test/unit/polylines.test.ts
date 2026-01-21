import { getResourcePath } from './test-helpers.ts'
import fs from 'node:fs'
import expect from 'expect'
import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'polylines.dxf'),
  'utf-8',
)
describe('POLYLINE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)
    expect(entities[0]).toEqual({
      closed: true,
      handle: '6F',
      layer: 'DXF',
      polyfaceMesh: false,
      polygonMesh: false,
      type: 'POLYLINE',
      vertices: [
        { x: 286, y: 279.9999999999999, z: 0 },
        { x: 280, y: 286, z: 0 },
        { x: 20.00000000000011, y: 286, z: 0 },
        { x: 14.00000000000002, y: 280, z: 0 },
        { x: 14, y: 20.00000000000011, z: 0 },
        { x: 20, y: 14.00000000000002, z: 0 },
        { x: 279.9999999999999, y: 14, z: 0 },
        { x: 286, y: 20.00000000000011, z: 0 },
      ],
    })
  })
  it('flushes an open POLYLINE when SEQEND is missing', () => {
    const dxf = `0
SECTION
2
ENTITIES
0
POLYLINE
8
DXF
0
VERTEX
10
0
20
0
0
LINE
10
1
20
1
11
2
21
2
0
ENDSEC
0
EOF
`
    const entities = parseString(dxf).entities
    expect(entities.length).toEqual(2)
    expect(entities[0].type).toEqual('POLYLINE')
    expect(entities[0].vertices).toEqual([{ x: 0, y: 0 }])
    expect(entities[1].type).toEqual('LINE')
  })
  it('treats SEQEND as a terminator even without a handler', () => {
    const dxf = `0
SECTION
2
ENTITIES
0
POLYLINE
8
DXF
0
VERTEX
10
0
20
0
0
SEQEND
0
LINE
10
1
20
1
11
2
21
2
0
VERTEX
10
9
20
9
0
ENDSEC
0
EOF
`
    const entities = parseString(dxf).entities
    expect(entities.length).toEqual(2)
    expect(entities[0].type).toEqual('POLYLINE')
    expect(entities[0].vertices).toEqual([{ x: 0, y: 0 }])
    expect(entities[1].type).toEqual('LINE')
  })
  it('ignores orphan VERTEX entities', () => {
    const dxf = `0
SECTION
2
ENTITIES
0
VERTEX
10
0
20
0
0
LINE
10
1
20
1
11
2
21
2
0
ENDSEC
0
EOF
`
    const entities = parseString(dxf).entities
    expect(entities.length).toEqual(1)
    expect(entities[0].type).toEqual('LINE')
  })
})