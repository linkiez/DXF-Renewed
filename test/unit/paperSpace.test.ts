import { getResourcePath } from './test-helpers.ts'
import fs from 'fs'
import expect from 'expect'
import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'testModelPaperSpace.dxf'),
  'utf-8',
)
describe('PAPERSPACE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    const circle = entities.find((e) => e.type === 'CIRCLE')
    expect(circle.paperSpace).toEqual(1)
  })
})