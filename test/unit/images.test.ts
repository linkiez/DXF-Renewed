import expect from 'expect'
import fs from 'node:fs'
import { getResourcePath } from './test-helpers.ts'
import { parseString } from '../../src'
describe('IMAGE', () => {
  it('can be parsed', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'image-basic.dxf'),
      'utf-8',
    )
    const parsed = parseString(contents)
    expect(parsed.entities).toBeDefined()
    expect(parsed.entities.length).toEqual(1)
    const image = parsed.entities[0]
    expect(image.type).toEqual('IMAGE')
    expect(image.handle).toBeDefined()
    expect(String(image.handle)).toMatch(/^[0-9A-F]+$/i)
    expect(image.insertionPoint).toEqual({ x: 1, y: 2, z: 0 })
    expect(image.uVector).toEqual({ x: 1, y: 0, z: 0 })
    expect(image.vVector.x).toBeCloseTo(0, 10)
    expect(image.vVector.y).toBeCloseTo(1, 10)
    expect(image.vVector.z).toEqual(0)
    expect(image.pixelSizeX).toEqual(640)
    expect(image.pixelSizeY).toEqual(480)
    expect(image.imageDefHandle).toBeDefined()
    expect(String(image.imageDefHandle)).toMatch(/^[0-9A-F]+$/i)
    expect(image.imageDefReactorHandle).toBeDefined()
    expect(String(image.imageDefReactorHandle)).toMatch(/^[0-9A-F]+$/i)
  })
})