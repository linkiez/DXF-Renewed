import expect from 'expect'
import fs from 'node:fs'
import { getResourcePath } from './test-helpers.ts'
import { parseString } from '../../src'
describe('UNDERLAY', () => {
  it('parses DWFUNDERLAY entity and UNDERLAYDEFINITION object', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'underlay-basic.dxf'),
      'utf-8',
    )
    const parsed = parseString(contents)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('PDFUNDERLAY')
    expect(entity.handle).toBeDefined()
    expect(entity.underlayDefinitionHandle).toBeDefined()
    expect(entity.insertionPoint).toEqual({ x: 10, y: 20, z: 0 })
    expect(entity.scale).toEqual({ x: 1, y: 1, z: 1 })
    expect(parsed.objects).toBeDefined()
    expect(parsed.objects.underlayDefinitions).toBeDefined()
    const underlayHandles = Object.keys(parsed.objects.underlayDefinitions)
    expect(underlayHandles.length).toBeGreaterThan(0)
    const def = parsed.objects.underlayDefinitions[underlayHandles[0]]
    expect(def).toBeDefined()
    expect(def.fileName).toEqual('file.pdf')
    expect(def.underlayName).toEqual('U1')
  })
})