import type * as ThreeModule from 'three'
import { stateAt } from '../stateAt'
import type { ReviewFrame, ReviewOverlay, ReviewRenderer, ReviewRendererFailure } from '../types'
import { fitCamera } from './fitCamera'
import { ReviewGraphicsError } from './graphicsError'
import type { LineKind } from './lineKinds'
import { PALETTE } from './palette'
import { buildSheetObjects } from './sheetObjects'
import type { SheetObjects } from './sheetObjects'
import type { ThreeNamespace } from './threeNamespace'
import { createOverlayLayer } from './updateOverlay'
import type { OverlayLayer } from './updateOverlay'
import { updatePartial } from './updatePartial'
import { updateSelection } from './updateSelection'
import { updateTrail } from './updateTrail'

/** Options of the accelerated renderer. */
export interface CreateThreeRendererOptions {
  container: HTMLElement
  /** The `three` namespace, or an async loader for it; never imported by the library itself. */
  three: ThreeNamespace | (() => Promise<ThreeNamespace>)
}

const FALLBACK_SIZE = { width: 800, height: 600 }

const startGraphics = (three: ThreeNamespace, canvas: HTMLCanvasElement) => {
  if (!canvas.getContext('webgl2')) throw new ReviewGraphicsError('GRAPHICS_UNAVAILABLE')
  try {
    return new three.WebGLRenderer({ canvas, antialias: true })
  } catch {
    throw new ReviewGraphicsError('GRAPHICS_UNAVAILABLE')
  }
}

/**
 * Creates the accelerated top-down renderer.
 *
 * Static content is merged into a constant number of objects; the trail is a draw-range prefix of
 * each merged buffer and the head is one marker, so seeking only updates ranges and one position.
 *
 * @param options - Container and the injected `three` namespace (or loader).
 * @returns The renderer.
 * @throws {ReviewGraphicsError} With code `GRAPHICS_UNAVAILABLE` when WebGL2 or `three` is unavailable.
 * @example
 * ```typescript
 * const renderer = await createThreeRenderer({ container, three: () => import('three') })
 * ```
 */
export async function createThreeRenderer(options: CreateThreeRendererOptions): Promise<ReviewRenderer & { readonly scene: object }> {
  const three = typeof options.three === 'function' ? await options.three().catch(() => null) : options.three
  if (!three) throw new ReviewGraphicsError('GRAPHICS_UNAVAILABLE')
  const doc = options.container.ownerDocument
  const canvas = doc.createElement('canvas')
  const gl = startGraphics(three, canvas)
  gl.setPixelRatio(Math.min(doc.defaultView?.devicePixelRatio ?? 1, 2))
  options.container.appendChild(canvas)

  const scene = new three.Scene()
  const camera = new three.OrthographicCamera(0, 1, 1, 0, -10, 10)
  camera.position.set(0, 0, 1)
  const listeners: ((code: ReviewRendererFailure) => void)[] = []
  canvas.addEventListener('webglcontextlost', (event?: Event) => {
    event?.preventDefault()
    listeners.forEach((listener) => listener('GRAPHICS_LOST'))
  })

  type Disposable = { dispose(): void }
  const solid = new Map<LineKind, ThreeModule.Material>()
  let owned: Disposable[] = []
  const own = <T extends Disposable>(item: T): T => {
    owned.push(item)
    return item
  }
  const release = (): void => {
    owned.forEach((item) => item.dispose())
    owned = []
    solid.clear()
  }
  const solidMaterial = (kind: LineKind): ThreeModule.Material => {
    if (!solid.has(kind)) solid.set(kind, own(new three.LineBasicMaterial({ color: PALETTE.colors[kind] })))
    return solid.get(kind) as ThreeModule.Material
  }

  let built: SheetObjects | null = null
  let size = { width: 0, height: 0 }
  let lastFrame: ReviewFrame | null = null
  let overlayLayer: OverlayLayer | null = null
  let overlay: ReviewOverlay | null = null
  let appliedOverlay: { overlay: ReviewOverlay | null; sheetId: string } | null = null

  const objectsFor = (sheetId: string, sheet: Parameters<typeof buildSheetObjects>[1]): SheetObjects => {
    if (built?.sheetId === sheetId) return built
    while (scene.children.length > 0) scene.remove(scene.children[0])
    release()
    built = buildSheetObjects({ three, scene, own }, sheet)
    return built
  }

  const resize = (): { width: number; height: number } => {
    const width = options.container.clientWidth || FALLBACK_SIZE.width
    const height = options.container.clientHeight || FALLBACK_SIZE.height
    if (width !== size.width || height !== size.height) {
      size = { width, height }
      gl.setSize(width, height, false)
    }
    return size
  }

  const syncOverlay = (sheetId: string, unit: number): void => {
    if (!overlay && !overlayLayer) return
    overlayLayer ??= createOverlayLayer(three)
    if (overlayLayer.group.parent !== scene) scene.add(overlayLayer.group)
    if (appliedOverlay?.overlay === overlay && appliedOverlay.sheetId === sheetId) return
    overlayLayer.apply(overlay, unit)
    appliedOverlay = { overlay, sheetId }
  }

  const render = (frame: ReviewFrame): void => {
    lastFrame = frame
    const sheet = frame.scene.sheets.find((candidate) => candidate.id === frame.sheetId)
    if (!sheet) return
    const objects = objectsFor(sheet.id, sheet)
    const { width, height } = resize()
    fitCamera(camera, sheet.stock, frame.viewport, height / width)
    syncOverlay(sheet.id, Math.max(sheet.stock.width, sheet.stock.height) / 400)
    const state = stateAt(frame.scene, frame.position)
    updateTrail(objects, state.completed)
    updatePartial(objects, state, frame.position.progress, solidMaterial)
    updateSelection(objects, sheet, frame.selection)
    objects.head.visible = state.head !== null
    if (state.head) objects.head.position.set(state.head.x, state.head.y, 0.5)
    gl.render(scene, camera)
  }

  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver(() => {
        if (lastFrame) render(lastFrame)
      })
  resizeObserver?.observe(options.container)

  return {
    kind: 'accelerated',
    scene,
    render,
    overlay(next) {
      overlay = next
      if (lastFrame) render(lastFrame)
    },
    pointAt(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return null
      const spanX = camera.right - camera.left
      const spanY = camera.top - camera.bottom
      return {
        point: {
          x: camera.left + ((clientX - rect.left) / rect.width) * spanX,
          y: camera.top - ((clientY - rect.top) / rect.height) * spanY,
        },
        unitsPerPixel: spanX / rect.width,
      }
    },
    onFailure(listener) {
      listeners.push(listener)
    },
    dispose() {
      resizeObserver?.disconnect()
      overlayLayer?.dispose()
      release()
      gl.dispose()
      canvas.remove()
      built = null
    },
  }
}
