import { messages } from './messages'
import type { ReviewNotice, ReviewRendererFailure } from './types'

/**
 * Builds the notice that explains a graphics failure.
 *
 * @param code - Failure reported by the accelerated renderer.
 * @returns Warning notice in Brazilian Portuguese.
 */
export function graphicsNotice(code: ReviewRendererFailure): ReviewNotice {
  return {
    severity: 'warning',
    code,
    message: code === 'GRAPHICS_LOST' ? messages.graphicsLost() : messages.graphicsUnavailable(),
    origin: 'review',
  }
}
