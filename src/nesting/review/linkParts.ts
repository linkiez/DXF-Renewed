import type { CutAction, CutLayout } from '../cutPath/types'
import { messages } from './messages'
import type { ReviewNotice } from './types'

/** Inputs used to link the actions of one sheet to its parts. */
export interface LinkPartsArgs {
  sheetId: string
  /** Keys (`shapeId#instanceIndex`) of the parts placed on this sheet. */
  partKeys: readonly string[]
  layout?: CutLayout
  actions: readonly CutAction[]
}

/** Result of linking: per-action part key, a resolver for problems and notices. */
export interface LinkPartsResult {
  /** Part key per action index; `undefined` for partless or unresolved actions. */
  partKeyByAction: readonly (string | undefined)[]
  /** Resolves a part or contour reference with the same rules used for actions. */
  resolve(partId: string | undefined, contourId: string | undefined): string | undefined
  /** One notice per distinct unresolved reference. */
  notices: readonly ReviewNotice[]
}

const keyOf = (shapeId: string, instanceIndex: number | undefined): string =>
  `${shapeId}#${instanceIndex ?? 0}`

/**
 * Links cut actions to the parts placed on a sheet.
 *
 * Resolution order: contours of the cut layout (contour to placement), then a `partId` equal to a
 * part key or to a `shapeId`. A reference that cannot be resolved raises one notice and keeps the
 * action in the sequence.
 *
 * @param args - Sheet, known part keys, optional cut layout and the sheet's actions.
 * @returns Part keys per action, a resolver and the notices raised.
 */
export function linkParts(args: LinkPartsArgs): LinkPartsResult {
  const known = new Set(args.partKeys)
  const contourPartId = new Map<string, string>()
  const keysByPartId = new Map<string, string[]>()
  for (const contour of args.layout?.contours ?? []) {
    contourPartId.set(contour.id, contour.partId)
    const key = keyOf(contour.placement.shapeId, contour.placement.instanceIndex)
    if (!known.has(key)) continue
    const list = keysByPartId.get(contour.partId) ?? []
    if (!list.includes(key)) list.push(key)
    keysByPartId.set(contour.partId, list)
  }

  const byPartId = (partId: string): string | undefined => {
    const viaLayout = keysByPartId.get(partId)?.[0]
    if (viaLayout) return viaLayout
    if (known.has(partId)) return partId
    const asShape = keyOf(partId, 0)
    return known.has(asShape) ? asShape : undefined
  }

  const resolve = (partId: string | undefined, contourId: string | undefined): string | undefined => {
    const id = partId ?? (contourId ? contourPartId.get(contourId) : undefined)
    return id === undefined ? undefined : byPartId(id)
  }

  const notices: ReviewNotice[] = []
  const reported = new Set<string>()
  const partKeyByAction = args.actions.map((action, actionIndex) => {
    if (action.partId === undefined && action.contourId === undefined) return undefined
    const key = resolve(action.partId, action.contourId)
    if (key !== undefined) return key
    const reference = action.partId ?? action.contourId ?? ''
    const unresolvedPart = action.partId ?? (action.contourId ? contourPartId.get(action.contourId) : undefined)
    const dedupe = unresolvedPart ?? `contour:${reference}`
    if (!reported.has(dedupe)) {
      reported.add(dedupe)
      notices.push({
        severity: 'warning',
        code: unresolvedPart === undefined ? 'UNLINKED_ACTION' : 'UNKNOWN_PART',
        message: unresolvedPart === undefined
          ? messages.unlinkedAction(reference, actionIndex)
          : messages.unknownPart(unresolvedPart),
        origin: 'review',
        sheetId: args.sheetId,
        actionIndex,
      })
    }
    return undefined
  })

  return { partKeyByAction, resolve, notices }
}
