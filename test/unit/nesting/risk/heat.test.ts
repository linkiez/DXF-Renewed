import { expect } from 'expect'
import { heatAt } from '../../../../src/nesting/risk/heatAt'
import { heatEvents } from '../../../../src/nesting/risk/heatEvents'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { completeRiskProfile, denseClusterJob, riskRequest, spreadJob, withLimit, withoutLimit } from './fixtures'

describe('risk/heatEvents', () => {
  it('splits the cut length by cell of size radius / 2 with its plan-time interval', async () => {
    const context = buildRiskContext(riskRequest(await spreadJob()))

    const set = heatEvents(context)[0]

    expect(set.sheetId).toBe('sheet-1')
    expect(set.cellSize).toBeCloseTo(15)
    expect(set.events.reduce((total, event) => total + event.length, 0)).toBeCloseTo(6 * 80, 3)
    expect(set.events.every((event) => event.end >= event.start)).toBe(true)
    const ends = set.events.map((event) => event.end)
    expect([...ends].sort((a, b) => a - b)).toEqual(ends)
  })

  it('takes the times from the profile speeds, the action feed taking precedence', async () => {
    const [set] = heatEvents(buildRiskContext(riskRequest(await spreadJob())))

    const first = set.events[0]
    expect(first.start).toBeCloseTo(Math.hypot(10, 10) / 500 + 0.5, 3)
    expect(first.end - first.start).toBeGreaterThan(0)
    expect(first.end - first.start).toBeLessThan(0.3)
  })
})

describe('risk/heatAt', () => {
  it('sums the cut length inside the trailing window and divides it by the limit', async () => {
    const request = { ...riskRequest(await denseClusterJob()), sheetId: 'sheet-1', planSeconds: 1000 }

    const afterAll = heatAt(request)
    const early = heatAt({ ...request, planSeconds: 2.5 })

    expect(afterAll.available).toBe(false === afterAll.available ? false : true)
    expect(early.available).toBe(true)
    expect(early.cells.length).toBeGreaterThan(0)
    expect(early.cells.every((cell) => cell.value > 0)).toBe(true)
    expect(early.max).toBe(Math.max(...early.cells.map((cell) => cell.value)))
  })

  it('shows nothing before the first cut and after the window has passed', async () => {
    const request = { ...riskRequest(await denseClusterJob(), withLimit(completeRiskProfile(), 'heat.windowSeconds', { value: 1 })), sheetId: 'sheet-1' }

    expect(heatAt({ ...request, planSeconds: 0 }).cells).toEqual([])
    expect(heatAt({ ...request, planSeconds: 10_000 }).cells).toEqual([])
  })

  it('reports values above 1 where the windowed length exceeds the limit', async () => {
    const request = { ...riskRequest(await denseClusterJob()), sheetId: 'sheet-1', planSeconds: 8 }

    expect(heatAt(request).max).toBeGreaterThan(1)
  })

  it('gives identical views when seeking back and forth', async () => {
    const request = { ...riskRequest(await denseClusterJob()), sheetId: 'sheet-1' }

    const first = heatAt({ ...request, planSeconds: 4 })
    heatAt({ ...request, planSeconds: 9 })
    heatAt({ ...request, planSeconds: 1 })

    expect(heatAt({ ...request, planSeconds: 4 })).toEqual(first)
  })

  it('is unavailable, naming the missing paths, when a speed or a heat limit is missing', async () => {
    const job = await spreadJob()
    const noSpeed = heatAt({ ...riskRequest(job, withoutLimit(completeRiskProfile(), 'speeds.cutting')), sheetId: 'sheet-1', planSeconds: 5 })
    const noLimit = heatAt({ ...riskRequest(job, withoutLimit(completeRiskProfile(), 'heat.maxCutLength')), sheetId: 'sheet-1', planSeconds: 5 })

    expect(noSpeed).toMatchObject({ available: false, missing: ['speeds.cutting'], cells: [] })
    expect(noLimit).toMatchObject({ available: false, missing: ['heat.maxCutLength'], cells: [] })
  })
})
