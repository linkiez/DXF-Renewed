import { getResourcePath } from './test-helpers.ts'
import fs from 'node:fs'
import expect from 'expect'
import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'testOle2Frame.dxf'),
  'utf-8',
)
describe('OLE2FRAME', () => {
  let entities
  let ent
  let dataInit
  before(() => {
    entities = parseString(dxfContents).entities
    ent = entities[0]
    dataInit = ent.data
  })
  it('parses exactly one entity', async () => {
    expect(entities.length).toEqual(1)
  })
  it('sets the entity type', async () => {
    expect(ent.type).toEqual('OLE2FRAME')
  })
  it('extracts the data bytes', async () => {
    expect(dataInit).toEqual('DEADBEEFCAFEBABE')
  })
  it('assigns a handle', async () => {
    expect(ent.handle).toBeDefined()
  })
  it('reads the layer', async () => {
    expect(ent.layer).toEqual('0')
  })
  it('reads the version', async () => {
    expect(ent.version).toEqual(2)
  })
  it('reads the name', async () => {
    expect(ent.name).toEqual('Paintbrush Picture')
  })
  it('reads upperLeftX', async () => {
    expect(ent.upperLeftX).toEqual(0)
  })
  it('reads upperLeftY', async () => {
    expect(ent.upperLeftY).toEqual(0)
  })
  it('reads upperLeftZ', async () => {
    expect(ent.upperLeftZ).toEqual(0)
  })
  it('reads lowerRightX', async () => {
    expect(ent.lowerRightX).toEqual(10)
  })
  it('reads lowerRightY', async () => {
    expect(ent.lowerRightY).toEqual(-5)
  })
  it('reads lowerRightZ', async () => {
    expect(ent.lowerRightZ).toEqual(0)
  })
  it('reads objectType', async () => {
    expect(ent.objectType).toEqual(3)
  })
  it('reads tile', async () => {
    expect(ent.tile).toEqual(0)
  })
  it('reads length', async () => {
    expect(ent.length).toEqual(8)
  })
})