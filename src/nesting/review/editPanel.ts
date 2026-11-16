import type { CandidateEdit } from '../edit/types'
import { messages } from './messages'
import { text } from './panelText'
import type { EditPanelState, ReviewEditHandle } from './types'

/** Handle of the edit panel. */
export interface EditPanelHandle {
  readonly element: HTMLElement
  update(state: EditPanelState): void
  /** Replaces the parts that can be chosen for editing. */
  setParts(keys: readonly string[]): void
  /** Writes a text to the live region of the panel. */
  announce(message: string): void
}

/** What the edit panel needs from the review. */
export interface EditPanelDeps {
  handle: ReviewEditHandle
  /** Selects the part in the review, which makes it the part in edit. */
  onSelectPart(partKey: string | null): void
}

type Kind = CandidateEdit['kind']

const button = (doc: Document, label: string, onClick: () => void, name: string): HTMLButtonElement => {
  const element = doc.createElement('button')
  element.type = 'button'
  element.textContent = label
  element.dataset.edit = name
  element.addEventListener('click', onClick)
  return element
}

const numberField = (doc: Document, label: string, name: string): { wrapper: HTMLLabelElement; input: HTMLInputElement } => {
  const wrapper = doc.createElement('label')
  wrapper.append(`${label} `)
  const input = doc.createElement('input')
  input.type = 'number'
  input.step = 'any'
  input.value = '0'
  input.dataset.editField = name
  wrapper.appendChild(input)
  return { wrapper, input }
}

const kindSelect = (doc: Document): HTMLSelectElement => {
  const select = doc.createElement('select')
  select.dataset.editKind = ''
  for (const [value, label] of [['move', messages.edit.move], ['rotate', messages.edit.rotate], ['mirror', messages.edit.mirror]]) {
    const option = doc.createElement('option')
    option.value = value
    option.textContent = label
    select.appendChild(option)
  }
  return select
}

/**
 * Builds the edit panel: a toggle, the part and kind pickers, numeric fields, the confirm, cancel,
 * undo and redo buttons, the verdict with every violation in text, the freshness of the derived
 * results and a live region.
 *
 * @param doc - Document that owns the elements.
 * @param deps - Edit handle and part selection callback.
 * @returns The panel element and the functions that keep it in sync.
 */
