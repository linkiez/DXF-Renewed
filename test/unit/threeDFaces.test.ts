import { getResourcePath } from './test-helpers.ts'
import fs from 'node:fs'
import expect from 'expect'
import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'threeDFaces.dxf'),
  'utf-8',
)
describe('3DFACE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(12)
    expect(entities[0]).toEqual({
      type: '3DFACE',
      layer: '0',
      vertices: [
        { x: -10, y: -10, z: -10 },
        { x: -10, y: -10, z: 10 },
        { x: -10, y: 10, z: 10 },
        { x: -10, y: 10, z: 10 },
      ],
    })
    expect(entities[1]).toEqual({
      type: '3DFACE',
      layer: '0',
      vertices: [
        { x: -10, y: -10, z: -10 },
        { x: -10, y: 10, z: 10 },
        { x: -10, y: 10, z: -10 },
        { x: -10, y: 10, z: -10 },
      ],
    })
  })
})