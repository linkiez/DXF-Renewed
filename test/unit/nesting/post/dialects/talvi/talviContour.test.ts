import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../../src/nesting/post/dialects/contourBlocks'
import { emitTalviContour } from '../../../../../../src/nesting/post/dialects/talvi/talviContour'
import { GcodeWriter } from '../../../../../../src/nesting/post/gcode/writer'
import { mapToMachineFrame } from '../../../../../../src/nesting/post/machine/mapToMachineFrame'
import { referencePlan } from '../../reference-plan'

const contours = splitContours(referencePlan()).contours
const context = (isLast: boolean) => ({
  writer: new GcodeWriter({ precision: 4, trailingZeros: true }),
  mapPoint: (p: { x: number; y: number }) => mapToMachineFrame(p, { width: 1500, height: 3000 }, { rotationDegrees: 0, origin: 'bottom-right' }),
  mapping: { key: 'quality', entries: [{ value: 'standard', p: 1, q: 1 }], omitQ: 'never' as const },
  dialect: { arcMinimumSweep: 2, lastDistance: -999, distanceDecimals: 3 },
  isLast,
})

describe('emitTalviContour', () => {
  it('writes the contour block in order with the distance to the next contour', () => {
    const ctx = context(false)
    const issues = emitTalviContour(contours[1], 1, ctx)
    assert.deepEqual(issues, [])
    assert.deepEqual(ctx.writer.toString().trimEnd().split('\n'), [
      'N0002', 'M101 P1 Q1', 'G00 X-1200.0000 Y40.0000', '#<_openslag>=1', 'o<layer_start> call',
      'G01 X-1200.0000 Y50.0000', 'G01 X-1020.0000 Y50.0000', 'G03 X-1000.0000 Y70.0000 I0.0000 J20.0000',
      'G01 X-1000.0000 Y150.0000', 'G01 X-1200.0000 Y150.0000', 'G01 X-1200.0000 Y50.0000',
      '#<_NextOneDis>=50.000', 'o<layer_end> call',
    ])
  })

  it('writes the sentinel for the last contour', () => {
    const ctx = context(true)
    emitTalviContour(contours[3], 3, ctx)
    const lines = ctx.writer.toString().trimEnd().split('\n')
    assert.equal(lines[0], 'N0004')
    assert.equal(lines[lines.length - 2], '#<_NextOneDis>=-999')
  })

  it('writes the draft comment and returns the issue when the selector is unmapped', () => {
    const ctx = { ...context(false), mapping: undefined }
    const issues = emitTalviContour(contours[0], 0, ctx)
    assert.equal(issues[0].code, 'PROCESS_MAPPING_MISSING')
    assert.ok(ctx.writer.toString().includes('(PROCESS_MAPPING_MISSING'))
  })
})
