import expectModule from 'expect'
const expect = expectModule.expect || expectModule.default

import parseString from '../../src/parseString'

describe('DIMASSOC (OBJECTS)', () => {
  it('parses DIMASSOC object and stores raw tuples', () => {
    const dxfContent = `0
SECTION
2
OBJECTS
0
DIMASSOC
5
DA1
330
DIC1
100
AcDbDimAssoc
90
1
0
ENDSEC
0
EOF`

    const parsed = parseString(dxfContent)

    expect(parsed.objects).toBeTruthy()
    expect(parsed.objects.dimAssocs).toBeTruthy()

    const dimAssoc = parsed.objects.dimAssocs.DA1
    expect(dimAssoc).toBeTruthy()

    expect(dimAssoc.type).toEqual('DIMASSOC')
    expect(dimAssoc.handle).toEqual('DA1')
    expect(dimAssoc.ownerHandle).toEqual('DIC1')

    // Raw tuples are preserved (excluding the initial 0/DIMASSOC tuple)
    expect(Array.isArray(dimAssoc.tuples)).toEqual(true)
    expect(dimAssoc.tuples.length).toBeGreaterThan(0)
  })
})