export function editPanel(doc: Document, deps: EditPanelDeps): EditPanelHandle {
  const { handle } = deps
  const section = doc.createElement('section')
  section.setAttribute('aria-label', messages.edit.panel)
  section.dataset.reviewEdit = ''
  section.appendChild(text(doc, 'h2', messages.edit.panel))

  let mode: EditPanelState['mode'] = 'off'
  const toggle = button(doc, messages.edit.enter, () => (mode === 'edit' ? handle.leave() : handle.enter()), 'toggle')
  const controls = doc.createElement('div')
  controls.hidden = true
  const partSelect = doc.createElement('select')
  partSelect.dataset.editPart = ''
  partSelect.addEventListener('change', () => deps.onSelectPart(partSelect.value || null))
  const partLabel = doc.createElement('label')
  partLabel.append(`${messages.edit.part} `, partSelect)
  const kind = kindSelect(doc)
  const kindLabel = doc.createElement('label')
  kindLabel.append(`${messages.edit.kind} `, kind)
  const dx = numberField(doc, messages.edit.dx, 'dx')
  const dy = numberField(doc, messages.edit.dy, 'dy')
  const degrees = numberField(doc, messages.edit.degrees, 'degrees')

  let activePart: string | null = null
  const candidate = (): CandidateEdit | null => {
    if (!activePart) return null
    const chosen = kind.value as Kind
    if (chosen === 'mirror') return { partKey: activePart, kind: 'mirror' }
    if (chosen === 'rotate') return { partKey: activePart, kind: 'rotate', delta: { degrees: Number(degrees.input.value) } }
    return { partKey: activePart, kind: 'move', delta: { dx: Number(dx.input.value), dy: Number(dy.input.value) } }
  }
  const propose = button(doc, messages.edit.propose, () => handle.propose(candidate()), 'propose')
  const confirm = button(doc, messages.edit.confirm, () => handle.confirm(), 'confirm')
  const cancel = button(doc, messages.edit.cancel, () => handle.cancel(), 'cancel')
  const recompute = button(doc, messages.edit.recompute, () => handle.recompute(), 'recompute')
  const undo = button(doc, messages.edit.undo, () => handle.undo(), 'undo')
  const redo = button(doc, messages.edit.redo, () => handle.redo(), 'redo')
  const verdict = doc.createElement('div')
  verdict.dataset.editVerdict = ''
  const comparison = doc.createElement('div')
  comparison.dataset.editComparison = ''
  const notices = doc.createElement('ul')
  notices.dataset.editNotices = ''
  const freshness = doc.createElement('ul')
  freshness.dataset.editFreshness = ''
  const planNote = text(doc, 'p', messages.edit.planOutdated)
  planNote.dataset.editPlanOutdated = ''
  const noPart = text(doc, 'p', messages.edit.noPart)
  const shortcuts = text(doc, 'p', messages.edit.shortcuts)
  const status = doc.createElement('p')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.dataset.editStatus = ''

  controls.append(partLabel, noPart, kindLabel, dx.wrapper, dy.wrapper, degrees.wrapper, propose, confirm, cancel, undo, redo, recompute, verdict, planNote, freshness, comparison, notices, shortcuts)
  section.append(toggle, controls, status)

  const renderVerdict = (state: EditPanelState): void => {
    verdict.replaceChildren()
    if (!state.verdict) return
    verdict.appendChild(text(doc, 'p', state.verdict.valid ? messages.edit.verdictValid : messages.edit.verdictInvalid))
    if (state.verdict.violations.length === 0) return
    const list = doc.createElement('ul')
    for (const violation of state.verdict.violations) {
      const item = text(doc, 'li', violation.message)
      item.dataset.violation = violation.code
      list.appendChild(item)
    }
    verdict.appendChild(list)
  }

  const renderComparison = (state: EditPanelState): void => {
    comparison.replaceChildren()
    if (!state.comparison) return
    comparison.appendChild(text(doc, 'h3', messages.edit.comparison))
    const list = doc.createElement('ul')
    const entries: [string, { before: number | null; after: number | null; delta: number | null }][] = [
      ['invalidParts', state.comparison.invalidParts], ['cutSeconds', state.comparison.cutSeconds], ['cost', state.comparison.cost],
      ...(Object.entries(state.comparison.risk) as [string, { before: number | null; after: number | null; delta: number | null }][]),
    ]
    for (const [name, value] of entries) list.appendChild(text(doc, 'li', messages.edit.figureLine(messages.edit.figureLabels[name], value.before, value.after, value.delta)))
    comparison.appendChild(list)
  }

  return {
    element: section,
    update(state) {
      mode = state.mode
      activePart = state.activePart
      toggle.textContent = state.mode === 'edit' ? messages.edit.leave : messages.edit.enter
      controls.hidden = state.mode !== 'edit'
      noPart.hidden = state.activePart !== null
      partSelect.value = state.activePart ?? ''
      confirm.disabled = !state.verdict?.valid
      cancel.disabled = state.candidate === null
      propose.disabled = state.activePart === null
      recompute.disabled = state.recomputing
      undo.disabled = !state.canUndo
      redo.disabled = !state.canRedo
      planNote.hidden = state.planVisible
      renderVerdict(state)
      renderComparison(state)
      notices.replaceChildren(...state.notices.map((item) => text(doc, 'li', item.message)))
      freshness.replaceChildren(...(Object.keys(state.freshness) as (keyof typeof state.freshness)[]).map((name) =>
        text(doc, 'li', messages.edit.freshnessLabel(name, state.freshness[name]))))
    },
    setParts(keys) {
      const empty = doc.createElement('option')
      empty.value = ''
      empty.textContent = '—'
      partSelect.replaceChildren(empty, ...keys.map((key) => {
        const option = doc.createElement('option')
        option.value = key
        option.textContent = key
        return option
      }))
      partSelect.value = activePart ?? ''
    },
    announce(message) {
      status.textContent = message
    },
  }
}
