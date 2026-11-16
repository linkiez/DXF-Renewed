import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../../src/nesting/post/dialects/contourBlocks'
import { emitGlorystarContour } from '../../../../../../src/nesting/post/dialects/glorystar/glorystarContour'
import { mapToMachineFrame } from '../../../../../../src/nesting/post/machine/mapToMachineFrame'
import { formatNumber } from '../../../../../../src/nesting/post/gcode/formatNumber'
import { GcodeWriter } from '../../../../../../src/nesting/post/gcode/writer'
import { referencePlan } from '../../reference-plan'

const dialect = {
  arcMinimumSweep: 2, heightOffCode: 'M82', heightOnCode: 'M83', smallContourClass: 'small', regulatorOffQuality: 3,
  thickMaterialGroups: ['GRPALMG', 'GRPINOX'], thickMinThickness: 6,
}
const settings = { feed: 3000, piercingType: 1, thickness: 6 }
const frame = { rotationDegrees: 90 as const, origin: 'bottom-left' as const }
const run = (plan = referencePlan({ quality: '1' }), index = 0, extra: Partial<Parameters<typeof emitGlorystarContour>[2]> = {}) => {
  const writer = new GcodeWriter()
  const issues = emitGlorystarContour(splitContours(plan).contours[index], index, {
    writer,
    mapPoint: (p) => mapToMachineFrame(p, { width: 1500, height: 3000 }, frame),
    format: (n) => formatNumber(n, 3),
    settings,
    dialect,
    headUp: true,
    ...extra,
  })
  return { lines: writer.toString().trimEnd().split('\n'), issues }
}

describe('emitGlorystarContour', () => {
  it('writes the offset selection, the head-up rapid and the cut start of the first contour', () => {
    const { lines } = run()
    assert.deepEqual(lines.slice(0, 9), [
      'N1', 'G650,T3,W1', 'G806,T3,N1,H1,D1', 'G153,Z(trav_safe_z_start)', 'G180,X2900,Y100,Z(workpiece_safe_dist)',
      'G153,G0,X(kine_x),Y(kine_y)', 'G153,G0,Z(kine_z)', ';==============================CORTE==============================',
      'G800,K1,D1,X2900,Y100,Z0,F3000,T1,P1,R1,U0,V0,W1',
    ])
  })

  it('writes the lead-in frozen, the profile start and a full circle as four quadrant arcs with absolute centers', () => {
    const { lines } = run()
    assert.deepEqual(lines.slice(9), [
      'M82', 'G1,X2900,Y140', 'G832', 'M83',
      'G3,X2860,Y100,I2900,J100', 'G3,X2900,Y60,I2900,J100', 'G3,X2940,Y100,I2900,J100', 'G3,X2900,Y140,I2900,J100',
    ])
  })

  it('skips the rapid after a head-down or jump flame-off and the safe retraction after the first contour', () => {
    const { lines } = run(referencePlan({ quality: '1' }), 1, { headUp: false })
    assert.deepEqual(lines.slice(0, 4), ['N2', 'G650,T3,W1', 'G806,T3,N1,H1,D1', ';==============================CORTE=============================='])
    assert.equal(lines[4], 'G800,K1,D1,X2960,Y300,Z0,F3000,T1,P1,R1,U0,V0,W1')
  })

  it('keeps the sensor off for the small contour class and writes no lead-in transition', () => {
    const { lines } = run(referencePlan({ quality: '1' }), 2, { headUp: false })
    assert.equal(lines.filter((l) => l === 'M82').length, 1)
    assert.ok(!lines.includes('M83'))
    assert.ok(!lines.includes('G832'))
  })

  it('writes no sensor word for the quality that disables the regulator', () => {
    const { lines } = run(referencePlan({ quality: '3' }))
    assert.ok(lines.includes('G650,T3,W3'))
    assert.ok(lines.some((l) => l.includes(',R0,')))
    assert.ok(!lines.includes('M82') && !lines.includes('M83'))
  })

  it('writes G834 and the W6 offset for thick aluminium and stainless steel after the lead-in', () => {
    const plan = referencePlan({ quality: '1', metadata: { materialGroup: 'GRPINOX' } })
    const { lines } = run(plan, 0)
    assert.equal(lines[1], 'G650,T3,W6')
    const at = lines.indexOf('G832')
    assert.equal(lines[at + 1], 'G834 W1')
    const thin = run(plan, 0, { settings: { ...settings, thickness: 5 } }).lines
    assert.ok(!thin.includes('G834 W1'))
  })

  it('writes an arc of 2 degrees or less as a line and requires the quality', () => {
    const noQuality = run(referencePlan({ quality: '' }))
    assert.equal(noQuality.issues[0].code, 'PROCESS_SETTING_REQUIRED')
    assert.ok(noQuality.issues[0].message.includes('quality'))
  })
})
