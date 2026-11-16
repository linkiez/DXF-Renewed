import type { CutAction, CutPathProblem, CutPlan } from '../cutPath/types'
import { EPSILON } from '../config'
import { ERP_CONTRACT_VERSION } from '../erp/types'
import { erpNestingArtifactSchema } from '../erp/schemas'
import type { NestableShape, StockItem } from '../types'
import { buildTimeline } from './buildTimeline'
import { linkParts } from './linkParts'
import { messages } from './messages'
import { resolvePlacements } from './resolvePlacements'
import type {
  ReviewAction,
  ReviewIdentity,
  ReviewInput,
  ReviewNotice,
  ReviewPart,
  ReviewScene,
  ReviewSheet,
  ReviewSummary,
} from './types'

const EMPTY_SUMMARY: ReviewSummary = {
  sheetCount: 0,
  partCount: 0,
  unplacedCount: 0,
  yield: 0,
  totalCutLength: 0,
  totalRapidLength: 0,
  pierceCount: 0,
}

const NATURALLY_ZERO_LENGTH = new Set(['pierce', 'end'])

const reviewNotice = (
  severity: ReviewNotice['severity'],
  code: ReviewNotice['code'],
  message: string,
  extra: Partial<ReviewNotice> = {},
): ReviewNotice => ({ severity, code, message, origin: 'review', ...extra })

const unavailable = (
  identity: ReviewIdentity | null,
  notices: ReviewNotice[],
  unplacedCount = 0,
): ReviewScene => ({
  status: 'unavailable',
  identity,
  sheets: [],
  notices,
  summary: { ...EMPTY_SUMMARY, unplacedCount },
  capabilities: { playback: false, actionInspection: false },
})

const artifactNotices = (input: ReviewInput): ReviewNotice[] => {
  const { artifact } = input
  return [
    ...artifact.warnings.map<ReviewNotice>((issue) => ({
      severity: 'warning',
      code: issue.code,
      message: issue.message,
      origin: 'artifact',
    })),
    ...artifact.rejections.map<ReviewNotice>((issue) => ({
      severity: 'error',
      code: issue.code,
      message: issue.message,
      origin: 'artifact',
    })),
    ...artifact.unplaced.map<ReviewNotice>((item) => ({
      severity: 'warning',
      code: item.reasonCode,
      message: messages.unplacedItem(item.itemId, item.quantity, item.reason),
      origin: 'artifact',
    })),
  ]
}

const planNotice = (problem: CutPathProblem): ReviewNotice => ({
  severity: problem.severity,
  code: problem.code,
  message: problem.message,
  origin: 'planning',
  ...(problem.sheetId ? { sheetId: problem.sheetId } : {}),
  ...(problem.actionIndex !== undefined ? { actionIndex: problem.actionIndex } : {}),
})

const plansOf = (input: ReviewInput): readonly CutPlan[] =>
  input.cutPlan?.plans ?? (input.cutPlan?.plan ? [input.cutPlan.plan] : [])

const shapeIndex = (input: ReviewInput): Map<string, NestableShape> =>
  new Map((input.layout?.contours ?? []).map((contour) => [contour.shape.id, contour.shape]))

interface SheetBuild {
  sheet: ReviewSheet
  notices: ReviewNotice[]
}

const buildSheet = (
  stock: StockItem,
  parts: readonly ReviewPart[],
  plan: CutPlan | undefined,
  input: ReviewInput,
  problems: readonly CutPathProblem[],
): SheetBuild => {
  const notices: ReviewNotice[] = []
  if (parts.length === 0) {
    notices.push(reviewNotice('info', 'EMPTY_SHEET', messages.emptySheet(stock.id), { sheetId: stock.id }))
  }
  if (!plan) return { sheet: { id: stock.id, stock, parts }, notices }

  const timeline = buildTimeline(plan.actions as readonly CutAction[])
  const link = linkParts({
    sheetId: stock.id,
    partKeys: parts.map((part) => part.key),
    layout: input.layout,
    actions: plan.actions,
  })
  notices.push(...link.notices)

  const actionNotices = new Map<number, ReviewNotice[]>()
  const partNotices = new Map<string, ReviewNotice[]>()
  const attach = <K>(map: Map<K, ReviewNotice[]>, key: K, notice: ReviewNotice): void => {
    map.set(key, [...(map.get(key) ?? []), notice])
  }

  timeline.actions.forEach((action) => {
    if (action.length <= EPSILON && !NATURALLY_ZERO_LENGTH.has(action.kind)) {
      const notice = reviewNotice(
        'warning', 'DEGENERATE_ACTION', messages.degenerateAction(action.index),
        { sheetId: stock.id, actionIndex: action.index },
      )
      attach(actionNotices, action.index, notice)
      notices.push(notice)
    }
  })

  for (const problem of problems) {
    const notice = planNotice({ ...problem, sheetId: stock.id })
    notices.push(notice)
    if (problem.actionIndex !== undefined) attach(actionNotices, problem.actionIndex, notice)
    const partKey = link.resolve(problem.partId, problem.contourId) ??
      (problem.actionIndex !== undefined ? link.partKeyByAction[problem.actionIndex] : undefined)
    if (partKey) {
      const withKey = { ...notice, partKey }
      attach(partNotices, partKey, withKey)
    }
  }

  const actions = timeline.actions.map<ReviewAction>((action) => ({
    ...action,
    ...(link.partKeyByAction[action.index] ? { partKey: link.partKeyByAction[action.index] } : {}),
    notices: actionNotices.get(action.index) ?? [],
  }))
  actions.forEach((action) => {
    if (action.partKey) {
      for (const notice of action.notices) {
        if (notice.origin === 'review') attach(partNotices, action.partKey, { ...notice, partKey: action.partKey })
      }
    }
  })

  const flagged = parts.map<ReviewPart>((part) => {
    const own = partNotices.get(part.key) ?? []
    return {
      ...part,
      notices: own,
      status: own.some((notice) => notice.severity !== 'info') ? 'flagged' : 'placed',
    }
  })

  return {
    sheet: { id: stock.id, stock, parts: flagged, timeline: { ...timeline, actions } },
    notices,
  }
}

