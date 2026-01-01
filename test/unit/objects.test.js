import expectModule from 'expect'
import fs from 'node:fs'
import { getResourcePath } from './test-helpers.js'
const expect = expectModule.expect || expectModule.default

import { parseString } from '../../src'

describe('Objects', () => {
  it('parses DICTIONARY objects into a handle map', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'dictionary-basic.dxf'),
      'utf-8',
    )

    const parsed = parseString(contents)

    expect(parsed.objects).toBeDefined()
    expect(parsed.objects.dictionaries).toBeDefined()
    expect(parsed.objects.dictionaries.AB).toBeDefined()
    expect(parsed.objects.dictionaries.AB.handle).toEqual('AB')
    expect(parsed.objects.dictionaries.AB.entries.MYKEY).toEqual('CD')
  })

  it('parses XRECORD objects into a handle map', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'xrecord-basic.dxf'),
      'utf-8',
    )

    const parsed = parseString(contents)

    expect(parsed.objects).toBeDefined()
    expect(parsed.objects.xRecords).toBeDefined()
    const handles = Object.keys(parsed.objects.xRecords)
    expect(handles.length).toBeGreaterThan(0)

    const xRecord = parsed.objects.xRecords[handles[0]]
    expect(xRecord).toBeDefined()
    expect(xRecord.handle).toBeDefined()

    const tuples = xRecord.tuples
    expect(tuples).toEqual(expect.arrayContaining([[1, 'HELLO'], [40, 3.14]]))
  })

  it('parses IMAGEDEF and IMAGEDEF_REACTOR objects into handle maps', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'image-basic.dxf'),
      'utf-8',
    )

    const parsed = parseString(contents)

    expect(parsed.objects).toBeDefined()
    expect(parsed.objects.imageDefs).toBeDefined()
    const imageDefHandles = Object.keys(parsed.objects.imageDefs)
    expect(imageDefHandles.length).toBeGreaterThan(0)
    const imageDef = parsed.objects.imageDefs[imageDefHandles[0]]
    expect(imageDef).toBeDefined()
    expect(imageDef.fileName).toEqual('my.png')
    expect(imageDef.pixelSizeX).toEqual(640)
    expect(imageDef.pixelSizeY).toEqual(480)

    expect(parsed.objects.imageDefReactors).toBeDefined()
    const reactorHandles = Object.keys(parsed.objects.imageDefReactors)
    expect(reactorHandles.length).toBeGreaterThan(0)
    const reactor = parsed.objects.imageDefReactors[reactorHandles[0]]
    expect(reactor).toBeDefined()

    const image = parsed.entities?.find((e) => e.type === 'IMAGE')
    expect(image).toBeDefined()
    expect(reactor.imageHandle).toEqual(image.handle)
  })

  it('parses DIMASSOC objects into a handle map', () => {
    const dxf = `0
SECTION
2
OBJECTS
0
DIMASSOC
5
AA
330
BB
340
CC
70
1
0
ENDSEC
0
EOF
`

    const parsed = parseString(dxf)

    expect(parsed.objects).toBeDefined()
    expect(parsed.objects.dimAssocs).toBeDefined()
    expect(parsed.objects.dimAssocs.AA).toBeDefined()
    expect(parsed.objects.dimAssocs.AA.handle).toEqual('AA')
    expect(parsed.objects.dimAssocs.AA.ownerHandle).toEqual('BB')
    expect(parsed.objects.dimAssocs.AA.tuples).toEqual(
      expect.arrayContaining([[340, 'CC'], [70, 1]]),
    )
  })
})
