import expect from 'expect'
import fs from 'node:fs'
import { getResourcePath } from './test-helpers.ts'
import { Helper, parseString, toJson } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'empty.dxf'),
  'utf-8',
)
describe('toJson', () => {
  it('serializes parsed DXF to JSON', async () => {
    const parsed = parseString(dxfContents)
    const json = toJson(parsed)
    expect(typeof json).toBe('string')
    const roundTrip = JSON.parse(json)
    expect(roundTrip).toHaveProperty('blocks')
    expect(roundTrip).toHaveProperty('entities')
    expect(roundTrip.blocks.length).toEqual(parsed.blocks.length)
    expect(roundTrip.entities.length).toEqual(parsed.entities.length)
  })
  it('serializes parsed DXF via Helper.toJson()', async () => {
    const helper = new Helper(dxfContents)
    const json = helper.toJson()
    const roundTrip = JSON.parse(json)
    expect(roundTrip.blocks.length).toEqual(78)
    expect(roundTrip.entities.length).toEqual(1)
  })
  it('pretty-prints JSON when enabled', async () => {
    const parsed = parseString(dxfContents)
    const json = toJson(parsed, { pretty: true, space: 2 })
    expect(json.includes('\n')).toBe(true)
    expect(json.includes('  ')).toBe(true)
  })
})