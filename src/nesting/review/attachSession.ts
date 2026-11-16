import { attachPointer } from './attachPointer'
import { bindState } from './bindState'
import { buildPanels } from './buildPanels'
import { createReviewController } from './controller'
import { createAnimationClock } from './domClock'
import { startRenderers } from './startRenderers'
import type { RendererSet } from './startRenderers'
import type { ReviewController, ReviewMountOptions, ReviewScene, ReviewState } from './types'
import type { ReviewControllerOptions } from './controller'

/**
 * Starts the interactive session of a mounted review: renderers, controller, panels, pointer and
 * keyboard handling, and state synchronization.
 *
 * @param root - Review root element.
 * @param view - Element that receives the drawing.
 * @param scene - Review scene with at least one sheet.
 * @param options - Mount options.
 * @param initial - State to restore when the session replaces an earlier one.
 * @returns The controller, the renderers and a function that releases the session.
 */
export async function attachSession(
  root: HTMLElement,
  view: HTMLElement,
  scene: ReviewScene,
  options: ReviewMountOptions,
  initial?: ReviewControllerOptions['initial'],
): Promise<{ controller: ReviewController; renderers: RendererSet; stop(): void }> {
  const renderers = await startRenderers(view, options)
  const controller = createReviewController({
    scene,
    renderer: renderers.active,
    fallback: renderers.accelerated ? renderers.staticRenderer : undefined,
    clock: options.clock ?? createAnimationClock(root.ownerDocument.defaultView as Window),
    notices: renderers.notices,
    initial,
  })
  const panels = buildPanels(root, view, scene, controller)
  const latest: { state: ReviewState | null } = { state: null }
  attachPointer(view, scene, controller, renderers, latest)
  const subscription = bindState(root, scene, controller, panels, renderers, latest)
  return {
    controller,
    renderers,
    stop: () => {
      subscription.unsubscribe()
      controller.dispose()
    },
  }
}
