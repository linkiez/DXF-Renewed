import { messages } from '../messages'
import type { ReviewRendererFailure } from '../types'

/** Error raised when the accelerated renderer cannot be created. */
export class ReviewGraphicsError extends Error {
  readonly code: ReviewRendererFailure
  constructor(code: ReviewRendererFailure) {
    super(code === 'GRAPHICS_LOST' ? messages.graphicsLost() : messages.graphicsUnavailable())
    this.code = code
  }
}
