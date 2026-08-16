import expect from 'expect'
import { buildEvenOddPath, parseString, toSVG } from '../../src'

describe('toSVG (closed polylines)', () => {
  it('renders closed LWPOLYLINE with a closed svg path and optional fill', () => {
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

    const parsed = parseString(dxf)
    const svg = toSVG(parsed, { closedPolylineFill: '#8b5cf6' })

    expect(svg).toContain(
      '<path d="M0,0L20,0L20,10L0,10Z" fill-rule="evenodd" />',
    )
    expect(svg).toContain('fill="#8b5cf6"')
    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('stroke="rgb(0, 255, 0)"')
  })

  it('renders closed POLYLINE with a closed svg path and optional fill', () => {
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
5
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
POLYLINE
8
0
70
1
0
VERTEX
10
0
20
0
30
0
0
VERTEX
10
12
20
0
30
0
0
VERTEX
10
12
20
6
30
0
0
VERTEX
10
0
20
6
30
0
0
SEQEND
0
ENDSEC
0
EOF
`

    const parsed = parseString(dxf)
    const svg = toSVG(parsed, { closedPolylineFill: '#f59e0b' })

    expect(svg).toContain(
      '<path d="M0,0L12,0L12,6L0,6Z" fill-rule="evenodd" />',
    )
    expect(svg).toContain('fill="#f59e0b"')
    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('stroke="rgb(0, 0, 255)"')
  })

  it('fills closed polylines with entity color when the fill toggle is enabled', () => {
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

    const parsed = parseString(dxf)
    const svg = toSVG(parsed, { fillClosedPolylines: true })

    expect(svg).toContain(
      '<path d="M0,0L20,0L20,10L0,10Z" fill-rule="evenodd" />',
    )
    expect(svg).toContain('fill="rgb(0, 255, 0)"')
    expect(svg).toContain('stroke="rgb(0, 255, 0)"')
  })

  it('orders nested contour rings for evenodd fill', () => {
    const outer = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
      [0, 0],
    ] as Array<[number, number]>

    const hole = [
      [20, 20],
      [80, 20],
      [80, 80],
      [20, 80],
      [20, 20],
    ] as Array<[number, number]>

    const inner = [
      [40, 40],
      [60, 40],
      [60, 60],
      [40, 60],
      [40, 40],
    ] as Array<[number, number]>

    const path = buildEvenOddPath([outer, hole, inner])

    expect(path).toBe(
      'M0,0L100,0L100,100L0,100Z M20,20L80,20L80,80L20,80Z M40,40L60,40L60,60L40,60Z',
    )
  })
})
