import expect from 'expect'
import parseString from '../../src/parseString'
import toSVG from '../../src/toSVG'
describe('TOLERANCE', () => {
  it('parses TOLERANCE entity and renders SVG text fallback', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
TOLERANCE
5
TA
8
0
100
AcDbFcf
3
Standard
10
10
20
20
30
0
1
%%v%%v
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('TOLERANCE')
    expect(entity.handle).toEqual('TA')
    expect(entity.insertionPoint).toEqual({ x: 10, y: 20, z: 0 })
    expect(entity.text).toEqual('%%v%%v')
    const svg = toSVG(parsed)
    expect(svg).toContain('<text')
  })
})