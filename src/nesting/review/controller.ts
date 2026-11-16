import { BehaviorSubject } from 'rxjs'
import { distanceAtPosition } from './distanceAtPosition'
import { graphicsNotice } from './graphicsNotice'
import { keyCommand } from './keyMap'
import type { ReviewCommand } from './keyMap'
import { sameState } from './sameState'
import { nextPierce } from './nextPierce'
import { positionAtDistance } from './positionAtDistance'
import type {
  ReviewClock,
  ReviewController,
  ReviewNotice,
  ReviewPosition,
  ReviewRenderer,
  ReviewScene,
  ReviewSelection,
  ReviewState,
  ReviewTimeline,
  ReviewViewport,
} from './types'

/** Collaborators of a review controller. */
export interface ReviewControllerOptions {
  scene: ReviewScene
  /** Renderer in use; replaced by `fallback` when it reports a failure. */
  renderer: ReviewRenderer
  /** Static renderer taking over after an accelerated renderer fails. */
  fallback?: ReviewRenderer
  clock: ReviewClock
  /** Notices raised before the session started, shown with the scene notices. */
  notices?: readonly ReviewNotice[]
  /** State to restore when the session replaces an earlier one, such as after an edit. */
  initial?: { sheetId?: string; viewport?: ReviewViewport; selection?: ReviewSelection | null }
}

const SECONDS_FOR_FULL_PLAN = 60
const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16]
const MIN_ZOOM = 0.5
const MAX_ZOOM = 32
const VIEW_MARGIN = 1.08
const MIN_SPEED = 0.1
const MAX_SPEED = 64
const BELOW_ONE = 1 - 1e-9

const selectedId = (selection: ReviewSelection | null, kind: 'part' | 'action'): string | number | undefined => {
  if (selection?.kind !== kind) return undefined
  return selection.kind === 'part' ? selection.partKey : selection.actionIndex
}

/**
 * Creates the controller of one review session.
 *
 * Playback never starts on its own. Time comes only from the injected clock; the displayed state
 * is always a pure function of the position, so playing, seeking and stepping agree.
 *
 * @param options - Scene, renderer, optional static fallback and clock.
 * @returns Controller whose `state$` emits whenever the state changes.
 * @example
 * ```typescript
 * const controller = createReviewController({ scene, renderer, fallback, clock })
 * controller.seekToAction(12)
 * ```
 */
