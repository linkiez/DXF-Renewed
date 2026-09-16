import { getResourcePath } from './test-helpers.ts'
import fs from 'node:fs'
import expect from 'expect'
import { Box2 } from 'vecks'
import { Helper } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, '1x1rectangle.dxf'),
  'utf-8',
)
describe('Helper', () => {
  it('should be constructed with a string', async () => {
    expect(() => {
      return new Helper(null)
    }).toThrow('Helper constructor expects a DXF string')
  })
  it('parsed automatically', async () => {
    const helper = new Helper(dxfContents)
    expect(helper.parsed.entities.length).toEqual(1)
  })
  it('denormalises automatically', async () => {
    const helper = new Helper(dxfContents)
    expect(helper.denormalised.length).toEqual(1)
  })
  it('can group by layer', async () => {
    const helper = new Helper(dxfContents)
    expect(helper.groups.Default.length).toEqual(1)
  })
  it('can output an SVG', () => {
    const helper = new Helper(dxfContents)
    const svg = helper.toSVG()
    const viewBox = /viewBox\s*=\s*["']([^"']*)["']/.exec(svg)?.[1]

    expect(viewBox).toEqual('0 -10 10 10')
  })
  it('can output polylines', async () => {
    const helper = new Helper(dxfContents)
    const { bbox, polylines } = helper.toPolylines()
    expect(bbox.equals(new Box2({ x: 0, y: 0 }, { x: 10, y: 10 }))).toEqual(
      true,
    )
    expect(polylines).toEqual([
      {
        rgb: [0, 0, 79],
        layer: {
          colorNumber: 178,
          flags: 0,
          lineTypeName: 'Continuous',
          lineWeightEnum: '    -3',
          name: 'Default',
          type: 'LAYER',
        },
        vertices: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      },
    ])
  })
})