/**
 * Nesting Helper
 *
 * Extends the base Helper class with nesting capabilities.
 * Provides a convenient API for nesting DXF content.
 */

import Helper from '../Helper'
import { firstValueFrom, type Observable } from 'rxjs'
import type { Entity } from '../types'
import type { NestingOptions, NestingResult, NestableShape } from './types'
import { nest } from './applyNesting'
import { observeFlow } from './async/observableFlow'
import { toNestedSvg } from './toNestedSvg'
import { toNestedDxf } from './toNestedDxf'
import { extractShapes } from './shapeExtractor'

// ─────────────────────────────────────────────
// NestingHelper Class
// ─────────────────────────────────────────────

/**
 * Helper class with integrated nesting support.
 *
 * @example
 * ```typescript
 * const helper = new NestingHelper(dxfString)
 * const result = await firstValueFrom(helper.nest({
 *   stockSheet: { width: 3000, height: 2000 },
 *   algorithm: 'maxrects',
 *   kerf: 2,
 *   margin: 10,
 * }))
 *
 * console.log(`Utilization: ${result.utilization.toFixed(1)}%`)
 * const svg = helper.toNestedSvg()
 * ```
 */
export class NestingHelper extends Helper {
  private _nestingResult: NestingResult | null = null
  private _shapes: NestableShape[] = []
  private _shapeEntityMap = new Map<string, Entity>()

  /** Perform nesting with the given options */
  nest(partialOptions: Partial<NestingOptions> = {}): Observable<NestingResult> {
    return observeFlow(async (signal) => {
      this.clearNestingState()

      const result = await firstValueFrom(
        nest(this.parsed, { ...partialOptions, signal }),
      )

      // Extract shapes for SVG output
      const extraction = extractShapes(this.denormalised, {
        ...partialOptions,
        stockSheet: partialOptions.stockSheet ?? {
          width: 3000,
          height: 2000,
        },
        curveSegments: partialOptions.curveSegments ?? 36,
        allowedRotations: partialOptions.allowedRotations ?? [0, 90, 180, 270],
        kerf: partialOptions.kerf ?? 2,
      })

      this._shapes = extraction.shapes

      // Build shape → entity map
      for (
        let i = 0;
        i < extraction.shapes.length && i < this.denormalised.length;
        i++
      ) {
        this._shapeEntityMap.set(extraction.shapes[i].id, this.denormalised[i])
      }

      this._nestingResult = result
      return result
    }, partialOptions.signal)
  }

  private clearNestingState(): void {
    this._nestingResult = null
    this._shapes = []
    this._shapeEntityMap.clear()
  }

  /** Get the last nesting result */
  get nestingResult(): NestingResult {
    if (!this._nestingResult) {
      throw new Error('No nesting result available. Call nest() first.')
    }
    return this._nestingResult
  }

  /** Generate SVG with nesting visualization */
  toNestedSvg(options?: {
    showSheetOutline?: boolean
    showMetrics?: boolean
    showLayerColors?: boolean
    strokeWidth?: number
    fillColor?: string
  }): string {
    if (!this._nestingResult) {
      throw new Error('No nesting result available. Call nest() first.')
    }
    return toNestedSvg(this._nestingResult, this._shapes, options)
  }

  /** Generate DXF with repositioned entities */
  toNestedDxf(): string {
    if (!this._nestingResult) {
      throw new Error('No nesting result available. Call nest() first.')
    }
    return toNestedDxf(this.parsed, this._nestingResult, this._shapeEntityMap)
  }

  /** Get extracted shapes */
  get shapes(): NestableShape[] {
    return this._shapes
  }
}
