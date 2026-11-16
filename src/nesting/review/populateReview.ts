import { attachSession } from './attachSession'
import type { ReviewControllerOptions } from './controller'
import { buildReviewScene } from './buildScene'
import { identityPanel } from './identityPanel'
import { noticesPanel } from './noticesPanel'
import type { RendererSet } from './startRenderers'
import { summarize } from './summary'
import { summaryPanel } from './summaryPanel'
import type { ReviewController, ReviewInput, ReviewMountOptions, ReviewScene } from './types'

/** What a populated review exposes to the code that mounted it. */
export interface PopulatedReview {
  scene: ReviewScene
  controller: ReviewController | null
  renderers: RendererSet | null
  /** The element that receives the drawing; `null` when there is nothing to draw. */
  view: HTMLElement | null
  stop(): void
}

/**
 * Builds the scene of an input and fills a review root with the identity, the summary and, when
 * there is something to show, the interactive session; otherwise with the notices.
 *
 * @param root - Review root element, already empty of earlier content.
 * @param input - Artifact plus optional cut layout and cut plan.
 * @param options - Mount options.
 * @param restore - State to restore when this replaces an earlier session.
 * @returns The scene, the controller and renderers, the view and a function that releases the session.
 */
export async function populateReview(
  root: HTMLElement,
  input: ReviewInput,
  options: ReviewMountOptions,
  restore?: ReviewControllerOptions['initial'],
): Promise<PopulatedReview> {
  const doc = root.ownerDocument
  const scene = buildReviewScene(input)
  root.dataset.status = scene.status
  root.appendChild(identityPanel(doc, scene.identity))
  root.appendChild(summaryPanel(doc, summarize(scene)))
  if (scene.sheets.length === 0) {
    root.appendChild(noticesPanel(doc, scene.notices))
    return { scene, controller: null, renderers: null, view: null, stop: () => undefined }
  }
  const view = doc.createElement('div')
  view.dataset.reviewView = ''
  const session = await attachSession(root, view, scene, options, restore)
  return { scene, controller: session.controller, renderers: session.renderers, view, stop: session.stop }
}
