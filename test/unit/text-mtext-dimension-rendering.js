import expect from 'expect'

import parseString from '../../src/parseString'
import toSVG from '../../src/toSVG'

describe('TEXT, MTEXT, and DIMENSION SVG rendering', () => {
  it('TEXT entity should render to SVG', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
TEXT
8
0
10
10.0
20
20.0
40
5.0
1
Hello World
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    expect(svg).toContain('<text')
    expect(svg).toContain('Hello World')
  })

  it('MTEXT entity should render to SVG', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
MTEXT
8
0
10
10.0
20
20.0
40
5.0
1
Multiline Text
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    expect(svg).toContain('<text')
    expect(svg).toContain('Multiline Text')
  })

  it('DIMENSION entity should render to SVG', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
DIMENSION
8
0
10
50.0
20
50.0
13
0.0
23
0.0
14
100.0
24
0.0
70
0
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    expect(svg).toContain('<line')
  })

  it('should handle TEXT with rotation', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
TEXT
8
0
10
10.0
20
20.0
40
5.0
50
45.0
1
Rotated Text
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    expect(svg).toContain('<text')
    expect(svg).toContain('rotate')
  })

  it('should handle MTEXT with x-axis direction', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
MTEXT
8
0
10
10.0
20
20.0
40
5.0
11
0.707
21
0.707
1
Rotated MTEXT
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    expect(svg).toContain('<text')
    expect(svg).toContain('rotate')
  })

  it('should handle different DIMENSION types', () => {
    const dxfContent = `0
SECTION
2
ENTITIES
0
DIMENSION
8
0
10
50.0
20
50.0
13
0.0
23
0.0
14
100.0
24
0.0
70
3
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)
    const svg = toSVG(parsed)

    // Diameter dimension (type 3)
    expect(svg).toContain('svg')
  })
})
