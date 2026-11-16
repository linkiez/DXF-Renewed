import { messages } from './messages'
import { text } from './panelText'

/** Collapsible list of keyboard shortcuts. */
export function shortcutsPanel(doc: Document): HTMLElement {
  const details = doc.createElement('details')
  details.appendChild(text(doc, 'summary', messages.panels.shortcuts))
  const list = doc.createElement('ul')
  for (const line of messages.shortcutLines) list.appendChild(text(doc, 'li', line))
  details.appendChild(list)
  return details
}
