import { messages } from './messages'
import { text } from './panelText'

/** Written summary of the scene, always present beside the visual view. */
export function summaryPanel(doc: Document, summary: string): HTMLElement {
  const section = doc.createElement('section')
  section.setAttribute('aria-label', messages.panels.summary)
  section.appendChild(text(doc, 'h2', messages.panels.summary))
  section.appendChild(text(doc, 'p', summary))
  return section
}
