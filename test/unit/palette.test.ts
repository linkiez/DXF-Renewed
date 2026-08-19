import expect from 'expect'

import {
  CLOSED_POLYGON_FILL_PALETTE,
  CLOSED_POLYGON_STROKE_PALETTE,
  parseString,
  toSVG,
} from '../../src'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

describe('palette', () => {
  it('exports matching fill/stroke palettes made of valid hex colors', () => {
    expect(CLOSED_POLYGON_FILL_PALETTE.length).toBeGreaterThan(1)
    expect(CLOSED_POLYGON_STROKE_PALETTE).toHaveLength(
      CLOSED_POLYGON_FILL_PALETTE.length,
    )

    for (const color of CLOSED_POLYGON_FILL_PALETTE) {
      expect(color).toMatch(HEX_COLOR)
    }
    for (const color of CLOSED_POLYGON_STROKE_PALETTE) {
      expect(color).toMatch(HEX_COLOR)
    }
  })

  it('rotates the default palette across multiple closed polygons', () => {
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
3
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
LWPOLYLINE
8
0
90
4
70
1
10
0
20
0
10
10
20
0
10
10
20
10
10
0
20
10
0
LWPOLYLINE
8
0
90
4
70
1
10
20
20
0
10
30
20
0
10
30
20
10
10
20
20
10
0
ENDSEC
0
EOF
`

    const parsed = parseString(dxf)
    const svg = toSVG(parsed, {
      closedPolylineFill: CLOSED_POLYGON_FILL_PALETTE,
      closedPolylineStroke: CLOSED_POLYGON_STROKE_PALETTE,
    })

    expect(svg).toContain(`fill="${CLOSED_POLYGON_FILL_PALETTE[0]}"`)
    expect(svg).toContain(`fill="${CLOSED_POLYGON_FILL_PALETTE[1]}"`)
    expect(svg).toContain(`stroke="${CLOSED_POLYGON_STROKE_PALETTE[0]}"`)
    expect(svg).toContain(`stroke="${CLOSED_POLYGON_STROKE_PALETTE[1]}"`)
  })
})
