import type { CutAction, CutLayout } from '../cutPath/types'

/** Inputs used to link cut actions to placed parts. */
export interface LinkActionsArgs {
  /** Keys (`shapeId#instanceIndex`) of the parts the actions may belong to. */
  partKeys: readonly string[]
  layout?: CutLayout
  actions: readonly CutAction[]
}

/** A reference that could not be resolved, reported once at its first action. */
export interface UnresolvedReference {
  /** `unknown-part`: a part id the artifact does not contain; `unlinked-action`: a contour id the layout does not know. */
  kind: 'unknown-part' | 'unlinked-action'
  reference: string
  actionIndex: number
}

/** Result of linking: part key per action, a resolver and the unresolved references. */
export interface LinkActionsResult {
  /** Part key per action index; `undefined` for partless or unresolved actions. */
  partKeyByAction: readonly (string | undefined)[]
  /** Resolves a part or contour reference with the same rules used for actions. */
  resolve(partId: string | undefined, contourId: string | undefined): string | undefined
  /** One entry per distinct unresolved reference, in first-seen order. */
  unresolved: readonly UnresolvedReference[]
}

const keyOf = (shapeId: string, instanceIndex: number | undefined): string =>
  `${shapeId}#${instanceIndex ?? 0}`

const indexLayout = (layout: CutLayout | undefined, known: ReadonlySet<string>) => {
  const contourPartId = new Map<string, string>()
  const keysByPartId = new Map<string, string[]>()
  for (const contour of layout?.contours ?? []) {
    contourPartId.set(contour.id, contour.partId)
    const key = keyOf(contour.placement.shapeId, contour.placement.instanceIndex)
    if (!known.has(key)) continue
    const keys = keysByPartId.get(contour.partId) ?? []
    if (!keys.includes(key)) keys.push(key)
    keysByPartId.set(contour.partId, keys)
  }
  return { contourPartId, keysByPartId }
}

const hasReference = (action: CutAction): boolean =>
  action.partId !== undefined || action.contourId !== undefined

/**
 * Links cut actions to placed parts.
 *
 * Resolution order: contours of the cut layout (contour to placement), then a `partId` equal to a
 * part key or to a `shapeId`. A reference that cannot be resolved is returned once as a structured
 * finding and the action stays in the sequence. The result carries no user text.
 *
 * @param args - Known part keys, optional cut layout and the actions.
 * @returns Part keys per action, a resolver and the unresolved references.
 */
export function linkActions(args: LinkActionsArgs): LinkActionsResult {
  const known = new Set(args.partKeys)
  const { contourPartId, keysByPartId } = indexLayout(args.layout, known)

  const byPartId = (partId: string): string | undefined => {
    const viaLayout = keysByPartId.get(partId)?.[0]
    if (viaLayout) return viaLayout
    if (known.has(partId)) return partId
    const asShape = keyOf(partId, 0)
    return known.has(asShape) ? asShape : undefined
  }

  const partIdOf = (partId: string | undefined, contourId: string | undefined): string | undefined =>
    partId ?? (contourId ? contourPartId.get(contourId) : undefined)

  const resolve = (partId: string | undefined, contourId: string | undefined): string | undefined => {
    const id = partIdOf(partId, contourId)
    return id === undefined ? undefined : byPartId(id)
  }

  const unresolved: UnresolvedReference[] = []
  const reported = new Set<string>()
  const report = (action: CutAction, actionIndex: number): void => {
    const part = partIdOf(action.partId, action.contourId)
    const reference = part ?? action.contourId ?? ''
    const dedupe = part ?? `contour:${reference}`
    if (reported.has(dedupe)) return
    reported.add(dedupe)
    unresolved.push({ kind: part === undefined ? 'unlinked-action' : 'unknown-part', reference, actionIndex })
  }

  const partKeyByAction = args.actions.map((action, actionIndex) => {
    if (!hasReference(action)) return undefined
    const key = resolve(action.partId, action.contourId)
    if (key === undefined) report(action, actionIndex)
    return key
  })

  return { partKeyByAction, resolve, unresolved }
}
