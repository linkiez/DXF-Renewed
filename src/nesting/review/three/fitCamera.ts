import type * as ThreeModule from 'three'
import type { ReviewViewport } from '../types'

const MARGIN = 1.08

/**
 * Fits the orthographic camera so the whole sheet stays visible at the given viewport.
 *
 * @param camera - Orthographic camera to update.
 * @param stock - Sheet size.
 * @param viewport - Center and zoom of the view.
 * @param aspect - Canvas height divided by width.
 */
export function fitCamera(
  camera: ThreeModule.OrthographicCamera,
  stock: { width: number; height: number },
  viewport: ReviewViewport,
  aspect: number,
): void {
  const fitWidth = (stock.width * MARGIN) / viewport.zoom / 2
  const fitHeight = (stock.height * MARGIN) / viewport.zoom / 2
  const halfHeight = Math.max(fitWidth * aspect, fitHeight)
  const halfWidth = halfHeight / aspect
  camera.left = viewport.center.x - halfWidth
  camera.right = viewport.center.x + halfWidth
  camera.top = viewport.center.y + halfHeight
  camera.bottom = viewport.center.y - halfHeight
  camera.updateProjectionMatrix()
}
