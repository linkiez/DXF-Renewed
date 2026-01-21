import expect from 'expect'
import parseString from '../../src/parseString'
import toPolylines from '../../src/toPolylines'
import toSVG from '../../src/toSVG'
describe('MLEADER', () => {
  it('parses MLEADER entity and safely ignores rendering', () => {
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
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('MLEADER')
    expect(entity.handle).toEqual('MLD1')
    expect(entity.layer).toEqual('0')
    // Minimal payload
    expect(entity.styleName).toEqual('MLEADER_STYLE')
    expect(entity.text).toEqual('LEADER_TEXT')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([])
    const svg = toSVG(parsed)
    expect(svg).toContain('<svg')
  })
})