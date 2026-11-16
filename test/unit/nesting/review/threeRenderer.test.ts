import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { createThreeRenderer } from '../../../../src/nesting/review/three'
import type { ThreeNamespace } from '../../../../src/nesting/review/three'
import type { ReviewFrame, ReviewRendererFailure, ReviewScene } from '../../../../src/nesting/review/types'
import { referenceFixture, smallFixture } from './fixtures'

interface Counters {
  geometries: number
  attributes: number
  matrices: number
  disposedGeometries: number
  renders: number
  rendererDisposed: boolean
  canvasRemoved: boolean
  webgl2: boolean
}

class Obj {
  name = ''
  visible = true
  position = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z } }
  children: Obj[] = []
  add(child: Obj): void { this.children.push(child) }
  computeLineDistances(): void { /* stub */ }
}

const makeStub = (counters: Counters) => {
  const listeners = new Map<string, () => void>()
  const canvas = {
    getContext: (kind: string) => (kind === 'webgl2' && counters.webgl2 ? {} : null),
    addEventListener: (name: string, fn: () => void) => { listeners.set(name, fn) },
    remove: () => { counters.canvasRemoved = true },
    getBoundingClientRect: () => ({ left: 100, top: 50, width: 800, height: 600 }),
    width: 800,
    height: 600,
  }
  class Attr { constructor(public array: Float32Array, public itemSize: number) { counters.attributes += 1 } }
  class Geometry {
    attributes: Record<string, Attr> = {}
    drawRange = { start: 0, count: Infinity }
    constructor() { counters.geometries += 1 }
    setAttribute(name: string, attr: Attr): this { this.attributes[name] = attr; return this }
    setDrawRange(start: number, count: number): void { this.drawRange = { start, count } }
    dispose(): void { counters.disposedGeometries += 1 }
  }
  class Material { constructor(public params: Record<string, unknown> = {}) {} dispose(): void { /* stub */ } }
  class Lines extends Obj { constructor(public geometry: Geometry, public material: Material) { super() } }
  class Instanced extends Obj {
    count: number
    instanceMatrix = { needsUpdate: false }
    constructor(public geometry: Geometry, public material: Material, public capacity: number) { super(); this.count = capacity }
    setMatrixAt(): void { /* stub */ }
  }
  class Matrix4 { constructor() { counters.matrices += 1 } makeTranslation(): this { return this } }
  class Camera extends Obj {
    constructor(public left: number, public right: number, public top: number, public bottom: number) { super() }
    updateProjectionMatrix(): void { /* stub */ }
  }
  class Renderer {
    domElement = canvas
    constructor() { /* stub */ }
    setSize(): void { /* stub */ }
    setPixelRatio(): void { /* stub */ }
    render(): void { counters.renders += 1 }
    dispose(): void { counters.rendererDisposed = true }
  }
  const namespace = {
    Scene: Obj, OrthographicCamera: Camera, WebGLRenderer: Renderer,
    BufferGeometry: Geometry, Float32BufferAttribute: Attr, LineSegments: Lines,
    LineBasicMaterial: Material, LineDashedMaterial: Material, MeshBasicMaterial: Material,
    InstancedMesh: Instanced, CircleGeometry: Geometry, Mesh: class extends Obj { constructor(public geometry: Geometry, public material: Material) { super() } },
    Matrix4,
  }
  const container = {
    clientWidth: 800,
    clientHeight: 600,
    ownerDocument: { createElement: () => canvas },
    appendChild: () => undefined,
  }
  return { namespace: namespace as unknown as ThreeNamespace, container: container as unknown as HTMLElement, listeners }
}

const fresh = (): Counters => ({
  geometries: 0, attributes: 0, matrices: 0, disposedGeometries: 0, renders: 0,
  rendererDisposed: false, canvasRemoved: false, webgl2: true,
})

const frameFor = (scene: ReviewScene, actionIndex: number, progress = 0): ReviewFrame => ({
  scene,
  sheetId: 'sheet-1',
  position: { sheetId: 'sheet-1', actionIndex, progress },
  selection: null,
  viewport: { center: { x: 50, y: 50 }, zoom: 1 },
})

const sceneOfObjects = (renderer: unknown): Obj[] =>
  ((renderer as { scene: Obj }).scene).children

describe('review/three renderer — availability', () => {
  it('rejects with GRAPHICS_UNAVAILABLE when WebGL2 is missing', async () => {
    const counters = fresh()
    counters.webgl2 = false
    const { namespace, container } = makeStub(counters)

    await expect(createThreeRenderer({ container, three: namespace })).rejects.toMatchObject({ code: 'GRAPHICS_UNAVAILABLE' })
  })

  it('accepts a loader function for the namespace', async () => {
    const { namespace, container } = makeStub(fresh())
    const renderer = await createThreeRenderer({ container, three: async () => namespace })

    expect(renderer.kind).toBe('accelerated')
  })

  it('reports context loss through the failure listener', async () => {
    const { namespace, container, listeners } = makeStub(fresh())
    const renderer = await createThreeRenderer({ container, three: namespace })
    const codes: ReviewRendererFailure[] = []
    renderer.onFailure((code) => codes.push(code))

    listeners.get('webglcontextlost')?.()

    expect(codes).toEqual(['GRAPHICS_LOST'])
  })
})

