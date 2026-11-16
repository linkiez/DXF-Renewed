import { expect } from 'expect'
import { createRiskPlayback } from '../../../../src/nesting/review/riskPlayback'
import { seekTargetOf } from '../../../../src/nesting/review/seekTargetOf'
import { assessCutRisk } from '../../../../src/nesting/risk/assessCutRisk'
import { completeRiskProfile, denseClusterJob, headStrikeJob, riskRequest, withLimit } from '../risk/fixtures'

const playbackOf = async (job: ReturnType<typeof headStrikeJob>, profile = completeRiskProfile()) => {
  const request = riskRequest(await job, profile)
  return { request, playback: createRiskPlayback(request, assessCutRisk(request)) }
}
const at = (actionIndex: number, progress = 0) => ({ sheetId: 'sheet-1', actionIndex, progress })

describe('review/riskPlayback — overlay of a playback position', () => {
  it('shows the parts that are free at the moment and not the ones that are still being cut', async () => {
    const { playback } = await playbackOf(headStrikeJob())

    expect(playback?.overlayAt(at(2), false).freed).toEqual([])
    expect(playback?.overlayAt(at(3), false).freed?.map((part) => part.key)).toEqual(['small#0'])
    expect(playback?.overlayAt(at(9), false).freed?.map((part) => part.key)).toEqual(['small#0', 'big-1#0', 'big-2#0'])
    expect(playback?.overlayAt(at(3), false).freed?.[0].outline.length).toBeGreaterThan(3)
  })

  it('does not free a part held by a tab', async () => {
    const { playback } = await playbackOf(headStrikeJob(), completeRiskProfile())
    const withTabs = await playbackOf((await import('../risk/fixtures')).tabHeldJob())

    expect(withTabs.playback?.overlayAt(at(10), false).freed?.map((part) => part.key)).toEqual(['big-1#0', 'big-2#0'])
    expect(playback).not.toBeNull()
  })

  it('carries the heat cells of the plan time of the position only when the heat layer is on', async () => {
    const { playback } = await playbackOf(denseClusterJob())

    expect(playback?.overlayAt(at(14), false).heat).toBeUndefined()
    const heat = playback?.overlayAt(at(14), true).heat
    expect(heat?.available).toBe(true)
    expect(heat?.cells.length).toBeGreaterThan(0)
  })

  it('has no heat when a speed is missing', async () => {
    const profile = withLimit(completeRiskProfile(), 'speeds', {})
    const { playback } = await playbackOf(denseClusterJob(), profile)

    expect(playback?.overlayAt(at(14), true).heat).toMatchObject({ available: false })
  })

  it('places a marker with a text label and a position for every finding of the sheet', async () => {
    const { playback } = await playbackOf(headStrikeJob())

    const markers = playback?.overlayAt(at(0), false).markers ?? []

    expect(markers.map((marker) => marker.category).sort()).toEqual(['head-strike', 'loose-part'])
    for (const marker of markers) {
      expect(marker.label).toMatch(/Aviso|Crítico/)
      expect(Number.isFinite(marker.x) && Number.isFinite(marker.y)).toBe(true)
    }
  })

  it('gives identical overlays when seeking back and forth, without animation fields', async () => {
    const { playback } = await playbackOf(denseClusterJob())

    const first = playback?.overlayAt(at(10), true)
    playback?.overlayAt(at(2), true)

    expect(playback?.overlayAt(at(10), true)).toEqual(first)
    expect(JSON.stringify(first)).not.toMatch(/animat|duration/i)
  })
})

describe('review/riskPlayback — seeking to a finding', () => {
  it('targets the action of the finding and selects the part it concerns', async () => {
    const { request } = await playbackOf(headStrikeJob())
    const strike = assessCutRisk(request).findings.find((finding) => finding.category === 'head-strike')

    expect(seekTargetOf(strike as NonNullable<typeof strike>)).toEqual({
      position: { sheetId: 'sheet-1', actionIndex: 6, progress: 0 },
      selection: { kind: 'part', sheetId: 'sheet-1', partKey: 'small#0' },
    })
  })

  it('selects the action when the finding has no part', () => {
    const target = seekTargetOf({
      id: 'x', category: 'heat', severity: 'warning', sheetId: 'sheet-1', actionIndex: 4, measured: 1, limit: 1, unit: 'm', message: 'm', mitigation: 'm',
    })

    expect(target.selection).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: 4 })
  })

  it('seeks to the start when the finding has no action', () => {
    const target = seekTargetOf({
      id: 'x', category: 'thin-web', severity: 'warning', sheetId: 'sheet-2', partKey: 'a#0', measured: 1, limit: 1, unit: 'm', message: 'm', mitigation: 'm',
    })

    expect(target.position).toEqual({ sheetId: 'sheet-2', actionIndex: 0, progress: 0 })
    expect(target.selection).toEqual({ kind: 'part', sheetId: 'sheet-2', partKey: 'a#0' })
  })
})
