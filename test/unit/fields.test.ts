import expect from 'expect'
import parseString from '../../src/parseString'
describe('FIELD (OBJECTS)', () => {
  it('parses FIELD object and preserves raw tuples', () => {
    const dxfContent = `0
SECTION
2
OBJECTS
0
FIELD
5
F1
330
DIC1
100
AcDbField
1
SOME_FIELD_TEXT
0
ENDSEC
0
EOF`
    const parsed = parseString(dxfContent)
    expect(parsed.objects).toBeTruthy()
    expect(parsed.objects.fields).toBeTruthy()
    const field = parsed.objects.fields.F1
    expect(field).toBeTruthy()
    expect(field.type).toEqual('FIELD')
    expect(field.handle).toEqual('F1')
    expect(field.ownerHandle).toEqual('DIC1')
    expect(Array.isArray(field.tuples)).toEqual(true)
    expect(field.tuples.length).toBeGreaterThan(0)
  })
})