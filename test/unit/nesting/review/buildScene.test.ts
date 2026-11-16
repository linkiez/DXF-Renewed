import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import type { CutPlanResult } from '../../../../src/nesting'
import {
  compoundFixture, deepFreeze, layoutOnlyFixture, partialFixture, rejectedFixture,
  smallFixture, sparsePlacementFixture,
} from './fixtures'

describe('review/buildScene — complete artifact', () => {
  it('presents every sheet, placement and action with ready status', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    expect(scene.status).toBe('ready')
    expect(scene.sheets.map((s) => s.id)).toEqual(['sheet-1', 'sheet-2'])
    expect(scene.sheets.map((s) => s.parts.length)).toEqual([2, 2])
    expect(scene.sheets[0].parts.map((p) => p.key)).toEqual(['part-1#0', 'part-2#0'])
    expect(scene.sheets.every((s) => s.parts.every((p) => p.status === 'placed'))).toBe(true)
    expect(scene.sheets[0].timeline?.actions.length).toBeGreaterThan(0)
    expect(scene.capabilities).toEqual({ playback: true, actionInspection: true })
    expect(scene.notices).toEqual([])
  })

  it('links every contour-bound action to its part (traceability)', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const actions = scene.sheets[0].timeline?.actions ?? []
    const linked = actions.filter((a) => a.contourId)

    expect(linked.length).toBeGreaterThan(0)
    expect(linked.every((a) => a.partKey !== undefined)).toBe(true)
  })

  it('reports identity, status, contract version, correlation and both digests', async () => {
    const { input, artifact } = await smallFixture()
    const scene = buildReviewScene(input)

    expect(scene.identity).toEqual({
      status: artifact.status,
      contractVersion: artifact.contractVersion,
      correlation: artifact.correlation,
      inputDigest: artifact.inputDigest,
      outputDigest: artifact.outputDigest,
    })
  })

  it('takes the summary from supplied values instead of recomputing them', async () => {
    const { input, artifact, cutPlan } = await smallFixture()
    const scene = buildReviewScene(input)
    const plans = cutPlan.plans ?? []

    expect(scene.summary.sheetCount).toBe(2)
    expect(scene.summary.partCount).toBe(4)
    expect(scene.summary.yield).toBe(artifact.layout?.utilization)
    expect(scene.summary.totalCutLength).toBeCloseTo(plans.reduce((n, p) => n + p.stats.cutLength, 0))
    expect(scene.summary.pierceCount).toBe(plans.reduce((n, p) => n + p.stats.pierceCount, 0))
  })

  it('fills part source details only from shapes available through the layout', async () => {
    const { input } = await smallFixture()
    const withLayout = buildReviewScene(input).sheets[0].parts[0]
    const without = buildReviewScene({ artifact: input.artifact }).sheets[0].parts[0]

    expect(withLayout.source.layer).toBe('CUT')
    expect(withLayout.source.area).toBe(400)
    expect(without.source).toEqual({})
  })
})

