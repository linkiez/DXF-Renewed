import type { CutAction, CutPlan } from '../../../../src/nesting/cutPath'

type Pt = { x: number; y: number }
const pt = (x: number, y: number): Pt => ({ x, y })

type Meta = Record<string, string | number | boolean>

interface ReferenceOptions {
  quality?: string
  /** Extra metadata for every non-rapid action. */
  metadata?: Meta
  /** Extra metadata by contour identifier, merged over `metadata`. */
  perContour?: Record<string, Meta>
}

interface Step {
  kind: 'lead-in' | 'cut' | 'lead-out' | 'overcut'
  to: Pt
  arc?: { center: Pt; clockwise: boolean }
}

function contour(
  id: string,
  part: string,
  from: Pt,
  start: Pt,
  steps: readonly Step[],
  meta: Record<string, string | number | boolean>,
): { actions: CutAction[]; end: Pt } {
  const actions: CutAction[] = [
    { kind: 'rapid', points: [from, start], contourId: id, partId: part },
    { kind: 'pierce', points: [start], contourId: id, partId: part, metadata: meta },
  ]
  let at = start
  for (const step of steps) {
    actions.push({
      kind: step.kind,
      points: [at, step.to],
      contourId: id,
      partId: part,
      metadata: meta,
      ...(step.arc ? { curve: { type: 'arc' as const, center: step.arc.center, clockwise: step.arc.clockwise } } : {}),
    })
    at = step.to
  }
  return { actions, end: at }
}

const square = (origin: Pt): Step[] => [
  { kind: 'cut', to: pt(origin.x + 20, origin.y) },
  { kind: 'cut', to: pt(origin.x + 20, origin.y + 20) },
  { kind: 'cut', to: pt(origin.x, origin.y + 20) },
  { kind: 'cut', to: origin },
]

/** Four-contour reference plan on a 1500 x 3000 sheet with a short, a medium and a long travel. */
export function referencePlan(options: ReferenceOptions = {}): CutPlan {
  const quality = options.quality ?? 'standard'
  const common = { quality, feed: 1000, ...options.metadata }
  const meta = (id: string, extra: Meta = {}): Meta => ({ ...common, ...extra, ...options.perContour?.[id] })
  const hole = contour('c-hole', 'p1', pt(0, 0), pt(100, 100), [
    { kind: 'lead-in', to: pt(140, 100) },
    { kind: 'cut', to: pt(140, 100), arc: { center: pt(100, 100), clockwise: false } },
  ], meta('c-hole'))
  const outer = contour('c-outer', 'p2', hole.end, pt(300, 40), [
    { kind: 'lead-in', to: pt(300, 50) },
    { kind: 'cut', to: pt(480, 50) },
    { kind: 'cut', to: pt(500, 70), arc: { center: pt(480, 70), clockwise: false } },
    { kind: 'cut', to: pt(500, 150) },
    { kind: 'cut', to: pt(300, 150) },
    { kind: 'cut', to: pt(300, 50) },
  ], meta('c-outer'))
  const near = contour('c-near', 'p3', outer.end, pt(300, 100), square(pt(300, 100)), meta('c-near', { contourClass: 'small' }))
  const far = contour('c-far', 'p4', near.end, pt(300, 1300), square(pt(300, 1300)), meta('c-far', { contourClass: 'small' }))
  const actions: CutAction[] = [
    ...hole.actions, ...outer.actions, ...near.actions, ...far.actions,
    { kind: 'end', points: [far.end] },
  ]
  return {
    sheetId: 'sheet-1',
    actions,
    stats: { cutLength: 0, rapidLength: 0, pierceCount: 4, tabCount: 0 },
    baselineRapidLength: 0,
    optimizedRapidLength: 0,
  }
}

/** Plan of `contourCount` non-overlapping 20 x 20 squares, for volume checks. */
export function generatedPlan(contourCount: number): CutPlan {
  const actions: CutAction[] = []
  let at = pt(0, 0)
  for (let index = 0; index < contourCount; index++) {
    const origin = pt(10 + (index % 30) * 45, 10 + Math.floor(index / 30) * 60)
    const built = contour(`g-${index}`, `p${index}`, at, origin, square(origin), { quality: 'standard', feed: 1000 })
    actions.push(...built.actions)
    at = built.end
  }
  actions.push({ kind: 'end', points: [at] })
  return {
    sheetId: 'sheet-1',
    actions,
    stats: { cutLength: 0, rapidLength: 0, pierceCount: contourCount, tabCount: 0 },
    baselineRapidLength: 0,
    optimizedRapidLength: 0,
  }
}
