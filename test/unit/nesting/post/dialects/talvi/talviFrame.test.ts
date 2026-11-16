import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../../src/nesting/post/dialects/contourBlocks'
import { talviEnding } from '../../../../../../src/nesting/post/dialects/talvi/talviEnding'
import { talviExtents } from '../../../../../../src/nesting/post/dialects/talvi/talviExtents'
import { talviHeader } from '../../../../../../src/nesting/post/dialects/talvi/talviHeader'
import { talviPreparation } from '../../../../../../src/nesting/post/dialects/talvi/talviPreparation'
import { mapToMachineFrame } from '../../../../../../src/nesting/post/machine/mapToMachineFrame'
import { referencePlan } from '../../reference-plan'

describe('Talvi header, preparation and ending', () => {
  it('writes the three header comments', () => {
    assert.deepEqual(talviHeader(4, { width: 440, height: 1280 }, 3), ['(TotalContour=4)', '(Size=440.000*1280.000)', '(Tools=1)'])
  })

  it('writes the fixed preparation and ending', () => {
    assert.deepEqual(talviPreparation(), ['G21', 'G90', 'G64 P0.03 Q0.001', '#5399=0.1', 'o<process_start> call', 'M64 P3', 'o<runframework> call', 'o110 repeat[1]'])
    assert.deepEqual(talviEnding(), ['o<process_end> call', 'o110 endrepeat', 'o<endpos> call', 'M65 P3', 'M2'])
    for (const line of [...talviPreparation(), ...talviEnding()]) assert.equal(line, line.trimEnd())
  })

  it('measures the bounding box of the mapped cut points, including arc quadrant points', () => {
    const { contours } = splitContours(referencePlan())
    const map = (p: { x: number; y: number }) => mapToMachineFrame(p, { width: 1500, height: 3000 }, { rotationDegrees: 0, origin: 'bottom-right' })
    assert.deepEqual(talviExtents(contours, map), { width: 440, height: 1280 })
  })
})
