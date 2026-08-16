import expect from 'expect'

import { parseString, toSVG } from '../../src'

describe('toSVG (stroke-width autoscale)', () => {
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
20
20
0
10
20
20
10
10
0
20
10
0
ENDSEC
0
EOF
`

  it('keeps the historical screen-relative stroke-width by default', () => {
    const svg = toSVG(parseString(dxf))

    expect(svg).toContain('stroke-width="0.1%"')
  })

  it('supports screen-relative stroke-width scaling', () => {
    const svg = toSVG(parseString(dxf), {
      strokeWidth: {
        mode: 'screen',
        value: 0.25,
      },
    })

    expect(svg).toContain('stroke-width="0.25%"')
  })

  it('supports viewport-relative stroke-width scaling', () => {
    const svg = toSVG(parseString(dxf), {
      strokeWidth: {
        mode: 'viewport',
        value: 1,
      },
    })

    expect(svg).toContain('viewBox="0 -10 20 10"')
    expect(svg).toContain('stroke-width="0.1"')
  })
})