describe('review/buildScene — partial and unavailable states', () => {
  it('lists unplaced, warnings and rejections with reasons and draws none as placements', async () => {
    const { input } = await partialFixture()
    const scene = buildReviewScene(input)
    const codes = scene.notices.map((n) => n.code)

    expect(scene.status).toBe('partial')
    expect(codes).toEqual(expect.arrayContaining(['LOW_YIELD', 'NO_STOCK', 'UNPLACED']))
    const unplaced = scene.notices.find((n) => n.code === 'UNPLACED')
    expect(unplaced?.message).toContain('part-9')
    expect(unplaced?.message).toContain('Não cabe em nenhuma chapa')
    expect(scene.notices.find((n) => n.code === 'NO_STOCK')).toMatchObject({ severity: 'error', origin: 'artifact' })
    expect(scene.sheets.flatMap((s) => s.parts).some((p) => p.shapeId === 'part-9')).toBe(false)
    expect(scene.summary.unplacedCount).toBe(1)
  })

  it('shows rejection reasons for a rejected artifact without layout', async () => {
    const scene = buildReviewScene(await rejectedFixture())

    expect(scene.status).toBe('unavailable')
    expect(scene.sheets).toEqual([])
    expect(scene.capabilities).toEqual({ playback: false, actionInspection: false })
    expect(scene.notices.map((n) => n.code)).toEqual(expect.arrayContaining(['NO_STOCK', 'NO_LAYOUT']))
    expect(scene.identity?.status).toBe('rejected')
  })

  it('keeps static review and explains the missing cut plan', async () => {
    const { input } = await layoutOnlyFixture()
    const scene = buildReviewScene(input)

    expect(scene.status).toBe('ready')
    expect(scene.sheets[0].parts).toHaveLength(2)
    expect(scene.sheets[0].timeline).toBeUndefined()
    expect(scene.capabilities).toEqual({ playback: false, actionInspection: false })
    expect(scene.notices.map((n) => n.code)).toContain('NO_CUT_PLAN')
  })

  it('does not render an unsupported contract version as valid', async () => {
    const { artifact } = await smallFixture()
    const scene = buildReviewScene({ artifact: { ...artifact, contractVersion: 2 } })

    expect(scene.status).toBe('unavailable')
    expect(scene.sheets).toEqual([])
    expect(scene.notices.map((n) => n.code)).toEqual(['UNSUPPORTED_CONTRACT_VERSION'])
    expect(scene.notices[0].severity).toBe('error')
  })

  it('does not render a schema-invalid artifact as valid', async () => {
    const { artifact } = await smallFixture()
    const broken = { ...artifact, outputDigest: { algorithm: 'sha256', value: 'xyz' } }
    const scene = buildReviewScene({ artifact: broken as typeof artifact })

    expect(scene.status).toBe('unavailable')
    expect(scene.identity).toBeNull()
    expect(scene.notices[0].code).toBe('INVALID_ARTIFACT')
  })

  it('shows the boundary and an explicit empty state for a sheet without placements', async () => {
    const { artifact } = await smallFixture()
    const empty = {
      ...artifact,
      layout: artifact.layout && { ...artifact.layout, placements: [] },
    }
    const scene = buildReviewScene({ artifact: empty })

    expect(scene.sheets).toHaveLength(2)
    expect(scene.notices.filter((n) => n.code === 'EMPTY_SHEET')).toHaveLength(2)
    expect(scene.notices[0].message).toContain('sheet-1')
  })
})

describe('review/buildScene — cut plan edge cases', () => {
  it('keeps a zero-length cut action in order and flags it', async () => {
    const { input, cutPlan } = await smallFixture()
    const plan = cutPlan.plans?.[0]
    if (!plan) throw new Error('fixture without plan')
    const degenerate: CutPlanResult = {
      ...cutPlan,
      plans: [{
        ...plan,
        actions: [...plan.actions.slice(0, 2), { kind: 'cut', points: [{ x: 1, y: 1 }, { x: 1, y: 1 }], contourId: 'part-1-outer', partId: 'part-1' }, ...plan.actions.slice(2)],
      }, ...(cutPlan.plans?.slice(1) ?? [])],
      plan: undefined,
    }
    const scene = buildReviewScene({ ...input, cutPlan: degenerate })
    const actions = scene.sheets[0].timeline?.actions ?? []

    expect(actions[2].length).toBe(0)
    expect(actions[2].notices.map((n) => n.code)).toEqual(['DEGENERATE_ACTION'])
    expect(scene.notices.map((n) => n.code)).toContain('DEGENERATE_ACTION')
  })

  it('flags actions that refer to a part the artifact does not contain', async () => {
    const { input, cutPlan } = await smallFixture()
    const plan = cutPlan.plans?.[0]
    if (!plan) throw new Error('fixture without plan')
    const ghost: CutPlanResult = {
      ...cutPlan,
      plans: [{ ...plan, actions: [{ kind: 'cut', points: [{ x: 0, y: 0 }, { x: 2, y: 0 }], partId: 'ghost' }, ...plan.actions] }],
      plan: undefined,
    }
    const scene = buildReviewScene({ artifact: input.artifact, cutPlan: ghost })
    const first = scene.sheets[0].timeline?.actions[0]

    expect(first?.partKey).toBeUndefined()
    expect(scene.notices.filter((n) => n.code === 'UNKNOWN_PART')).toHaveLength(1)
  })

  it('reports a plan for a sheet the artifact does not contain', async () => {
    const { input, cutPlan } = await smallFixture()
    const plan = cutPlan.plans?.[0]
    if (!plan) throw new Error('fixture without plan')
    const foreign: CutPlanResult = { ...cutPlan, plans: [{ ...plan, sheetId: 'sheet-9' }], plan: undefined }
    const scene = buildReviewScene({ ...input, cutPlan: foreign })

    expect(scene.notices.map((n) => n.code)).toContain('PLAN_SHEET_MISSING')
  })

  it('attaches planning problems to the part and action and flags the part', async () => {
    const { input, cutPlan } = await smallFixture()
    const problem = {
      code: 'LEAD_CROSSES_GEOMETRY' as const,
      severity: 'error' as const,
      message: 'Lead cruza a geometria',
      sheetId: 'sheet-1',
      partId: 'part-1',
      contourId: 'part-1-outer',
      actionIndex: 3,
    }
    const scene = buildReviewScene({ ...input, cutPlan: { ...cutPlan, valid: false, problems: [problem] } })
    const part = scene.sheets[0].parts.find((p) => p.key === 'part-1#0')
    const action = scene.sheets[0].timeline?.actions[3]

    expect(part?.status).toBe('flagged')
    expect(part?.notices[0]).toMatchObject({ code: 'LEAD_CROSSES_GEOMETRY', origin: 'planning', message: 'Lead cruza a geometria' })
    expect(action?.notices[0].code).toBe('LEAD_CROSSES_GEOMETRY')
    expect(scene.status).toBe('partial')
  })
})