export function createReviewController(options: ReviewControllerOptions): ReviewController {
  const { scene, clock } = options
  let active: ReviewRenderer | null = options.renderer
  const wanted = options.initial?.sheetId
  const first = scene.sheets.find((sheet) => sheet.id === wanted) ?? scene.sheets[0]
  const initialSheet = first?.id ?? ''
  const viewportOf = (sheetId: string): ReviewViewport => {
    const stock = scene.sheets.find((sheet) => sheet.id === sheetId)?.stock
    return { center: { x: (stock?.width ?? 0) / 2, y: (stock?.height ?? 0) / 2 }, zoom: 1 }
  }
  const timelineOf = (sheetId: string): ReviewTimeline | undefined =>
    scene.sheets.find((sheet) => sheet.id === sheetId)?.timeline

  const subject = new BehaviorSubject<ReviewState>({
    position: { sheetId: initialSheet, actionIndex: 0, progress: 0 },
    playing: false,
    speed: 1,
    sheetId: initialSheet,
    selection: null,
    viewport: options.initial?.viewport ?? viewportOf(initialSheet),
    renderer: options.renderer.kind,
    notices: [...scene.notices, ...(options.notices ?? [])],
  })
  let distance = 0
  let lastNow = 0
  let cancelTick: (() => void) | null = null

  const draw = (state: ReviewState): void => {
    active?.render({
      scene,
      sheetId: state.sheetId,
      position: state.position,
      selection: state.selection,
      viewport: state.viewport,
    })
  }

  const emit = (patch: Partial<ReviewState>): void => {
    const current = subject.value
    const next = { ...current, ...patch }
    if (sameState(current, next)) return
    subject.next(next)
    draw(next)
  }

  const stopTick = (): void => {
    cancelTick?.()
    cancelTick = null
  }

  const finish = (timeline: ReviewTimeline): void => {
    stopTick()
    emit({
      position: { sheetId: subject.value.sheetId, actionIndex: timeline.actions.length, progress: 0 },
      playing: false,
    })
  }

  const onTick = (now: number): void => {
    const state = subject.value
    const timeline = timelineOf(state.sheetId)
    if (!timeline) return
    const seconds = Math.max(0, now - lastNow) / 1000
    lastNow = now
    distance += (Math.max(timeline.playTotal / SECONDS_FOR_FULL_PLAN, 1)) * state.speed * seconds
    if (distance >= timeline.playTotal) {
      finish(timeline)
      return
    }
    emit({ position: positionAtDistance(timeline, state.sheetId, distance) })
  }

  options.renderer.onFailure((code) => {
    options.renderer.dispose()
    active = options.fallback ?? null
    const state = subject.value
    emit({ renderer: 'static', notices: [...state.notices, graphicsNotice(code)] })
    if (active) draw(subject.value)
  })

  const seek = (position: ReviewPosition): void => {
    const timeline = timelineOf(position.sheetId)
    if (!scene.sheets.some((sheet) => sheet.id === position.sheetId)) return
    const count = timeline?.actions.length ?? 0
    const index = Math.min(count, Math.max(0, Math.trunc(position.actionIndex)))
    const progress = index >= count ? 0 : Math.min(Math.max(position.progress, 0), BELOW_ONE)
    const target = { sheetId: position.sheetId, actionIndex: index, progress }
    distance = timeline ? distanceAtPosition(timeline, target) : 0
    const switched = position.sheetId !== subject.value.sheetId
    emit({
      position: target,
      sheetId: target.sheetId,
      ...(switched ? { selection: null, viewport: viewportOf(target.sheetId) } : {}),
    })
  }

  const select = (selection: ReviewSelection | null): void => {
    if (selection === null) {
      emit({ selection: null })
      return
    }
    const sheet = scene.sheets.find((candidate) => candidate.id === selection.sheetId)
    if (!sheet || selection.sheetId !== subject.value.sheetId) return
    const exists = selection.kind === 'part'
      ? sheet.parts.some((part) => part.key === selection.partKey)
      : selection.actionIndex >= 0 && selection.actionIndex < (sheet.timeline?.actions.length ?? 0)
    if (exists) emit({ selection })
  }

  const actionCount = (): number => timelineOf(subject.value.sheetId)?.actions.length ?? 0

  const selectableIds = (kind: 'part' | 'action', sheetId: string): (string | number)[] => {
    const sheet = scene.sheets.find((candidate) => candidate.id === sheetId)
    return kind === 'part'
      ? (sheet?.parts.map((part) => part.key) ?? [])
      : Array.from({ length: sheet?.timeline?.actions.length ?? 0 }, (_, index) => index)
  }

  const stepSpeed = (direction: 1 | -1): void => {
    const speed = subject.value.speed
    const nearest = SPEEDS.reduce((best, value, index) => (Math.abs(value - speed) < Math.abs(SPEEDS[best] - speed) ? index : best), 0)
    controller.setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, nearest + direction))])
  }

  const neighbourSheet = (delta: 1 | -1): void => {
    const ids = scene.sheets.map((sheet) => sheet.id)
    const target = ids[ids.indexOf(subject.value.sheetId) + delta]
    if (target !== undefined) controller.selectSheet(target)
  }

  const handlers: { [K in ReviewCommand['type']]: (command: Extract<ReviewCommand, { type: K }>) => void } = {
    togglePlay: () => (subject.value.playing ? controller.pause() : controller.play()),
    reset: () => controller.reset(),
    nextPierce: () => controller.stepToNextPierce(),
    slower: () => stepSpeed(-1),
    faster: () => stepSpeed(1),
    sheet: (command) => neighbourSheet(command.delta),
    seekBy: (command) => controller.seekBy(command.delta),
    seekEdge: (command) => controller.seekToAction(command.edge === 'start' ? 0 : actionCount()),
    moveSelection: (command) => controller.moveSelection(command.kind, command.delta),
    seekSelected: () => controller.seekToSelectedAction(),
    clearSelection: () => select(null),
    pan: (command) => controller.pan(command.dx, command.dy),
    zoom: (command) => controller.zoomBy(command.factor),
    resetView: () => controller.resetViewport(),
  }

  const controller: ReviewController = {
    state$: subject.asObservable(),
    play() {
      const state = subject.value
      const timeline = timelineOf(state.sheetId)
      if (state.playing || !timeline || timeline.actions.length === 0) return
      if (state.position.actionIndex >= timeline.actions.length) seek({ sheetId: state.sheetId, actionIndex: 0, progress: 0 })
      lastNow = clock.now()
      cancelTick = clock.schedule(onTick)
      emit({ playing: true })
    },
    pause() {
      stopTick()
      emit({ playing: false })
    },
    reset() {
      stopTick()
      emit({ playing: false })
      seek({ sheetId: subject.value.sheetId, actionIndex: 0, progress: 0 })
    },
    setSpeed(speed) {
      if (!Number.isFinite(speed)) return
      emit({ speed: Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed)) })
    },
    stepToNextPierce() {
      const state = subject.value
      const timeline = timelineOf(state.sheetId)
      const next = nextPierce(scene, state.position)
      seek(next ?? { sheetId: state.sheetId, actionIndex: timeline?.actions.length ?? 0, progress: 0 })
    },
    seek,
    seekToAction(actionIndex) {
      seek({ sheetId: subject.value.sheetId, actionIndex, progress: 0 })
    },
    seekBy(actions) {
      const state = subject.value
      seek({ sheetId: state.sheetId, actionIndex: state.position.actionIndex + actions, progress: 0 })
    },
    selectSheet(sheetId) {
      if (sheetId === subject.value.sheetId || !scene.sheets.some((sheet) => sheet.id === sheetId)) return
      stopTick()
      distance = 0
      emit({
        sheetId,
        position: { sheetId, actionIndex: 0, progress: 0 },
        playing: false,
        selection: null,
        viewport: viewportOf(sheetId),
      })
    },
    select,
    pan(dx, dy) {
      const state = subject.value
      const stock = scene.sheets.find((sheet) => sheet.id === state.sheetId)?.stock
      if (!stock) return
      const { center, zoom } = state.viewport
      emit({
        viewport: {
          zoom,
          center: {
            x: Math.min(stock.width, Math.max(0, center.x + (dx * stock.width * VIEW_MARGIN) / zoom)),
            y: Math.min(stock.height, Math.max(0, center.y + (dy * stock.height * VIEW_MARGIN) / zoom)),
          },
        },
      })
    },
    zoomBy(factor) {
      const { center, zoom } = subject.value.viewport
      if (!Number.isFinite(factor) || factor <= 0) return
      emit({ viewport: { center, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor)) } })
    },
    resetViewport() {
      emit({ viewport: viewportOf(subject.value.sheetId) })
    },
    handleKey(event) {
      const command = keyCommand(event)
      if (!command) return false
      ;(handlers[command.type] as (command: ReviewCommand) => void)(command)
      return true
    },
    moveSelection(kind, delta) {
      const state = subject.value
      const ids = selectableIds(kind, state.sheetId)
      if (ids.length === 0) return
      const at = ids.indexOf(selectedId(state.selection, kind) as string | number)
      const next = at === -1 ? (delta > 0 ? 0 : ids.length - 1) : (at + delta + ids.length) % ids.length
      select(kind === 'part'
        ? { kind, sheetId: state.sheetId, partKey: ids[next] as string }
        : { kind, sheetId: state.sheetId, actionIndex: ids[next] as number })
    },
    seekToSelectedAction() {
      const selected = subject.value.selection
      if (selected?.kind === 'action') {
        seek({ sheetId: selected.sheetId, actionIndex: selected.actionIndex, progress: 0 })
      }
    },
    dispose() {
      stopTick()
      subject.complete()
      active?.dispose()
      active = null
    },
  }

  if (options.initial?.selection) select(options.initial.selection)
  draw(subject.value)
  return controller
}
