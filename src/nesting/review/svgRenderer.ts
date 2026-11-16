import { renderReviewSvg } from './renderSvg'
import type { ReviewFrame, ReviewOverlay, ReviewRenderer } from './types'

/**
 * Wraps the static SVG drawing as a renderer, so the controller can drive it like any other.
 *
 * @param view - Element that receives the drawing.
 * @returns A `static` renderer that redraws the sheet at every frame.
 */
export function createSvgRenderer(view: HTMLElement): ReviewRenderer {
  let overlay: ReviewOverlay | null = null
  let lastFrame: ReviewFrame | null = null
  const draw = (frame: ReviewFrame): void => {
    view.innerHTML = renderReviewSvg(frame.scene, {
      sheetId: frame.sheetId,
      position: frame.position,
      selection: frame.selection,
      viewport: frame.viewport,
      overlay,
    })
  }
  return {
    kind: 'static',
    render(frame) {
      lastFrame = frame
      draw(frame)
    },
    overlay(next) {
      overlay = next
      if (lastFrame) draw(lastFrame)
    },
    pointAt(clientX, clientY) {
      const group = view.querySelector<SVGGElement>('g[data-sheet-id]')
      const matrix = group?.getScreenCTM()
      if (!group || !matrix) return null
      const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
      return { point: { x: point.x, y: point.y }, unitsPerPixel: 1 / Math.hypot(matrix.a, matrix.b) }
    },
    onFailure: () => undefined,
    dispose() {
      view.replaceChildren()
    },
  }
}
