import expect from 'expect'
import fs from 'node:fs'
import { getResourcePath } from './test-helpers.ts'
import { parseString, toPolylines, toSVG } from '../../src'
describe('LEADER', () => {
  it('parses LEADER entity and renders basic SVG path', () => {
    const contents = fs.readFileSync(
      getResourcePath(import.meta.url, 'leader-basic.dxf'),
      'utf-8',
    )
    const parsed = parseString(contents)
    expect(parsed.entities.length).toEqual(1)
    const entity = parsed.entities[0]
    expect(entity.type).toEqual('LEADER')
    expect(entity.handle).toBeDefined()
    expect(String(entity.handle)).toMatch(/^[0-9A-F]+$/i)
    expect(entity.vertices.length).toEqual(3)
    expect(entity.vertices[0]).toEqual({ x: 0, y: 0, z: 0 })
    expect(entity.vertices[1]).toEqual({ x: 100, y: 0, z: 0 })
    expect(entity.vertices[2]).toEqual({ x: 100, y: 50, z: 0 })
    const svg = toSVG(parsed)
    expect(svg).toContain('<path')
    const polylinesResult = toPolylines(parsed)
    expect(polylinesResult.polylines.length).toEqual(1)
    expect(polylinesResult.polylines[0].vertices).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
    ])
  })
})