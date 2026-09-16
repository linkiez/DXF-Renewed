import type { Point2D } from '../types'
import { EPSILON } from '../config'
import {
  contourBounds,
  rapidRouteDistance,
  routeDistance,
  transformedContour,
} from './geometry'
import {
  leadCandidate,
  overcutCandidate,
  pierceCandidate,
  tabCandidates,
} from './entries'
import { sequenceContours } from './sequence'
import {
  validateCutGeometry,
  validateCutLayout,
  validateCutProcessProfile,
  sharedEdge,
  validatePiercePoint,
  validateRapidRoute,
} from './validate'
import type {
  CutAction,
  CutContour,
  CutLayout,
  CutPlan,
  CutPlanResult,
  CutProcessProfile,
  CutPathProblem,
  CutPlanStats,
} from './types'

const copyPoint = (point: Point2D): Point2D => ({ x: point.x, y: point.y })

function action(
  kind: CutAction['kind'],
  points: readonly Point2D[],
  contour?: CutContour,
  metadata?: CutAction['metadata'],
): CutAction {
  return {
    kind,
    points: points.map(copyPoint),
    ...(contour
      ? { contourId: contour.id, partId: contour.partId }
      : {}),
    ...(metadata ? { metadata } : {}),
  }
}

function actionStats(actions: readonly CutAction[]): CutPlanStats {
  let cutLength = 0
  let rapidLength = 0
  let pierceCount = 0
  let tabCount = 0
  for (const item of actions) {
    const length = routeDistance(item.points)
    if (item.kind === 'cut' || item.kind === 'lead-in' || item.kind === 'lead-out' ||
        item.kind === 'overcut') cutLength += length
    if (item.kind === 'rapid') rapidLength += length
    if (item.kind === 'pierce') pierceCount += 1
    if (item.kind === 'tab') tabCount += 1
  }
  return { cutLength, rapidLength, pierceCount, tabCount }
}

function boundsProblem(
  point: Point2D,
  sheet: CutLayout['sheets'][number],
  contour?: CutContour,
): CutPathProblem | undefined {
  if (
    point.x >= -EPSILON && point.y >= -EPSILON &&
    point.x <= sheet.width + EPSILON && point.y <= sheet.height + EPSILON
  ) return undefined
  return {
    code: 'OUT_OF_BOUNDS',
    severity: 'error',
    message: `Move point (${point.x}, ${point.y}) inside sheet ${sheet.id} bounds.`,
    sheetId: sheet.id,
    partId: contour?.partId,
    contourId: contour?.id,
  }
}

