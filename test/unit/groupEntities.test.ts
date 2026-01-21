import expect from 'expect'
import fs from 'fs'
import { getResourcePath } from './test-helpers.ts'
import { denormalise, groupEntitiesByLayer, parseString } from '../../src'
describe('Group entities', () => {
  it('by layer', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'floorplan.dxf'), 'utf-8'),
    )
    const entities = denormalise(parsed)
    const byLayer = groupEntitiesByLayer(entities)
    expect(Object.keys(byLayer)).toEqual([
      '0',
      'A-NOTE',
      'A-TEXT',
      'A-DIMS-1',
      'ANNTEXT',
      'xref-Bishop-Overland-08$0$A-WALL',
      'xref-Bishop-Overland-08$0$A-CASE-1',
      'xref-Bishop-Overland-08$0$A-OPENING',
      'xref-Bishop-Overland-08$0$A-GARAGE-DOOR',
      'xref-Bishop-Overland-08$0$S-STEM-WALL',
      'xref-Bishop-Overland-08$0$S-FOOTER',
      'xref-Bishop-Overland-08$0$A-HEADER',
      'xref-Bishop-Overland-08$0$R-BEAM',
      'xref-Bishop-Overland-08$0$A-FOOTPRINT',
      'xref-Bishop-Overland-08$0$S-SLAB',
      'xref-Bishop-Overland-08$0$TEMP',
      'xref-Bishop-Overland-08$0$A-FIXTURE',
      'View Port',
    ])
    const layerEntityCounts = Object.keys(byLayer).map((layer) => {
      return byLayer[layer].length
    })
    expect(layerEntityCounts).toEqual([
      4, 183, 31, 137, 52, 177, 199, 159, 1, 26, 87, 27, 8, 5, 1, 3, 2, 1,
    ])
  })
})