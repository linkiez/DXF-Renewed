import type { RiskFinding, RiskResult } from '../risk/types'
import { messages } from './messages'
import { text } from './panelText'

/** Handle of the risk panel. */
export interface RiskPanelHandle {
  readonly element: HTMLElement
  /** Shows a result; `null` with `outdated` true says the risk must be recomputed. */
  update(result: RiskResult | null, outdated: boolean): void
  /** Shows the maximum heat of the displayed moment as text; `null` hides the line. */
  setHeat(text: string | null): void
}

/** What the panel asks the review to do. */
export interface RiskPanelActions {
  /** Seeks to the finding and selects what it concerns. */
  onSeek(finding: RiskFinding): void
  /** Turns the accumulated heat layer on or off. */
  onHeat(on: boolean): void
}

const row = (doc: Document, label: string, value: string): DocumentFragment => {
  const fragment = doc.createDocumentFragment()
  fragment.append(text(doc, 'dt', label), text(doc, 'dd', value))
  return fragment
}

const locationOf = (finding: RiskFinding): string => {
  if (finding.region) return `${finding.region.x.toFixed(1)}; ${finding.region.y.toFixed(1)} (raio ${finding.region.radius.toFixed(1)})`
  return [finding.partKey, finding.otherPartKey].filter(Boolean).join(' / ')
}

const seekButton = (doc: Document, finding: RiskFinding, label: string, actions: RiskPanelActions): HTMLButtonElement => {
  const button = doc.createElement('button')
  button.type = 'button'
  button.dataset.riskMarker = finding.id
  button.textContent = label
  button.addEventListener('click', () => actions.onSeek(finding))
  return button
}

const findingItem = (doc: Document, finding: RiskFinding): HTMLElement => {
  const item = doc.createElement('li')
  item.dataset.riskFinding = finding.id
  item.dataset.severity = finding.severity
  item.dataset.category = finding.category
  item.appendChild(text(doc, 'strong', `${messages.risk.severityLabel(finding.severity)} — ${messages.risk.categoryLabel(finding.category)}`))
  item.appendChild(text(doc, 'p', finding.message))
  const details = doc.createElement('dl')
  const where = locationOf(finding)
  if (where) details.appendChild(row(doc, finding.region ? messages.risk.labels.region : messages.risk.labels.part, where))
  details.appendChild(row(doc, messages.risk.labels.moment, messages.risk.moment(finding.actionIndex, finding.planSeconds)))
  details.appendChild(row(doc, messages.risk.labels.measured, `${finding.measured} ${finding.unit}`))
  details.appendChild(row(doc, messages.risk.labels.limit, `${finding.limit} ${finding.unit}`))
  item.appendChild(details)
  item.appendChild(text(doc, 'p', `${messages.risk.labels.mitigation}: ${finding.mitigation}`))
  return item
}

const timeline = (doc: Document, findings: readonly RiskFinding[], actions: RiskPanelActions): HTMLElement => {
  const list = doc.createElement('ol')
  list.dataset.riskTimeline = ''
  list.setAttribute('aria-label', messages.risk.timeline)
  const ordered = [...findings].sort((a, b) => (a.actionIndex ?? 0) - (b.actionIndex ?? 0) || a.id.localeCompare(b.id))
  for (const finding of ordered) {
    const item = doc.createElement('li')
    const label = `${messages.risk.goTo}: ${messages.risk.severityLabel(finding.severity)} — ${messages.risk.categoryLabel(finding.category)}, ${messages.risk.moment(finding.actionIndex, finding.planSeconds)}`
    item.appendChild(seekButton(doc, finding, label, actions))
    list.appendChild(item)
  }
  return list
}

/**
 * Builds the risk panel: the statement that the result is indicative, how many rules were assessed,
 * each finding with its category, severity in text, part or region, moment, measured value, limit,
 * reason and mitigation suggestion, the timeline markers that jump to each finding, the heat toggle
 * and the rules that could not be assessed with the missing input.
 *
 * @param doc - Document that owns the elements.
 * @param actions - What the panel asks the review to do.
 * @returns The panel element and its update functions.
 */
export function riskPanel(doc: Document, actions: RiskPanelActions): RiskPanelHandle {
  const section = doc.createElement('section')
  section.setAttribute('aria-label', messages.risk.panel)
  section.dataset.reviewRisk = ''
  const body = doc.createElement('div')
  const heat = doc.createElement('p')
  heat.dataset.riskHeat = ''
  heat.hidden = true
  const toggle = doc.createElement('label')
  const checkbox = doc.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.dataset.riskHeatToggle = ''
  checkbox.addEventListener('change', () => actions.onHeat(checkbox.checked))
  toggle.append(checkbox, ` ${messages.risk.showHeat}`)
  const status = doc.createElement('p')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.dataset.riskStatus = ''
  section.append(text(doc, 'h2', messages.risk.panel), toggle, heat, body, status)
  let announced: number | null = null
  const notify = (count: number | null): void => {
    if (count !== announced && count !== null) status.textContent = messages.risk.announceFindings(count)
    announced = count
  }
  return {
    element: section,
    update(result, outdated) {
      body.replaceChildren(text(doc, 'p', messages.risk.indicative()))
      body.firstElementChild?.setAttribute('data-risk-indicative', '')
      if (outdated || !result || result.status === 'unavailable') {
        const note = text(doc, 'p', outdated ? messages.risk.outdated : messages.risk.unavailable)
        note.dataset.riskNote = outdated ? 'outdated' : 'unavailable'
        body.appendChild(note)
        if (outdated) status.textContent = messages.risk.outdated
        announced = null
        return
      }
      const assessed = result.rules.filter((rule) => rule.assessable).length
      body.appendChild(text(doc, 'p', messages.risk.summary(assessed, result.rules.length)))
      if (result.findings.length === 0) body.appendChild(text(doc, 'p', messages.risk.noFindings))
      const list = doc.createElement('ul')
      list.dataset.riskFindings = ''
      list.append(...result.findings.map((finding) => findingItem(doc, finding)))
      const rules = doc.createElement('ul')
      rules.dataset.riskRules = ''
      rules.append(...result.rules.filter((rule) => !rule.assessable).map((rule) => text(doc, 'li', messages.risk.notAssessable(rule.category, rule.missing))))
      body.append(list, timeline(doc, result.findings, actions), rules)
      notify(result.findings.length)
    },
    setHeat(message) {
      heat.hidden = message === null
      heat.textContent = message ?? ''
    },
  }
}
