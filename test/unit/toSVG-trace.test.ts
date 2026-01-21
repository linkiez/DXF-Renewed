import expect from 'expect'
import { parseString, toSVG } from '../../src'
describe('toSVG (TRACE)', () => {
  it('renders TRACE as a filled path', () => {
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
1
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
    const svg = toSVG(parsed)
    expect(svg).toContain('viewBox="0 -5 10 5"')
    expect(svg).toContain('fill="rgb(255, 0, 0)"')
    expect(svg).toContain('stroke="none"')
    expect(svg).toContain('<path d="M0,0L10,0L10,5L0,5L0,0"')
  })
})