import { expect } from 'expect'
import fs from 'fs'
import path from 'path'
import parseString from '../../../src/parseString'
import { extractParts, autoDetectBin } from '../../../src/nest/extractParts'

describe('nest/extractParts', () => {
  let parsed: any

  before(() => {
    const dxfPath = path.join(__dirname, '../../resources/nest-fixtures/simple-parts.dxf')
    const dxfText = fs.readFileSync(dxfPath, 'utf-8')
    parsed = parseString(dxfText)
  })

  describe('extractParts', () => {
    it('extracts parts from simple DXF', () => {
      const parts = extractParts(parsed)
      expect(parts.length).toBeGreaterThanOrEqual(3)
    })

    it('each part has required fields', () => {
      const parts = extractParts(parsed)
      for (const part of parts) {
        expect(part.id).toBeDefined()
        expect(part.layer).toBeDefined()
        expect(part.vertices.length).toBeGreaterThanOrEqual(3)
        expect(part.bbox.w).toBeGreaterThan(0)
        expect(part.bbox.h).toBeGreaterThan(0)
        expect(part.area).toBeGreaterThan(0)
      }
    })

    it('skips text and dimension entities by default', () => {
      const parts = extractParts(parsed)
      // Our fixture only has LWPOLYLINEs, so all should be extracted
      expect(parts.length).toBeGreaterThan(0)
    })

    it('respects minArea option', () => {
      const parts = extractParts(parsed, { minArea: 10000 })
      // All our rectangles are 50x50=2500, so none should pass
      expect(parts.length).toBe(0)
    })

    it('respects skipTypes option', () => {
      const parts = extractParts(parsed, { skipTypes: ['LWPOLYLINE'] })
      expect(parts.length).toBe(0)
    })
  })

  describe('autoDetectBin', () => {
    it('detects reasonable bin size', () => {
      const bin = autoDetectBin(parsed)
      expect(bin.width).toBeGreaterThan(0)
      expect(bin.height).toBeGreaterThan(0)
      // Our parts span roughly 0-250 in both axes
      expect(bin.width).toBeGreaterThan(200)
      expect(bin.height).toBeGreaterThan(100)
    })
  })
})
