import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { createReviewController } from '../../../../src/nesting/review/controller'
import { positionAtDistance } from '../../../../src/nesting/review/positionAtDistance'
import type {
  ReviewClock, ReviewFrame, ReviewRenderer, ReviewRendererFailure, ReviewScene, ReviewState,
} from '../../../../src/nesting/review/types'
import { deepFreeze, smallFixture } from './fixtures'

class FakeClock implements ReviewClock {
  time = 0
  tick: ((now: number) => void) | null = null
  now(): number { return this.time }
  schedule(tick: (now: number) => void): () => void {
    this.tick = tick
    return () => { this.tick = null }
  }
  advance(ms: number): void {
    this.time += ms
    this.tick?.(this.time)
  }
}

class FakeRenderer implements ReviewRenderer {
  frames: ReviewFrame[] = []
  disposed = false
  private listeners: ((code: ReviewRendererFailure) => void)[] = []
  constructor(readonly kind: 'accelerated' | 'static') {}
  render(frame: ReviewFrame): void { this.frames.push(frame) }
  onFailure(listener: (code: ReviewRendererFailure) => void): void { this.listeners.push(listener) }
  pointAt(): null { return null }
  fail(code: ReviewRendererFailure): void { this.listeners.forEach((l) => l(code)) }
  dispose(): void { this.disposed = true }
}

const setup = async () => {
  const { input } = await smallFixture()
  const scene: ReviewScene = buildReviewScene(input)
  const clock = new FakeClock()
  const renderer = new FakeRenderer('accelerated')
  const fallback = new FakeRenderer('static')
  const controller = createReviewController({ scene, renderer, fallback, clock })
  let state: ReviewState | undefined
  const emitted: ReviewState[] = []
  controller.state$.subscribe((value) => { state = value; emitted.push(value) })
  const current = (): ReviewState => state as ReviewState
  return { scene, clock, renderer, fallback, controller, current, emitted }
}

describe('review/controller — playback', () => {
  it('starts paused at the beginning of the first sheet and never schedules playback on its own', async () => {
    const { clock, current, renderer, scene } = await setup()

    expect(current().playing).toBe(false)
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: 0, progress: 0 })
    expect(current().speed).toBe(1)
    expect(current().renderer).toBe('accelerated')
    expect(current().notices).toEqual(scene.notices)
    expect(clock.tick).toBeNull()
    expect(renderer.frames).toHaveLength(1)
    clock.advance(10_000)
    expect(current().position.actionIndex).toBe(0)
  })

  it('plays along the timeline with the injected clock and pauses', async () => {
    const { clock, controller, current, scene } = await setup()
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')

    controller.play()
    expect(current().playing).toBe(true)
    clock.advance(1000)

    const rate = Math.max(timeline.playTotal / 60, 1)
    expect(current().position).toEqual(positionAtDistance(timeline, 'sheet-1', rate * 1))
    controller.pause()
    const paused = current().position
    expect(current().playing).toBe(false)
    expect(clock.tick).toBeNull()
    clock.advance(5000)
    expect(current().position).toEqual(paused)
  })

  it('doubles the pace when the speed doubles', async () => {
    const first = await setup()
    first.controller.play()
    first.clock.advance(2000)
    const second = await setup()
    second.controller.setSpeed(2)
    second.controller.play()
    second.clock.advance(2000)
    const timeline = first.scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')

    expect(second.current().speed).toBe(2)
    expect(second.current().position).toEqual(positionAtDistance(timeline, 'sheet-1', 2 * 2 * Math.max(timeline.playTotal / 60, 1)))
    expect(second.current().position.actionIndex).toBeGreaterThan(first.current().position.actionIndex - 1)
  })

  it('stops at the end of the plan and finishes playback', async () => {
    const { clock, controller, current, scene } = await setup()
    const total = scene.sheets[0].timeline?.actions.length ?? 0

    controller.play()
    clock.advance(10 * 60_000)

    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: total, progress: 0 })
    expect(current().playing).toBe(false)
    expect(clock.tick).toBeNull()
  })

  it('reset pauses and returns to the start', async () => {
    const { clock, controller, current } = await setup()
    controller.play()
    clock.advance(3000)

    controller.reset()

    expect(current().playing).toBe(false)
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: 0, progress: 0 })
  })
})

