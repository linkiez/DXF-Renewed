import { messages } from './messages'
import type { ReviewInspection, ReviewPart, ReviewScene, ReviewSelection } from './types'

type Row = { label: string; value: string }

const labels = messages.inspectLabels
const pair = (a: number, b: number): string => `${a}, ${b}`

const partRows = (scene: ReviewScene, part: ReviewPart): Row[] => {
  const { placement, source } = part
  const rows: Row[] = [
    { label: labels.part, value: part.key },
    { label: labels.shape, value: part.shapeId },
    { label: labels.instance, value: String(part.instanceIndex) },
    { label: labels.rotation, value: String(placement.rotation) },
    { label: labels.position, value: pair(placement.x, placement.y) },
    { label: labels.bounds, value: `${pair(placement.bbox.minX, placement.bbox.minY)} – ${pair(placement.bbox.maxX, placement.bbox.maxY)}` },
  ]
  if (source.layer !== undefined) rows.push({ label: labels.layer, value: source.layer })
  if (source.originalHandle !== undefined) rows.push({ label: labels.handle, value: source.originalHandle })
  if (source.area !== undefined) rows.push({ label: labels.area, value: String(source.area) })
  if (source.perimeter !== undefined) rows.push({ label: labels.perimeter, value: String(source.perimeter) })
  rows.push({ label: labels.status, value: messages.partStatusLabel(part.status) })
  if (scene.identity) {
    rows.push(
      { label: labels.order, value: scene.identity.correlation.orderId },
      { label: labels.revision, value: scene.identity.correlation.revisionId },
      { label: labels.request, value: scene.identity.correlation.requestId },
    )
  }
  return rows
}

const empty = (): ReviewInspection => ({ title: messages.panels.nothingSelected, rows: [], notices: [] })

/**
 * Builds the inspector content for a selected part or action.
 *
 * @param scene - Review scene.
 * @param selection - Selected part or action.
 * @returns Title, labeled rows (every action metadata entry verbatim) and recorded notices; an
 *   explicit empty inspection when the selection does not exist.
 */
export function inspect(scene: ReviewScene, selection: ReviewSelection): ReviewInspection {
  const sheet = scene.sheets.find((candidate) => candidate.id === selection.sheetId)
  if (!sheet) return empty()
  if (selection.kind === 'part') {
    const part = sheet.parts.find((candidate) => candidate.key === selection.partKey)
    return part
      ? { title: messages.partTitle(part.key), rows: partRows(scene, part), notices: part.notices }
      : empty()
  }
  const action = sheet.timeline?.actions[selection.actionIndex]
  if (!action) return empty()
  const label = messages.actionLabel(action.kind)
  const rows: Row[] = [
    { label: labels.kind, value: label },
    { label: labels.owningPart, value: action.partKey ?? labels.unlinked },
    ...Object.entries(action.metadata ?? {}).map(([key, value]) => ({ label: key, value: String(value) })),
  ]
  return { title: messages.actionTitle(action.index + 1, label), rows, notices: action.notices }
}
