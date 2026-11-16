import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../../src/nesting/post/dialects/contourBlocks'
import { emitHyperthermContour } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermContour'
import { GcodeWriter } from '../../../../../../src/nesting/post/gcode/writer'
import { referencePlan } from '../../reference-plan'

const identity = (p: { x: number; y: number }) => p
const dialect = { highDefinitionKey: 'highDefinition' }
const KERF = { kerf: 1.81 }
const run = (index: number, settings: Record<string, boolean | number | string>, plan = referencePlan({ metadata: { kerfSide: 'left' } })) => {
  const writer = new GcodeWriter({ precision: 3 })
  const issues = emitHyperthermContour(splitContours(plan).contours[index], { writer, mapPoint: identity, settings, dialect })
  return { lines: writer.toString().trimEnd().split('\n'), issues }
}

describe('emitHyperthermContour', () => {
  it('writes the kerf command immediately before M07 and closes the cut with M08 and G40', () => {
    const { lines } = run(2, KERF)
    assert.deepEqual(lines, ['G00 X300 Y100', 'G43 X1.81', 'G41', 'M07', 'G01 X320 Y100', 'G01 X320 Y120', 'G01 X300 Y120', 'G01 X300 Y100', 'M08', 'G40'])
  })

  it('uses G42 for the right kerf side and arcs with incremental centers', () => {
    const { lines } = run(0, KERF, referencePlan({ metadata: { kerfSide: 'right' } }))
    assert.equal(lines[2], 'G42')
    assert.ok(lines.includes('G03 X140 Y100 I-40 J0'))
  })

  it('freezes the height control on the lead-in when m50n is set', () => {
    const { lines } = run(1, { ...KERF, m50n: true })
    assert.deepEqual(lines.slice(1, 8), ['G43 X1.81', 'G41', 'M07', 'M50N', 'G01 X300 Y50', 'M51', 'G01 X480 Y50'])
  })

  it('writes the feed word once per change in each contour, with the lead-in feed first', () => {
    const { lines } = run(1, { ...KERF, feed: 4035, leadInFeed: 2000 })
    assert.deepEqual(lines.slice(3, 9), ['M07', 'F2000', 'G01 X300 Y50', 'F4035', 'G01 X480 Y50', 'G03 X500 Y70 I0 J20'])
    assert.equal(run(2, { ...KERF, feed: 4035 }).lines.filter((l) => l.startsWith('F')).length, 1)
    assert.equal(run(2, { ...KERF }).lines.filter((l) => l.startsWith('F')).length, 0)
  })

  it('uses the high-definition forms for the contour flagged by highDefinitionKey or the hs and rt settings', () => {
    const plan = referencePlan({ metadata: { kerfSide: 'left' }, perContour: { 'c-hole': { highDefinition: true } } })
    assert.ok(run(0, KERF, plan).lines.includes('M07 HS'))
    assert.ok(run(1, KERF, plan).lines.includes('M07'))
    assert.ok(run(1, { ...KERF, hs: true }, plan).lines.includes('M07 HS'))
    assert.ok(run(1, { ...KERF, rt: true }, plan).lines.includes('M08 RT'))
  })

  it('never writes the legacy M15 and M16 and always pairs M07 with M08', () => {
    const text = run(1, { ...KERF, m50n: true, rt: true, hs: true, feed: 4035 }).lines.join('\n')
    assert.ok(!/M1[56]/.test(text))
    assert.equal(text.match(/M07/g)?.length, text.match(/M08/g)?.length)
  })

  it('requires an explicit kerf side', () => {
    const { issues } = run(2, KERF, referencePlan())
    assert.equal(issues[0].code, 'PROCESS_SETTING_REQUIRED')
    assert.ok(issues[0].message.includes('kerfSide'))
    const none = run(2, KERF, referencePlan({ metadata: { kerfSide: 'none' } }))
    assert.deepEqual(none.issues, [])
    assert.ok(!none.lines.some((l) => l.startsWith('G41') || l.startsWith('G42') || l.startsWith('G43')))
  })
})
