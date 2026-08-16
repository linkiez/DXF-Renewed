/**
 * Nesting Module — Config Tests
 *
 * Tests for configuration defaults and validation.
 */

import { expect } from 'expect'
import {
  DEFAULT_NESTING_OPTIONS,
  DEFAULT_STOCK_SHEET,
  validateNestingOptions,
  parseSheetSize,
  parseRotations,
  DEFAULT_KERF,
  DEFAULT_MARGIN,
  DEFAULT_ALGORITHM,
  DEFAULT_ALLOWED_ROTATIONS,
} from '../../../src/nesting/config'

describe('nesting/config', () => {
  describe('defaults', () => {
    it('should have valid default stock sheet', () => {
      expect(DEFAULT_STOCK_SHEET.width).toBeGreaterThan(0)
      expect(DEFAULT_STOCK_SHEET.height).toBeGreaterThan(0)
    })

    it('should have valid default options', () => {
      expect(DEFAULT_NESTING_OPTIONS.algorithm).toBe(DEFAULT_ALGORITHM)
      expect(DEFAULT_NESTING_OPTIONS.kerf).toBe(DEFAULT_KERF)
      expect(DEFAULT_NESTING_OPTIONS.margin).toBe(DEFAULT_MARGIN)
      expect(DEFAULT_NESTING_OPTIONS.allowedRotations).toEqual(DEFAULT_ALLOWED_ROTATIONS)
    })
  })

  describe('validateNestingOptions', () => {
    it('should return defaults when given empty object', () => {
      const opts = validateNestingOptions({})
      expect(opts.algorithm).toBe(DEFAULT_ALGORITHM)
      expect(opts.kerf).toBe(DEFAULT_KERF)
    })

    it('should merge partial options with defaults', () => {
      const opts = validateNestingOptions({ kerf: 5, margin: 20 })
      expect(opts.kerf).toBe(5)
      expect(opts.margin).toBe(20)
      expect(opts.algorithm).toBe(DEFAULT_ALGORITHM) // unchanged
    })

    it('should normalize single stockSheet to array', () => {
      const opts = validateNestingOptions({
        stockSheet: { width: 1000, height: 500 },
      })
      expect(Array.isArray(opts.stockSheet)).toBe(true)
      expect(opts.stockSheet.length).toBe(1)
    })

    it('should keep stockSheet array as-is', () => {
      const sheets = [
        { width: 3000, height: 2000 },
        { width: 1500, height: 1000 },
      ]
      const opts = validateNestingOptions({ stockSheet: sheets })
      expect(opts.stockSheet.length).toBe(2)
    })

    it('should throw on negative sheet dimensions', () => {
      expect(() =>
        validateNestingOptions({ stockSheet: { width: -100, height: 500 } })
      ).toThrow()
    })

    it('should throw on negative kerf', () => {
      expect(() => validateNestingOptions({ kerf: -1 })).toThrow()
    })

    it('should throw on negative margin', () => {
      expect(() => validateNestingOptions({ margin: -5 })).toThrow()
    })

    it('should throw on unknown algorithm', () => {
      // @ts-expect-error testing invalid input
      expect(() => validateNestingOptions({ algorithm: 'unknown' })).toThrow()
    })

    it('should throw on unknown sort strategy', () => {
      // @ts-expect-error testing invalid input
      expect(() => validateNestingOptions({ sortBy: 'random' })).toThrow()
    })

    it('should reset empty rotations to defaults', () => {
      const opts = validateNestingOptions({ allowedRotations: [] })
      expect(opts.allowedRotations).toEqual(DEFAULT_ALLOWED_ROTATIONS)
    })
  })

  describe('parseSheetSize', () => {
    it('should parse "WxH" format', () => {
      const sheet = parseSheetSize('3000x2000')
      expect(sheet.width).toBe(3000)
      expect(sheet.height).toBe(2000)
    })

    it('should parse with uppercase X', () => {
      const sheet = parseSheetSize('1500X1000')
      expect(sheet.width).toBe(1500)
      expect(sheet.height).toBe(1000)
    })

    it('should parse with spaces', () => {
      const sheet = parseSheetSize('3000 x 2000')
      expect(sheet.width).toBe(3000)
      expect(sheet.height).toBe(2000)
    })

    it('should parse decimal values', () => {
      const sheet = parseSheetSize('1500.5x750.25')
      expect(sheet.width).toBe(1500.5)
      expect(sheet.height).toBe(750.25)
    })

    it('should throw on invalid format', () => {
      expect(() => parseSheetSize('abc')).toThrow()
      expect(() => parseSheetSize('3000')).toThrow()
      expect(() => parseSheetSize('x3000x2000')).toThrow()
    })
  })

  describe('parseRotations', () => {
    it('should parse comma-separated angles', () => {
      const rotations = parseRotations('0,90,180,270')
      expect(rotations).toEqual([0, 90, 180, 270])
    })

    it('should handle spaces', () => {
      const rotations = parseRotations('0, 90, 180, 270')
      expect(rotations).toEqual([0, 90, 180, 270])
    })

    it('should handle decimal angles', () => {
      const rotations = parseRotations('0, 45.5, 90')
      expect(rotations).toEqual([0, 45.5, 90])
    })

    it('should throw on invalid angle', () => {
      expect(() => parseRotations('0, abc, 90')).toThrow()
    })

    it('should handle single angle', () => {
      const rotations = parseRotations('0')
      expect(rotations).toEqual([0])
    })
  })
})