describe('review/controller — seeking and sheets', () => {
  it('steps to the next pierce and to the end after the last one', async () => {
    const { controller, current, scene } = await setup()
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')

    controller.stepToNextPierce()
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: timeline.pierceIndices[0], progress: 0 })
    controller.seekToAction(timeline.pierceIndices[timeline.pierceIndices.length - 1])
    controller.stepToNextPierce()
    expect(current().position.actionIndex).toBe(timeline.actions.length)
  })

  it('seeks to any action, by an offset, and clamps to the plan', async () => {
    const { controller, current, scene } = await setup()
    const total = scene.sheets[0].timeline?.actions.length ?? 0

    controller.seekToAction(6)
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: 6, progress: 0 })
    controller.seekBy(3)
    expect(current().position.actionIndex).toBe(9)
    controller.seekBy(-100)
    expect(current().position.actionIndex).toBe(0)
    controller.seekToAction(total + 40)
    expect(current().position.actionIndex).toBe(total)
    controller.seek({ sheetId: 'sheet-1', actionIndex: 2, progress: 0.5 })
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: 2, progress: 0.5 })
  })

  it('keeps playing from the sought position', async () => {
    const { clock, controller, current } = await setup()
    controller.play()
    controller.seekToAction(8)
    clock.advance(500)

    expect(current().playing).toBe(true)
    expect(current().position.actionIndex).toBeGreaterThanOrEqual(8)
  })

  it('switching sheet pauses, resets the position and ignores unknown sheets', async () => {
    const { controller, current, clock } = await setup()
    controller.play()
    clock.advance(2000)

    controller.selectSheet('sheet-2')
    expect(current().sheetId).toBe('sheet-2')
    expect(current().position).toEqual({ sheetId: 'sheet-2', actionIndex: 0, progress: 0 })
    expect(current().playing).toBe(false)
    controller.selectSheet('nope')
    expect(current().sheetId).toBe('sheet-2')
  })

  it('emits only when something changed', async () => {
    const { controller, emitted } = await setup()
    const before = emitted.length

    controller.seekToAction(0)
    controller.pause()

    expect(emitted).toHaveLength(before)
  })
})

