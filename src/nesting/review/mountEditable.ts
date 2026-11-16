import { createEditHandle } from './editCommands'
import { editKeyCommand } from './editKeyMap'
import type { EditCommand } from './editKeyMap'
import { attachDrag } from './attachDrag'
import type { ReviewControllerOptions } from './controller'
import { editPanel } from './editPanel'
import { createRiskView } from './createRiskView'
import { createOverlayHub } from './overlayHub'
import { populateReview } from './populateReview'
import type { PopulatedReview } from './populateReview'
import type { CandidateEdit } from '../edit/types'
import type {
  EditPanelState, ReviewController, ReviewEditHandle, ReviewInput, ReviewMountOptions, ReviewScene, ReviewState,
} from './types'

const DEFAULT_STEP = { move: 1, rotate: 15 }

/** An editable review mounted into a root element. */
export interface EditableMount {
  scene(): ReviewScene
  controller(): ReviewController | null
  edit: ReviewEditHandle
  dispose(): void
}

const targetsView = (event: KeyboardEvent): boolean => event.target instanceof HTMLElement && event.target.closest('[data-review-view]') !== null

const candidateFor = (command: EditCommand, partKey: string, previous: CandidateEdit | null): CandidateEdit | null => {
  if (command.type === 'nudge') {
    const base = previous?.kind === 'move' ? previous.delta : { dx: 0, dy: 0 }
    return { partKey, kind: 'move', delta: { dx: base.dx + command.dx, dy: base.dy + command.dy } }
  }
  if (command.type === 'rotate') {
    const base = previous?.kind === 'rotate' ? previous.delta.degrees : 0
    return { partKey, kind: 'rotate', delta: { degrees: base + command.degrees } }
  }
  return command.type === 'mirror' ? { partKey, kind: 'mirror' } : null
}

const restoreOf = (state: ReviewState | null): ReviewControllerOptions['initial'] =>
  state ? { sheetId: state.sheetId, viewport: state.viewport, selection: state.selection } : undefined

const holdsFocus = (doc: Document, view: HTMLElement | null | undefined): boolean =>
  doc.activeElement !== null && view?.contains(doc.activeElement) === true

const needsPart = (command: EditCommand): boolean => command.type === 'nudge' || command.type === 'rotate' || command.type === 'mirror'

const runEditCommand = (handle: ReviewEditHandle, state: EditPanelState, command: EditCommand): boolean => {
  if (!state.activePart && needsPart(command)) return false
  const direct: Partial<Record<EditCommand['type'], () => void>> = {
    confirm: () => handle.confirm(),
    cancel: () => handle.cancel(),
    undo: () => handle.undo(),
    redo: () => handle.redo(),
  }
  const run = direct[command.type]
  if (run) run()
  else handle.propose(candidateFor(command, state.activePart as string, state.candidate))
  return true
}

/**
 * Mounts a review whose parts can be repositioned.
 *
 * The edit panel stays in place while the rest of the review is rebuilt from the edited scene after
 * every confirmed edit, undo or redo, keeping the sheet, the selection and the viewport. A confirmed
 * edit leaves the review without the old cut path until the plan is recomputed.
 *
 * @param root - Review root element.
 * @param input - Artifact plus optional cut layout and cut plan.
 * @param options - Mount options with the `edit` options.
 * @returns Accessors for the current scene and controller, the edit handle and a dispose function.
 */
export async function mountEditable(root: HTMLElement, input: ReviewInput, options: ReviewMountOptions): Promise<EditableMount> {
  const doc = root.ownerDocument
  const editOptions = options.edit ?? {}
  const step = editOptions.step ?? DEFAULT_STEP
  let current: PopulatedReview | null = null
  let latest: { state: ReviewState | null } = { state: null }
  let subscription: { unsubscribe(): void } | null = null
  let chain: Promise<void> = Promise.resolve()
  let panelState: EditPanelState | null = null

  const hub = createOverlayHub((overlay) => current?.renderers?.active.overlay?.(overlay))
  const risk = options.risk ? createRiskView(doc, hub, () => current) : null
  const panelRef: { current: ReturnType<typeof editPanel> | null } = { current: null }
  const processProfile = editOptions.recompute?.processProfile ?? options.risk?.processProfile
  const handle = createEditHandle({
    input: { artifact: input.artifact, layout: input.layout, cutPlan: input.cutPlan, constraints: editOptions.constraints },
    recompute: processProfile
      ? { processProfile, costModel: editOptions.recompute?.costModel ?? options.risk?.costModel, riskProfile: options.risk?.profile }
      : undefined,
    onScene: (next) => schedule(next),
    onOverlay: (overlay) => hub.setGhost(overlay),
    onAnnounce: (message) => panelRef.current?.announce(message),
  })
  const panel = editPanel(doc, {
    handle,
    onSelectPart: (partKey) => {
      const sheetId = latest.state?.sheetId
      if (sheetId && partKey) current?.controller?.select({ kind: 'part', sheetId, partKey })
      handle.selectPart(partKey)
    },
  })
  panelRef.current = panel
  root.appendChild(panel.element)
  if (risk) root.appendChild(risk.element)
  handle.edit$.subscribe((state) => {
    panelState = state
    panel.update(state)
    risk?.update(state.risk, state.freshness.risk === 'outdated', state.riskRequest)
    editOptions.onChange?.(state)
  })

  const connect = (populated: PopulatedReview, focused: boolean): void => {
    const { controller, view, renderers } = populated
    if (!controller || !view || !renderers) return
    subscription = controller.state$.subscribe((state) => {
      latest.state = state
      if (state.selection?.kind === 'part' && state.selection.partKey !== panelState?.activePart) handle.selectPart(state.selection.partKey)
    })
    attachDrag({ view, scene: populated.scene, controller, renderers, latest, handle, editing: () => panelState?.mode === 'edit' })
    if (focused) view.focus()
  }

  const build = async (next: ReviewInput): Promise<void> => {
    const restore = restoreOf(latest.state)
    const focused = holdsFocus(doc, current?.view)
    subscription?.unsubscribe()
    current?.stop()
    for (const child of [...root.children]) if (child !== panel.element && child !== risk?.element) child.remove()
    latest = { state: null }
    current = await populateReview(root, next, options, restore)
    connect(current, focused)
    risk?.bind(current)
    hub.redraw()
    panel.setParts(current.scene.sheets.flatMap((sheet) => sheet.parts.map((part) => part.key)))
    if (panelState) panel.update(panelState)
  }
  function schedule(next: ReviewInput): void {
    chain = chain.then(() => build(next))
  }

  root.addEventListener('keydown', (event) => {
    const state = panelState
    if (state?.mode !== 'edit' || !targetsView(event)) return
    const command = editKeyCommand({ key: event.key, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey || event.metaKey }, step)
    if (!command || !runEditCommand(handle, state, command)) return
    event.preventDefault()
    event.stopPropagation()
  }, true)

  await build(input)
  return {
    scene: () => (current as PopulatedReview).scene,
    controller: () => current?.controller ?? null,
    edit: handle,
    dispose: () => {
      subscription?.unsubscribe()
      current?.stop()
      handle.dispose()
    },
  }
}
