import { populateReview } from './populateReview'
import { mountEditable } from './mountEditable'
import { assessCutRisk } from '../risk/assessCutRisk'
import { messages } from './messages'
import { createOverlayHub } from './overlayHub'
import { createRiskView } from './createRiskView'
import type { ReviewInput, ReviewMount, ReviewMountOptions } from './types'

/**
 * Mounts a review of one artifact into a container.
 *
 * The static view is always available. When an accelerated renderer factory is supplied and works,
 * it draws the sheet; if it is missing, fails to start or is lost later, the static view takes
 * over at the same position, with a visible notice. Playback never starts by itself, and every
 * view change is applied immediately. With the `edit` option the review also lets the user
 * reposition parts with a live verdict, and `mount.edit` exposes those commands.
 *
 * @param container - Element that receives the review.
 * @param input - Artifact plus optional cut layout and cut plan.
 * @param options - Optional accelerated renderer factory, clock and edit options.
 * @returns The scene, the playback controller (or `null`), the edit handle (or `null`) and a `dispose` function.
 * @example
 * ```typescript
 * const review = await mountReview(host, { artifact }, { acceleratedRenderer })
 * review.controller?.play()
 * ```
 */
export async function mountReview(
  container: HTMLElement,
  input: ReviewInput,
  options: ReviewMountOptions = {},
): Promise<ReviewMount> {
  const doc = container.ownerDocument
  const root = doc.createElement('section')
  root.className = 'dxf-review'
  root.setAttribute('aria-label', messages.panels.view)
  if (options.edit) {
    const editable = await mountEditable(root, input, options)
    container.appendChild(root)
    return {
      get scene() { return editable.scene() },
      get controller() { return editable.controller() },
      edit: editable.edit,
      dispose: () => { editable.dispose(); root.remove() },
    }
  }
  const populated = await populateReview(root, input, options)
  if (options.risk && input.cutPlan) {
    const hub = createOverlayHub((overlay) => populated.renderers?.active.overlay?.(overlay))
    const view = createRiskView(doc, hub, () => populated)
    const request = { artifact: input.artifact, layout: input.layout, cutPlan: input.cutPlan, profile: options.risk.profile }
    view.update(assessCutRisk(request), false, request)
    view.bind(populated)
    root.appendChild(view.element)
  }
  container.appendChild(root)
  return {
    scene: populated.scene,
    controller: populated.controller,
    edit: null,
    dispose: () => {
      populated.stop()
      root.remove()
    },
  }
}
