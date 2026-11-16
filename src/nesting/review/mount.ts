import { attachSession } from './attachSession'
import { buildReviewScene } from './buildScene'
import { identityPanel } from './identityPanel'
import { messages } from './messages'
import { noticesPanel } from './noticesPanel'
import { summarize } from './summary'
import { summaryPanel } from './summaryPanel'
import type { ReviewController, ReviewInput, ReviewMount, ReviewMountOptions } from './types'

/**
 * Mounts a read-only review of one artifact into a container.
 *
 * The static view is always available. When an accelerated renderer factory is supplied and works,
 * it draws the sheet; if it is missing, fails to start or is lost later, the static view takes
 * over at the same position, with a visible notice. Playback never starts by itself, and every
 * view change is applied immediately.
 *
 * @param container - Element that receives the review.
 * @param input - Artifact plus optional cut layout and cut plan.
 * @param options - Optional accelerated renderer factory and clock.
 * @returns The scene, the playback controller (or `null`) and a `dispose` function.
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
  const scene = buildReviewScene(input)
  const root = doc.createElement('section')
  root.className = 'dxf-review'
  root.setAttribute('aria-label', messages.panels.view)
  root.dataset.status = scene.status
  root.appendChild(identityPanel(doc, scene.identity))
  root.appendChild(summaryPanel(doc, summarize(scene)))

  let controller: ReviewController | null = null
  let stop = (): void => undefined
  if (scene.sheets.length > 0) {
    const view = doc.createElement('div')
    view.dataset.reviewView = ''
    const session = await attachSession(root, view, scene, options)
    controller = session.controller
    stop = session.stop
  } else {
    root.appendChild(noticesPanel(doc, scene.notices))
  }
  container.appendChild(root)

  return {
    scene,
    controller,
    dispose: () => {
      stop()
      root.remove()
    },
  }
}
