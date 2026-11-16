import { pickAt } from './pick'
import type { RendererSet } from './startRenderers'
import type { ReviewController, ReviewEditHandle, ReviewScene, ReviewState } from './types'

const PICK_RADIUS_PIXELS = 6

/** What dragging needs from the mounted review. */
export interface DragDeps {
  view: HTMLElement
  scene: ReviewScene
  controller: ReviewController
  renderers: RendererSet
  latest: { state: ReviewState | null }
  handle: ReviewEditHandle
  /** True while the edit mode is on. */
  editing(): boolean
}

interface Drag {
  partKey: string
  start: { x: number; y: number }
}

/**
 * Lets the user drag a part in the edit mode: pressing on a part selects it, moving proposes a
 * position through the edit handle at every step and releasing keeps the proposal pending until the
 * user confirms or cancels it.
 *
 * @param deps - View, scene, controller, renderers and the edit handle.
 */
export function attachDrag(deps: DragDeps): void {
  const { view, handle } = deps
  let drag: Drag | null = null
  view.addEventListener('pointerdown', (event) => {
    const state = deps.latest.state
    if (!deps.editing() || event.button !== 0 || !state) return
    const hit = deps.renderers.active.pointAt(event.clientX, event.clientY)
    if (!hit) return
    const picked = pickAt(deps.scene, state.sheetId, hit.point, hit.unitsPerPixel * PICK_RADIUS_PIXELS)
    if (picked?.kind !== 'part') return
    deps.controller.select(picked)
    handle.selectPart(picked.partKey)
    drag = { partKey: picked.partKey, start: hit.point }
    view.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  })
  view.addEventListener('pointermove', (event) => {
    if (!drag) return
    const hit = deps.renderers.active.pointAt(event.clientX, event.clientY)
    if (!hit) return
    handle.propose({ partKey: drag.partKey, kind: 'move', delta: { dx: hit.point.x - drag.start.x, dy: hit.point.y - drag.start.y } })
  })
  const end = (event: PointerEvent): void => {
    if (!drag) return
    drag = null
    view.releasePointerCapture?.(event.pointerId)
  }
  view.addEventListener('pointerup', end)
  view.addEventListener('pointercancel', end)
}