describe('review/three renderer — scene content', () => {
  it('keeps the number of scene objects independent of the number of actions', async () => {
    const small = makeStub(fresh())
    const big = makeStub(fresh())
    const smallRenderer = await createThreeRenderer({ container: small.container, three: small.namespace })
    const bigRenderer = await createThreeRenderer({ container: big.container, three: big.namespace })
    const smallScene = buildReviewScene((await smallFixture()).input)
    const bigScene = buildReviewScene((await referenceFixture()).input)

    smallRenderer.render(frameFor(smallScene, 0))
    bigRenderer.render(frameFor(bigScene, 0))

    expect(sceneOfObjects(bigRenderer).length).toBe(sceneOfObjects(smallRenderer).length)
    expect(sceneOfObjects(bigRenderer).length).toBeLessThan(40)
  })

  it('draws the trail as a draw-range prefix of the merged buffer', async () => {
    const counters = fresh()
    const { namespace, container } = makeStub(counters)
    const renderer = await createThreeRenderer({ container, three: namespace })
    const scene = buildReviewScene((await smallFixture()).input)
    const actions = scene.sheets[0].timeline?.actions ?? []
    const cutIndex = actions.findIndex((a) => a.kind === 'cut')

    renderer.render(frameFor(scene, cutIndex + 1))
    const trail = sceneOfObjects(renderer).find((o) => o.name === 'trail:cut') as unknown as { geometry: { drawRange: { count: number } } }
    const ghost = sceneOfObjects(renderer).find((o) => o.name === 'ghost:cut') as unknown as { geometry: { drawRange: { start: number; count: number } } }

    expect(trail.geometry.drawRange.count).toBeGreaterThan(0)
    expect(ghost.geometry.drawRange.start).toBe(trail.geometry.drawRange.count)
    renderer.render(frameFor(scene, 0))
    expect(trail.geometry.drawRange.count).toBe(0)
  })

  it('moves the head marker to the tool position', async () => {
    const { namespace, container } = makeStub(fresh())
    const renderer = await createThreeRenderer({ container, three: namespace })
    const scene = buildReviewScene((await smallFixture()).input)
    const first = scene.sheets[0].timeline?.actions[0]

    renderer.render(frameFor(scene, 0))
    const head = sceneOfObjects(renderer).find((o) => o.name === 'head')

    expect(head?.position.x).toBe(first?.points[0].x)
    expect(head?.position.y).toBe(first?.points[0].y)
  })

  it('does not allocate geometry, attributes or matrices after the first frame', async () => {
    const counters = fresh()
    const { namespace, container } = makeStub(counters)
    const renderer = await createThreeRenderer({ container, three: namespace })
    const scene = buildReviewScene((await referenceFixture()).input)
    const total = scene.sheets[0].timeline?.actions.length ?? 0

    renderer.render(frameFor(scene, 0))
    const snapshot = { ...counters }
    for (let index = 0; index < 60; index += 1) renderer.render(frameFor(scene, Math.floor((index / 60) * total), (index % 10) / 10))

    expect(counters.geometries).toBe(snapshot.geometries)
    expect(counters.attributes).toBe(snapshot.attributes)
    expect(counters.matrices).toBe(snapshot.matrices)
    expect(counters.renders).toBe(snapshot.renders + 60)
  })

  it('disposes geometries, the renderer and the canvas', async () => {
    const counters = fresh()
    const { namespace, container } = makeStub(counters)
    const renderer = await createThreeRenderer({ container, three: namespace })
    renderer.render(frameFor(buildReviewScene((await smallFixture()).input), 0))

    renderer.dispose()

    expect(counters.disposedGeometries).toBe(counters.geometries)
    expect(counters.rendererDisposed).toBe(true)
    expect(counters.canvasRemoved).toBe(true)
  })
})

describe('review/three renderer — selection and pointer', () => {
  it('highlights the selected part and clears the highlight', async () => {
    const { namespace, container } = makeStub(fresh())
    const renderer = await createThreeRenderer({ container, three: namespace })
    const scene = buildReviewScene((await smallFixture()).input)

    renderer.render({ ...frameFor(scene, 0), selection: { kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' } })
    const highlight = sceneOfObjects(renderer).find((o) => o.name === 'selection') as unknown as { geometry: { drawRange: { count: number } } }
    expect(highlight.geometry.drawRange.count).toBe(8)
    renderer.render(frameFor(scene, 0))
    expect(highlight.geometry.drawRange.count).toBe(0)
    renderer.render({ ...frameFor(scene, 0), selection: { kind: 'action', sheetId: 'sheet-1', actionIndex: 3 } })
    expect(highlight.geometry.drawRange.count).toBeGreaterThan(0)
  })

  it('converts a pointer position to sheet coordinates using the camera extents', async () => {
    const { namespace, container } = makeStub(fresh())
    const renderer = await createThreeRenderer({ container, three: namespace })
    const scene = buildReviewScene((await smallFixture()).input)
    renderer.render(frameFor(scene, 0))

    const center = renderer.pointAt(500, 350)

    expect(center?.point.x).toBeCloseTo(50)
    expect(center?.point.y).toBeCloseTo(50)
    expect(center?.unitsPerPixel).toBeCloseTo((100 * 1.08 * (800 / 600)) / 800)
  })
})
