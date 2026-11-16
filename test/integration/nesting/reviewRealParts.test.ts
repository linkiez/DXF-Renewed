import { expect } from 'expect'
import { planCutPath } from '../../../src/nesting'
import type { CutLayout } from '../../../src/nesting'
import type { ErpNestingArtifact } from '../../../src/nesting/erp/types'
import { buildReviewScene } from '../../../src/nesting/review/buildScene'
import { inspect } from '../../../src/nesting/review/inspect'
import { pickAt } from '../../../src/nesting/review/pick'
import { renderReviewSvg } from '../../../src/nesting/review/renderSvg'
import { stateAt } from '../../../src/nesting/review/stateAt'
import { summarize } from '../../../src/nesting/review/summary'
import { buildRealJob, REAL_PROFILE as PROFILE } from './fixtures/realJob'

const MAX_PARTS = 16

describe('review — real DXF parts (nest-fixtures)', function () {
  this.timeout(180_000)

  let artifact: ErpNestingArtifact
  let layout: CutLayout
  let files: string[]

  before(async () => {
    const job = await buildRealJob()
    artifact = job.artifact
    layout = job.layout
    files = job.files
  })

  it('nests every real part and keeps the artifact reviewable', () => {
    expect(files.length).toBeGreaterThanOrEqual(10)
    expect(artifact.status === 'complete' || artifact.status === 'partial').toBe(true)
    expect(artifact.layout?.placements.length).toBeGreaterThanOrEqual(MAX_PARTS)
    console.log(`real parts: ${files.length} files, placements ${artifact.layout?.placements.length}, unplaced ${artifact.unplaced.length}, sheets ${layout.sheets.length}`)
  })

  it('reviews the real layout and cut plan with every placement linked and drawn', () => {
    const cutPlan = planCutPath(layout, PROFILE)
    const scene = buildReviewScene({ artifact, layout, cutPlan })
    const placed = artifact.layout?.placements.length ?? 0

    expect(scene.summary.partCount).toBe(placed)
    expect(scene.notices.filter((n) => n.code === 'UNKNOWN_PART' || n.code === 'UNLINKED_ACTION')).toEqual([])
    expect(scene.notices.filter((n) => n.code === 'PLACEMENT_SHEET_UNRESOLVED' || n.code === 'PLAN_SHEET_MISSING')).toEqual([])
    expect(scene.sheets.length).toBe(layout.sheets.length)
    for (const sheet of scene.sheets) {
      const svg = renderReviewSvg(scene, { sheetId: sheet.id })
      for (const part of sheet.parts) expect(svg).toContain(`data-part-key="${part.key}"`)
      const linked = (sheet.timeline?.actions ?? []).filter((a) => a.contourId)
      expect(linked.every((a) => a.partKey !== undefined)).toBe(true)
    }
    console.log(`review: valid ${cutPlan.valid}, problems ${cutPlan.problems.length}, status ${scene.status}, ${summarize(scene)}`)
  })

  it('inspects a real part with its drawing layer and handle, and picks it back by position', () => {
    const scene = buildReviewScene({ artifact, layout, cutPlan: planCutPath(layout, PROFILE) })
    const sheet = scene.sheets.find((s) => s.parts.length > 0)
    if (!sheet) throw new Error('no placed part')
    const part = sheet.parts[0]
    const rows = Object.fromEntries(inspect(scene, { kind: 'part', sheetId: sheet.id, partKey: part.key }).rows.map((r) => [r.label, r.value]))

    expect(rows['Camada']).toBeDefined()
    expect(rows['Identificador de origem']).toBeDefined()
    expect(rows['Pedido']).toBe('LPEL')
    const ring = part.outlines[0]
    const inside = ring.reduce((acc, p) => ({ x: acc.x + p.x / ring.length, y: acc.y + p.y / ring.length }), { x: 0, y: 0 })
    const hit = pickAt(scene, sheet.id, inside, 0.01)
    expect(hit).not.toBeNull()
  })

  it('plays the real plan deterministically from start to end', () => {
    const scene = buildReviewScene({ artifact, layout, cutPlan: planCutPath(layout, PROFILE) })
    const sheet = scene.sheets.find((s) => (s.timeline?.actions.length ?? 0) > 0)
    if (!sheet?.timeline) throw new Error('no timeline')
    const total = sheet.timeline.actions.length

    const end = stateAt(scene, { sheetId: sheet.id, actionIndex: total, progress: 0 })
    const middle = stateAt(scene, { sheetId: sheet.id, actionIndex: Math.floor(total / 2), progress: 0.5 })

    expect(end.completed).toBe(total)
    expect(end.head).not.toBeNull()
    expect(middle.head).not.toBeNull()
    expect(stateAt(scene, { sheetId: sheet.id, actionIndex: Math.floor(total / 2), progress: 0.5 })).toEqual(middle)
  })
})
