import { expect } from 'expect'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { freedMoments } from '../../../../src/nesting/risk/freedMoments'
import { completeRiskProfile, headStrikeJob, riskRequest, safeJob, smallPartFreedJob, tabHeldJob, withoutLimit } from './fixtures'

describe('risk/freedMoments', () => {
  it('frees a part at the last cut action of its outer contour with its plan time', async () => {
    const moments = freedMoments(buildRiskContext(riskRequest(await smallPartFreedJob())))

    const small = moments.find((m) => m.partKey === 'small#0')
    expect(small).toMatchObject({ sheetId: 'sheet-1', actionIndex: 2, held: false, loose: true })
    expect(small?.planSeconds).toBeCloseTo(Math.hypot(100, 100) / 500 + 0.5 + 32 / 100, 3)
    expect(small?.area).toBeCloseTo(64)
  })

  it('keeps a part held when a tab stays on its contour', async () => {
    const moments = freedMoments(buildRiskContext(riskRequest(await tabHeldJob())))

    expect(moments.find((m) => m.partKey === 'small#0')).toMatchObject({ held: true })
  })

  it('marks a part loose only when its area is at or below the limit', async () => {
    const moments = freedMoments(buildRiskContext(riskRequest(await safeJob())))

    expect(moments.every((m) => !m.loose)).toBe(true)
    expect(moments).toHaveLength(4)
  })

  it('agrees with the review and the cost on which part owns an action', async () => {
    const moments = freedMoments(buildRiskContext(riskRequest(await headStrikeJob())))

    expect(moments.map((m) => m.partKey)).toEqual(['small#0', 'big-1#0', 'big-2#0'])
  })

  it('orders the moments by action index then part key and has no time without speeds', async () => {
    const job = await headStrikeJob()
    const moments = freedMoments(buildRiskContext(riskRequest(job, withoutLimit(completeRiskProfile(), 'speeds'))))

    expect(moments.map((m) => m.actionIndex)).toEqual([2, 5, 8])
    expect(moments.every((m) => m.planSeconds === null)).toBe(true)
  })
})
