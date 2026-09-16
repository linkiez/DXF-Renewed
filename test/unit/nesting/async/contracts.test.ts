import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { Observable } from 'rxjs'
import { observeFlow } from '../../../../src/nesting/async/observableFlow'
import { nest, nestFromDxf } from '../../../../src/nesting/applyNesting'
import { nestDXF, nestWithPreset, quickNest } from '../../../../src/nest/index'
import { NestingHelper } from '../../../../src/nesting/NestingHelper'
import { nestTrueShape } from '../../../../src/nesting/trueShape/index'
import { prepareParts } from '../../../../src/nesting/pro/partPrep/index'
import {
  toNestedSvg,
  toNestedDxf,
  extractShapes,
  sortShapes,
  packMultiSheet,
  searchBestArrangement,
  analyzeShapes,
} from '../../../../src/nesting/index'

const IN_SCOPE = {
  nest,
  nestFromDxf,
  nestDXF,
  nestWithPreset,
  quickNest,
  nestTrueShape,
  prepareParts,
}

const OUT_OF_SCOPE = {
  toNestedSvg,
  toNestedDxf,
  extractShapes,
  sortShapes,
  packMultiSheet,
  searchBestArrangement,
  analyzeShapes,
}

describe('nesting observable contracts (FR-001, SC-001)', () => {
  it('exposes observeFlow as the adaptation seam', () => {
    assert.equal(typeof observeFlow, 'function')
  })

  it('exposes every in-scope flow as a callable', () => {
    for (const [name, fn] of Object.entries(IN_SCOPE)) {
      assert.equal(typeof fn, 'function', `${name} must be callable`)
    }

    assert.equal(typeof NestingHelper.prototype.nest, 'function')
  })

  it('keeps the out-of-scope helpers synchronous', () => {
    for (const [name, fn] of Object.entries(OUT_OF_SCOPE)) {
      assert.equal(typeof fn, 'function', `${name} must stay callable`)
      assert.ok(!(fn instanceof Observable), `${name} must not be an Observable`)
    }
  })

  it('nest returns a lazy Observable', () => {
    const result = nest({} as never, {})

    assert.ok(result instanceof Observable)
  })
})
