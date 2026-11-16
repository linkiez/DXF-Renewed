import { inspect } from './inspect'
import { messages } from './messages'
import { text } from './panelText'
import type { ReviewController, ReviewScene, ReviewState } from './types'

/** Inspector content and the function that keeps it in sync with the selection. */
export interface InspectorHandle {
  element: HTMLElement
  update(state: ReviewState): void
}

/**
 * Inspector for the selected part or action, with a button that clears the selection.
 *
 * @param doc - Owner document.
 * @param scene - Review scene.
 * @param controller - Controller whose selection is shown and cleared.
 * @returns The inspector element and an `update` function for state changes.
 */
export function inspectorPanel(doc: Document, scene: ReviewScene, controller: ReviewController): InspectorHandle {
  const aside = doc.createElement('aside')
  aside.setAttribute('aria-label', messages.panels.inspector)
  const heading = text(doc, 'h2', messages.panels.inspector)
  const body = doc.createElement('div')
  aside.append(heading, body)
  return {
    element: aside,
    update(state) {
      body.replaceChildren()
      if (!state.selection) {
        body.appendChild(text(doc, 'p', messages.panels.nothingSelected))
        return
      }
      const inspection = inspect(scene, state.selection)
      body.appendChild(text(doc, 'h3', inspection.title))
      const list = doc.createElement('dl')
      for (const row of inspection.rows) {
        list.appendChild(text(doc, 'dt', row.label))
        list.appendChild(text(doc, 'dd', row.value))
      }
      body.appendChild(list)
      if (inspection.notices.length > 0) {
        const notices = doc.createElement('ul')
        for (const notice of inspection.notices) {
          const item = text(doc, 'li', `${notice.code}: ${notice.message}`)
          item.dataset.severity = notice.severity
          notices.appendChild(item)
        }
        body.appendChild(notices)
      }
      const clear = doc.createElement('button')
      clear.type = 'button'
      clear.textContent = messages.controls.clearSelection
      clear.addEventListener('click', () => controller.select(null))
      body.appendChild(clear)
    },
  }
}