describe('review/controller — renderer failure', () => {
  it('falls back to the static renderer keeping position, and records a notice', async () => {
    const { controller, current, renderer, fallback, clock } = await setup()
    controller.seekToAction(7)
    controller.select({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-2#0' })
    controller.zoomBy(2)
    controller.play()

    renderer.fail('GRAPHICS_LOST')

    expect(current().renderer).toBe('static')
    expect(current().notices.map((n) => n.code)).toContain('GRAPHICS_LOST')
    expect(current().notices.find((n) => n.code === 'GRAPHICS_LOST')?.message).toContain('contexto gráfico')
    expect(current().position.actionIndex).toBe(7)
    expect(current().playing).toBe(true)
    expect(renderer.disposed).toBe(true)
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-2#0' })
    expect(current().viewport.zoom).toBe(2)
    const drawn = fallback.frames[fallback.frames.length - 1]
    expect(drawn.position.actionIndex).toBe(7)
    expect(drawn.selection).toEqual(current().selection)
    expect(drawn.viewport.zoom).toBe(2)
    clock.advance(1000)
    expect(fallback.frames[fallback.frames.length - 1].position.actionIndex).toBeGreaterThanOrEqual(7)
  })

  it('reports unavailable acceleration as a notice', async () => {
    const { current, renderer } = await setup()

    renderer.fail('GRAPHICS_UNAVAILABLE')

    expect(current().notices.map((n) => n.code)).toContain('GRAPHICS_UNAVAILABLE')
  })

  it('disposes the active renderer, stops the clock and completes the stream', async () => {
    const { controller, clock, fallback } = await setup()
    let completed = false
    controller.state$.subscribe({ complete: () => { completed = true } })
    controller.play()

    controller.dispose()

    expect(completed).toBe(true)
    expect(clock.tick).toBeNull()
    expect(fallback.disposed).toBe(false)
  })
})

describe('review/controller — selection', () => {
  it('selects, replaces and clears a part or an action and redraws with it', async () => {
    const { controller, current, renderer } = await setup()

    controller.select({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    expect(renderer.frames[renderer.frames.length - 1].selection).toEqual(current().selection)
    controller.select({ kind: 'action', sheetId: 'sheet-1', actionIndex: 4 })
    expect(current().selection).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: 4 })
    controller.select(null)
    expect(current().selection).toBeNull()
  })

  it('ignores a selection that does not exist', async () => {
    const { controller, current } = await setup()

    controller.select({ kind: 'part', sheetId: 'sheet-1', partKey: 'ghost#0' })
    controller.select({ kind: 'action', sheetId: 'sheet-1', actionIndex: 9999 })
    controller.select({ kind: 'part', sheetId: 'sheet-9', partKey: 'part-1#0' })

    expect(current().selection).toBeNull()
  })

  it('moves the selection through parts and actions in a stable order, wrapping around', async () => {
    const { controller, current, scene } = await setup()
    const total = scene.sheets[0].timeline?.actions.length ?? 0

    controller.moveSelection('part', 1)
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    controller.moveSelection('part', 1)
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-2#0' })
    controller.moveSelection('part', 1)
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    controller.moveSelection('part', -1)
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-2#0' })

    controller.select(null)
    controller.moveSelection('action', 1)
    expect(current().selection).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: 0 })
    controller.moveSelection('action', -1)
    expect(current().selection).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: total - 1 })
  })

  it('seeks to the selected action and ignores a part selection', async () => {
    const { controller, current } = await setup()

    controller.select({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    controller.seekToSelectedAction()
    expect(current().position.actionIndex).toBe(0)
    controller.select({ kind: 'action', sheetId: 'sheet-1', actionIndex: 6 })
    controller.seekToSelectedAction()
    expect(current().position).toEqual({ sheetId: 'sheet-1', actionIndex: 6, progress: 0 })
  })

  it('never changes the reviewed artifact', async () => {
    const { input } = await smallFixture()
    const before = structuredClone(input)
    const frozen = deepFreeze(structuredClone(input))
    const scene = buildReviewScene(frozen)
    const controller = createReviewController({ scene, renderer: new FakeRenderer('static'), clock: new FakeClock() })

    controller.select({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    controller.seekToAction(5)
    controller.select(null)

    expect(frozen).toEqual(before)
  })
})

describe('review/controller — keyboard and viewport', () => {
  const press = (controller: { handleKey(e: { key: string; shiftKey: boolean }): boolean }, key: string, shiftKey = false): boolean =>
    controller.handleKey({ key, shiftKey })

  it('plays, pauses, resets, steps and seeks with keys, returning whether the key was handled', async () => {
    const { controller, current, clock, scene } = await setup()
    const firstPierce = scene.sheets[0].timeline?.pierceIndices[0] ?? -1

    expect(press(controller, ' ')).toBe(true)
    expect(current().playing).toBe(true)
    clock.advance(500)
    expect(press(controller, ' ')).toBe(true)
    expect(current().playing).toBe(false)
    expect(press(controller, 'r')).toBe(true)
    expect(current().position.actionIndex).toBe(0)
    press(controller, 'n')
    expect(current().position.actionIndex).toBe(firstPierce)
    press(controller, '.')
    expect(current().position.actionIndex).toBe(firstPierce + 1)
    press(controller, 'PageDown')
    expect(current().position.actionIndex).toBe(firstPierce + 11)
    press(controller, ',')
    expect(current().position.actionIndex).toBe(firstPierce + 10)
    press(controller, 'Home')
    expect(current().position.actionIndex).toBe(0)
    press(controller, 'End')
    expect(current().position.actionIndex).toBeGreaterThan(20)
    expect(press(controller, 'x')).toBe(false)
  })

  it('changes speed in steps and switches sheets', async () => {
    const { controller, current } = await setup()

    press(controller, '>')
    expect(current().speed).toBe(2)
    press(controller, '<')
    press(controller, '<')
    expect(current().speed).toBe(0.5)
    press(controller, ']')
    expect(current().sheetId).toBe('sheet-2')
    press(controller, ']')
    expect(current().sheetId).toBe('sheet-2')
    press(controller, '[')
    expect(current().sheetId).toBe('sheet-1')
  })

  it('selects with arrows, seeks to the selection with Enter and clears with Escape', async () => {
    const { controller, current } = await setup()

    press(controller, 'ArrowRight')
    expect(current().selection).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    press(controller, 'ArrowDown')
    press(controller, 'ArrowDown')
    expect(current().selection).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: 1 })
    press(controller, 'Enter')
    expect(current().position.actionIndex).toBe(1)
    press(controller, 'Escape')
    expect(current().selection).toBeNull()
  })

  it('pans, zooms and resets the viewport within the sheet', async () => {
    const { controller, current } = await setup()
    const home = current().viewport

    expect(home).toEqual({ center: { x: 50, y: 50 }, zoom: 1 })
    press(controller, '+')
    expect(current().viewport.zoom).toBeCloseTo(1.25)
    press(controller, 'ArrowRight', true)
    expect(current().viewport.center.x).toBeGreaterThan(50)
    for (let step = 0; step < 100; step += 1) press(controller, 'ArrowRight', true)
    expect(current().viewport.center.x).toBeLessThanOrEqual(100)
    press(controller, '-')
    press(controller, '-')
    expect(current().viewport.zoom).toBeGreaterThanOrEqual(0.5)
    press(controller, '0')
    expect(current().viewport).toEqual(home)
  })

  it('resets the viewport when the sheet changes', async () => {
    const { controller, current } = await setup()
    press(controller, '+')

    controller.selectSheet('sheet-2')

    expect(current().viewport.zoom).toBe(1)
  })
})
