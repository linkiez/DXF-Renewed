import { pickAt } from './pick'
import type { RendererSet } from './startRenderers'
import type { ReviewController, ReviewScene, ReviewState } from './types'

const PICK_RADIUS_PIXELS = 6
const SAME_POINT_PIXELS = 4

/**
 * Selects the part or action under a click; clicking the same point again reaches the next
 * overlapping item.
 *
 * @param view - Element that receives clicks.
 * @param scene - Review scene.
 * @param controller - Controller whose selection is set.
 * @param renderers - Renderers; the active one converts the pointer to sheet coordinates.
 * @param latest - Holder of the latest controller state.
 */
export function attachPointer(
  view: HTMLElement,
  scene: ReviewScene,
  controller: ReviewController,
  renderers: RendererSet,
  latest: { state: ReviewState | null },
): void {
  let last: { x: number; y: number } | null = null
  view.addEventListener('click', (event) => {
    const hit = renderers.active.pointAt(event.clientX, event.clientY)
    const state = latest.state
    if (!hit || !state) return
    const same = last !== null && Math.hypot(last.x - event.clientX, last.y - event.clientY) < SAME_POINT_PIXELS
    last = { x: event.clientX, y: event.clientY }
    controller.select(pickAt(scene, state.sheetId, hit.point, hit.unitsPerPixel * PICK_RADIUS_PIXELS, same ? state.selection : null))
  })
}
