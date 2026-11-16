import { messages } from './messages'
import { text } from './panelText'
import type { ReviewNotice } from './types'

/** Notices list inside an aside; always present so the absence of notices is explicit. */
export function noticesPanel(doc: Document, notices: readonly ReviewNotice[]): HTMLElement {
  const aside = doc.createElement('aside')
  aside.setAttribute('aria-label', messages.panels.notices)
  aside.appendChild(text(doc, 'h2', messages.panels.notices))
  if (notices.length === 0) {
    aside.appendChild(text(doc, 'p', messages.panels.noNotices))
    return aside
  }
  const list = doc.createElement('ul')
  for (const notice of notices) {
    const item = doc.createElement('li')
    item.dataset.severity = notice.severity
    item.dataset.code = notice.code
    item.textContent = `${notice.code}: ${notice.message}`
    list.appendChild(item)
  }
  aside.appendChild(list)
  return aside
}
