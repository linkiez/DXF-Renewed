import type { PopulatedReview } from './populateReview'
import { messages } from './messages'
import { riskPanel } from './riskPanel'
import { createRiskPlayback } from './riskPlayback'
import { seekTargetOf } from './seekTargetOf'
import type { RiskPlayback } from './riskPlayback'
import type { OverlayHub } from './overlayHub'
import type { ReviewPosition } from './types'
import type { RiskRequest, RiskResult } from '../risk/types'

/** The risk panel and the playback views it controls. */
export interface RiskView {
  readonly element: HTMLElement
  /** Shows a result, with the inputs it was assessed from so the playback views can be drawn. */
  update(result: RiskResult | null, outdated: boolean, request: RiskRequest | null): void
  /** Follows the playback position of a (new) session. */
  bind(populated: PopulatedReview | null): void
}

/**
 * Connects the risk panel to the playback: the free parts, the accumulated heat and the finding
 * markers follow the position, a marker button seeks to its finding and selects what it concerns.
 *
 * @param doc - Document that owns the panel.
 * @param hub - Overlay hub the risk layers are drawn through.
 * @param current - The mounted session at the time of an action.
 * @returns The risk view.
 */
export function createRiskView(doc: Document, hub: OverlayHub, current: () => PopulatedReview | null): RiskView {
  let playback: RiskPlayback | null = null
  let showHeat = false
  let position: ReviewPosition | null = null
  let subscription: { unsubscribe(): void } | null = null

  const panel = riskPanel(doc, {
    onSeek(finding) {
      const controller = current()?.controller
      const target = seekTargetOf(finding)
      controller?.seek(target.position)
      controller?.select(target.selection)
    },
    onHeat(on) {
      showHeat = on
      refresh()
    },
  })

  function refresh(): void {
    const overlay = playback && position ? playback.overlayAt(position, showHeat) : null
    hub.setRisk(overlay)
    const heat = showHeat ? overlay?.heat : undefined
    if (!heat) return panel.setHeat(null)
    panel.setHeat(heat.available ? messages.risk.heatMax(Math.round(heat.max * 100)) : messages.risk.heatUnavailable(heat.missing))
  }

  return {
    element: panel.element,
    update(result, outdated, request) {
      panel.update(result, outdated)
      playback = !outdated && result && request ? createRiskPlayback(request, result) : null
      refresh()
    },
    bind(populated) {
      subscription?.unsubscribe()
      position = null
      subscription = populated?.controller?.state$.subscribe((state) => {
        position = state.position
        refresh()
      }) ?? null
    },
  }
}