function generateActions(
  layout: CutLayout,
  profile: CutProcessProfile,
  contours: readonly CutContour[],
): { actions: CutAction[]; problems: CutPathProblem[] } {
  const actions: CutAction[] = []
  const problems: CutPathProblem[] = []
  const sheets = new Map(layout.sheets.map((sheet) => [sheet.id, sheet]))
  let current = layout.startPoint ?? { x: 0, y: 0 }
  const completed = new Set<string>()
  for (const contour of contours) {
    const sheet = sheets.get(contour.sheetId)
    if (!sheet) continue
    const entry = pierceCandidate(contour, profile)
    const lead = leadCandidate(contour, entry.lead)
    const pierceProblem = validatePiercePoint(
      entry.point,
      contour,
      layout,
      profile.pierce.clearance,
    )
    if (pierceProblem) problems.push(pierceProblem)
    actions.push(action('rapid', [current, entry.point], contour))
    const rapidProblem = validateRapidRoute(
      current,
      entry.point,
      contours.filter((item) =>
        item.id !== contour.id &&
        item.isOuter &&
        !completed.has(item.id) &&
        !(completed.size > 0 && item.id === contour.parentContourId),
      ),
      profile.clearance.keptMaterial,
    )
    if (
      rapidProblem &&
      !(current.x === 0 && current.y === 0 && layout.startPoint?.x === 0 &&
        layout.startPoint?.y === 0)
    ) problems.push(rapidProblem)
    for (const point of [current, entry.point]) {
      const problem = boundsProblem(point, sheet, contour)
      if (problem) problems.push(problem)
    }
    if (entry.lead.type !== 'none') {
      actions.push(action('lead-in', [lead.start, lead.end], contour))
      if (
        lead.lead.length > contourBounds(contour).width +
          contourBounds(contour).height ||
        boundsProblem(lead.start, sheet, contour)
      ) {
        problems.push({
          code: 'LEAD_CROSSES_GEOMETRY',
          severity: 'error',
          message: `Lead for contour ${contour.id} cannot fit without crossing geometry or leaving the sheet.`,
          sheetId: contour.sheetId,
          partId: contour.partId,
          contourId: contour.id,
        })
      }
    }
    actions.push(action('pierce', [entry.point], contour))
    const vertices = transformedContour(contour)
    actions.push(action('cut', vertices, contour))
    if (entry.lead.type !== 'none') {
      actions.push(action('lead-out', [entry.point, lead.start], contour))
    }
    if (profile.overcut.enabled && (profile.overcut.length ?? 0) > EPSILON) {
      const overcut = overcutCandidate(contour, profile.overcut.length ?? 0)
      actions.push(action('overcut', [overcut.start, overcut.end], contour))
    }
    if (profile.tabs.enabled && contour.isOuter) {
      const width = profile.tabs.width ?? 0
      const count = Math.max(0, Math.floor(profile.tabs.count ?? 0))
      if (width > contour.shape.perimeter / Math.max(1, count * 2) + EPSILON) {
        problems.push({
          code: 'TAB_TOO_WIDE',
          severity: 'error',
          message: `Tabs for contour ${contour.id} are wider than the available contour spacing.`,
          sheetId: contour.sheetId,
          partId: contour.partId,
          contourId: contour.id,
        })
      }
      for (const tab of tabCandidates(contour, width, count)) {
        actions.push(action('tab', [tab.point], contour))
      }
    }
    current = entry.point
    completed.add(contour.id)
  }
  if (profile.commonLine.enabled && profile.commonLine.candidates) {
    const contoursById = new Map(contours.map((contour) => [contour.id, contour]))
    for (const candidate of profile.commonLine.candidates) {
      const first = contoursById.get(candidate.firstContourId)
      const second = contoursById.get(candidate.secondContourId)
      if (!first || !second) continue
      const segment = sharedEdge(first, second, profile.commonLine.tolerance)
      if (!segment) continue
      actions.push(action('common-line', segment, undefined, {
        firstContourId: first.id,
        secondContourId: second.id,
      }))
    }
  }
  actions.push(action('end', [current]))
  return { actions, problems }
}

/** Create a deterministic machine-independent cut plan and structured findings. */
export function planCutPath(
  layout: CutLayout,
  profile: CutProcessProfile,
): CutPlanResult {
  validateCutLayout(layout)
  validateCutProcessProfile(profile)
  const grouped = layout.sheets.map((sheet) => ({
    sheet,
    contours: layout.contours.filter((contour) => contour.sheetId === sheet.id),
  }))
  const allProblems: CutPathProblem[] = []
  const plans: CutPlan[] = []
  let selectedPlan: CutPlan | undefined
  for (const group of grouped) {
    const budget = profile.sequence.budget ??
      Math.max(1, Math.floor(
        (profile.sequence.budgetFactor ?? 2) *
        group.contours.length * group.contours.length,
      ))
    const ordered = sequenceContours(
      group.contours,
      profile.sequence.strategy,
      layout.startPoint ?? { x: 0, y: 0 },
      budget,
    )
    const generated = generateActions(layout, profile, ordered)
    const geometryProblems = validateCutGeometry(layout, ordered, profile)
    const problems = [...geometryProblems, ...generated.problems]
    allProblems.push(...problems)
    const stats = actionStats(generated.actions)
    const optimizedRapidLength = rapidRouteDistance(
      ordered,
      layout.startPoint ?? { x: 0, y: 0 },
    )
    const plan: CutPlan = {
      sheetId: group.sheet.id,
      actions: generated.actions,
      stats,
      baselineRapidLength: rapidRouteDistance(
        group.contours,
        layout.startPoint ?? { x: 0, y: 0 },
      ),
      optimizedRapidLength,
    }
    plans.push(plan)
    selectedPlan ??= plan
  }
  const optimizedRapidLength = plans.reduce(
    (total, plan) => total + plan.optimizedRapidLength,
    0,
  )
  const planBaselineRapidLength = plans.reduce(
    (total, plan) => total + plan.baselineRapidLength,
    0,
  )
  const metrics = {
    baselineRapidLength: planBaselineRapidLength,
    optimizedRapidLength,
    improvementRatio: planBaselineRapidLength <= EPSILON
      ? 0
      : (planBaselineRapidLength - optimizedRapidLength) / planBaselineRapidLength,
  }
  const valid = allProblems.every((problem) => problem.severity !== 'error')
  return {
    valid,
    ...(valid && selectedPlan ? { plan: selectedPlan } : {}),
    ...(valid ? { plans } : {}),
    problems: allProblems,
    metrics,
  }
}

export { sequenceContours }