describe('review/buildScene — placement resolution', () => {
  it('uses the only sheet when a placement has no sheetId, with deterministic instances', async () => {
    const scene = buildReviewScene(await sparsePlacementFixture(1))

    expect(scene.sheets[0].parts.map((p) => p.key)).toEqual(['part-1#0', 'part-2#0'])
  })

  it('does not draw a placement whose sheet cannot be determined and says so', async () => {
    const scene = buildReviewScene(await sparsePlacementFixture(2))
    const unresolved = scene.notices.filter((n) => n.code === 'PLACEMENT_SHEET_UNRESOLVED')

    expect(unresolved).toHaveLength(4)
    expect(unresolved[0].message).toContain('part-1#0')
    expect(scene.sheets.flatMap((s) => s.parts)).toHaveLength(0)
  })

  it('draws the bounding box and raises an info notice when no outline exists', async () => {
    const scene = buildReviewScene(await sparsePlacementFixture(1))
    const part = scene.sheets[0].parts[0]

    expect(part.outlines).toHaveLength(1)
    expect(part.outlines[0]).toHaveLength(5)
    expect(scene.notices.filter((n) => n.code === 'PLACEMENT_GEOMETRY_APPROXIMATE')).toHaveLength(2)
    expect(scene.notices.find((n) => n.code === 'PLACEMENT_GEOMETRY_APPROXIMATE')?.severity).toBe('info')
  })

  it('turns a compound placement into one part with outer and hole outlines', async () => {
    const scene = buildReviewScene(await compoundFixture())
    const parts = scene.sheets[0].parts

    expect(parts).toHaveLength(1)
    expect(parts[0].key).toBe('compound-1#0')
    expect(parts[0].outlines).toHaveLength(2)
  })
})

describe('review/buildScene — read-only guarantees', () => {
  it('does not mutate deeply frozen inputs and is deterministic', async () => {
    const { input } = await smallFixture()
    const before = structuredClone(input)
    const frozen = deepFreeze(structuredClone(input))
    const first = buildReviewScene(frozen)
    const second = buildReviewScene(frozen)

    expect(second).toEqual(first)
    expect(frozen).toEqual(before)
  })

  it('uses Brazilian Portuguese for notices raised by the review itself', async () => {
    const { input } = await layoutOnlyFixture()
    const notice = buildReviewScene(input).notices.find((n) => n.code === 'NO_CUT_PLAN')

    expect(notice?.origin).toBe('review')
    expect(notice?.message).toContain('plano de corte')
  })
})
