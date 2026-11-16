import { messages } from './messages'
import { text } from './panelText'
import type { ReviewIdentity } from './types'

/** Identity of the reviewed artifact as a description list inside a header. */
export function identityPanel(doc: Document, identity: ReviewIdentity | null): HTMLElement {
  const header = doc.createElement('header')
  header.setAttribute('aria-label', messages.panels.identity)
  header.appendChild(text(doc, 'h2', messages.panels.identity))
  if (!identity) return header
  const list = doc.createElement('dl')
  const rows: [string, string][] = [
    [messages.identityLabels.status, identity.status],
    [messages.identityLabels.contractVersion, String(identity.contractVersion)],
    [messages.identityLabels.order, identity.correlation.orderId],
    [messages.identityLabels.revision, identity.correlation.revisionId],
    [messages.identityLabels.request, identity.correlation.requestId],
    [messages.identityLabels.inputDigest, identity.inputDigest.value],
    [messages.identityLabels.outputDigest, identity.outputDigest.value],
  ]
  for (const [label, value] of rows) {
    list.appendChild(text(doc, 'dt', label))
    const definition = doc.createElement('dd')
    definition.appendChild(text(doc, 'code', value))
    list.appendChild(definition)
  }
  header.appendChild(list)
  return header
}
