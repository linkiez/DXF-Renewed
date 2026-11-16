import { graphicsNotice } from './graphicsNotice'
import { createSvgRenderer } from './svgRenderer'
import type { ReviewMountOptions, ReviewNotice, ReviewRenderer } from './types'

/** Renderers of one mounted review. */
export interface RendererSet {
  /** Renderer currently drawing; becomes the static one after a graphics failure. */
  active: ReviewRenderer
  /** The accelerated renderer, when one started. */
  accelerated: ReviewRenderer | null
  /** Always-available static renderer. */
  staticRenderer: ReviewRenderer
  /** Notices raised while starting (for example `GRAPHICS_UNAVAILABLE`). */
  notices: ReviewNotice[]
}

/**
 * Starts the static renderer and, when a factory is supplied, tries the accelerated one.
 *
 * @param view - Element that receives the drawing.
 * @param options - Mount options with the optional accelerated factory.
 * @returns The renderers and any startup notices; a failing factory leaves the static view.
 */
export async function startRenderers(view: HTMLElement, options: ReviewMountOptions): Promise<RendererSet> {
  const staticRenderer = createSvgRenderer(view)
  const notices: ReviewNotice[] = []
  let accelerated: ReviewRenderer | null = null
  if (options.acceleratedRenderer) {
    accelerated = await options.acceleratedRenderer(view).catch(() => {
      notices.push(graphicsNotice('GRAPHICS_UNAVAILABLE'))
      return null
    })
  }
  return { active: accelerated ?? staticRenderer, accelerated, staticRenderer, notices }
}
