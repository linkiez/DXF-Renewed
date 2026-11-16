import { announcementFor } from './announce'
import { noticesPanel } from './noticesPanel'
import type { PanelHandles } from './buildPanels'
import type { RendererSet } from './startRenderers'
import type { ReviewController, ReviewScene, ReviewState } from './types'

/**
 * Keeps panels, announcements, the sheet switcher and the root attributes in sync with the state.
 *
 * @param root - Review root element.
 * @param scene - Review scene.
 * @param controller - Controller whose state is observed.
 * @param panels - Panels to update.
 * @param renderers - Renderers; the active one switches to static after a failure.
 * @param latest - Holder of the latest controller state.
 * @returns Subscription to release on dispose.
 */
export function bindState(
  root: HTMLElement,
  scene: ReviewScene,
  controller: ReviewController,
  panels: PanelHandles,
  renderers: RendererSet,
  latest: { state: ReviewState | null },
): { unsubscribe(): void } {
  const doc = root.ownerDocument
  let previous: ReviewState | null = null
  return controller.state$.subscribe((state) => {
    latest.state = state
    if (state.renderer === 'static') renderers.active = renderers.staticRenderer
    panels.inspector?.update(state)
    panels.controls?.update(state)
    const announcement = announcementFor(scene, previous, state)
    if (announcement !== null && panels.status.textContent !== announcement) panels.status.textContent = announcement
    previous = state
    const select = panels.switcher.querySelector('select')
    if (select && select.value !== state.sheetId) select.value = state.sheetId
    const next = noticesPanel(doc, state.notices)
    panels.notices.element.replaceWith(next)
    panels.notices.element = next
    root.dataset.renderer = state.renderer
  })
}
