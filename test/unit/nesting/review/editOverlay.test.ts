import { expect } from 'expect'
import { ghostOverlay } from '../../../../src/nesting/review/overlay'
import type { PlacementVerdict } from '../../../../src/nesting/edit/types'

const outline = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 }]
const valid: PlacementVerdict = { valid: true, violations: [], approximate: false, group: [] }
const invalid: PlacementVerdict = {
  valid: false,
  approximate: false,
  group: [],
  violations: [
    { code: 'OVERLAP', message: 'A peça a#0 se sobrepõe à peça b#0.', partKey: 'a#0', otherPartKey: 'b#0' },
    { code: 'OUTSIDE_USABLE_AREA', message: 'A peça a#0 sai da área útil da chapa ou invade a margem de borda.', partKey: 'a#0' },
  ],
}

describe('review/overlay — ghost', () => {
  it('carries the candidate outline, its validity and an anchor at the center of the outline', () => {
    const overlay = ghostOverlay(outline, valid)

    expect(overlay.ghost).toEqual({ outline, valid: true, anchor: { x: 10, y: 5 }, marks: [] })
  })

  it('yields one mark per violation with a text label, never colour alone', () => {
    const overlay = ghostOverlay(outline, invalid)

    expect(overlay.ghost?.valid).toBe(false)
    expect(overlay.ghost?.marks).toEqual([
      { code: 'OVERLAP', label: 'A peça a#0 se sobrepõe à peça b#0.' },
      { code: 'OUTSIDE_USABLE_AREA', label: 'A peça a#0 sai da área útil da chapa ou invade a margem de borda.' },
    ])
  })

  it('is pure: identical input gives identical output', () => {
    expect(ghostOverlay(outline, invalid)).toEqual(ghostOverlay(outline, invalid))
  })
})
