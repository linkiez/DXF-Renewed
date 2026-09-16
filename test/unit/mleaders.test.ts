import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('MLEADER', () => {
  it('parses MLEADER entity and renders its text', async () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
MLEADER
5
MLD1
8
0
100
AcDbEntity
100
AcDbMLeader
2
MLEADER_STYLE
90
1
1
LEADER_TEXT
10
10
20
20
30
0
40
2
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities).toHaveLength(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('MLEADER')
    expect(entity.handle).toEqual('MLD1')
    expect(entity.layer).toEqual('0')
    // Minimal payload
    expect(entity.styleName).toEqual('MLEADER_STYLE')
    expect(entity.text).toEqual('LEADER_TEXT')
    expect(entity.insertionPoint).toEqual({ x: 10, y: 20, z: 0 })
    expect(entity.textHeight).toEqual(2)
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines).toHaveLength(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<text')
    expect(svg).toContain('LEADER_TEXT')
    expect(svg).not.toContain('not supported in SVG rendering')
  })
})