const summaryOf = (
  input: ReviewInput,
  sheets: readonly ReviewSheet[],
  plans: readonly CutPlan[],
): ReviewSummary => ({
  sheetCount: sheets.length,
  partCount: sheets.reduce((total, sheet) => total + sheet.parts.length, 0),
  unplacedCount: input.artifact.unplaced.reduce((total, item) => total + item.quantity, 0),
  yield: input.artifact.layout?.utilization ?? 0,
  totalCutLength: plans.reduce((total, plan) => total + plan.stats.cutLength, 0),
  totalRapidLength: plans.reduce((total, plan) => total + plan.stats.rapidLength, 0),
  pierceCount: plans.reduce((total, plan) => total + plan.stats.pierceCount, 0),
})

/**
 * Builds the immutable review scene of one artifact.
 *
 * Never throws for expected outcomes: an unsupported version, an invalid artifact, a missing
 * layout or cut plan and every gap are reported as notices. Nothing in the input is mutated and
 * no value is recomputed that the artifact or the cut plan already carries.
 *
 * @param input - Artifact plus optional cut layout and cut plan.
 * @returns The review scene with sheets, parts, timelines, notices and summary.
 * @example
 * ```typescript
 * const scene = buildReviewScene({ artifact, layout, cutPlan })
 * ```
 */
export function buildReviewScene(input: ReviewInput): ReviewScene {
  const { artifact } = input
  if (artifact.contractVersion !== ERP_CONTRACT_VERSION) {
    return unavailable(null, [reviewNotice(
      'error', 'UNSUPPORTED_CONTRACT_VERSION',
      messages.unsupportedVersion(artifact.contractVersion, ERP_CONTRACT_VERSION),
    )])
  }
  const parsed = erpNestingArtifactSchema.safeParse(artifact)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return unavailable(null, [reviewNotice(
      'error', 'INVALID_ARTIFACT',
      messages.invalidArtifact(`${issue.path.join('.') || 'artifact'}: ${issue.message}`),
    )])
  }

  const identity: ReviewIdentity = {
    status: artifact.status,
    contractVersion: artifact.contractVersion,
    correlation: artifact.correlation,
    inputDigest: artifact.inputDigest,
    outputDigest: artifact.outputDigest,
  }
  const notices = artifactNotices(input)
  const unplacedCount = artifact.unplaced.reduce((total, item) => total + item.quantity, 0)
  const layout = artifact.layout
  if (!layout) {
    notices.push(reviewNotice('error', 'NO_LAYOUT', messages.noLayout(artifact.status)))
    return unavailable(identity, notices, unplacedCount)
  }

  const stocks = layout.sheets as StockItem[]
  const placed = resolvePlacements(layout, stocks, shapeIndex(input))
  notices.push(...placed.notices)

  const plans = plansOf(input)
  const sheetIds = new Set(stocks.map((stock) => stock.id))
  const unknownPlans = plans.filter((plan) => !sheetIds.has(plan.sheetId))
  for (const plan of unknownPlans) {
    notices.push(reviewNotice(
      'warning', 'PLAN_SHEET_MISSING', messages.planSheetMissing(plan.sheetId), { sheetId: plan.sheetId },
    ))
  }

  const problems = input.cutPlan?.problems ?? []
  const sheets: ReviewSheet[] = []
  for (const stock of stocks) {
    const plan = plans.find((candidate) => candidate.sheetId === stock.id)
    const own = problems.filter((problem) => (problem.sheetId ?? (plans.length === 1 ? plans[0].sheetId : undefined)) === stock.id)
    const built = buildSheet(stock, placed.partsBySheet.get(stock.id) ?? [], plan, input, own)
    sheets.push(built.sheet)
    notices.push(...built.notices)
  }
  if (plans.length === 0) {
    notices.push(reviewNotice('info', 'NO_CUT_PLAN', messages.noCutPlan()))
  }

  const playback = sheets.some((sheet) => (sheet.timeline?.actions.length ?? 0) > 0)
  const summary = summaryOf(input, sheets, plans.filter((plan) => sheetIds.has(plan.sheetId)))
  const needsAttention = notices.some((notice) => notice.severity !== 'info')
  return {
    status: needsAttention || artifact.status !== 'complete' ? 'partial' : 'ready',
    identity,
    sheets,
    notices,
    summary,
    capabilities: { playback, actionInspection: playback },
  }
}
