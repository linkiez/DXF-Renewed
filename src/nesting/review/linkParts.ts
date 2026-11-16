import type { CutAction, CutLayout } from '../cutPath/types'
import { linkActions } from '../linking/linkActions'
import type { UnresolvedReference } from '../linking/linkActions'
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

const noticeFor = (sheetId: string, finding: UnresolvedReference): ReviewNotice => ({
  severity: 'warning',
  code: finding.kind === 'unknown-part' ? 'UNKNOWN_PART' : 'UNLINKED_ACTION',
  message: finding.kind === 'unknown-part'
    ? messages.unknownPart(finding.reference)
    : messages.unlinkedAction(finding.reference, finding.actionIndex),
  origin: 'review',
  sheetId,
  actionIndex: finding.actionIndex,
})

/**
 * Links cut actions to the parts placed on a sheet and explains the unresolved ones in pt-BR.
 *
 * @param args - Sheet, known part keys, optional cut layout and the sheet's actions.
 * @returns Part keys per action, a resolver and the notices raised.
 */
export function linkParts(args: LinkPartsArgs): LinkPartsResult {
  const result = linkActions({ partKeys: args.partKeys, layout: args.layout, actions: args.actions })
  return {
    partKeyByAction: result.partKeyByAction,
    resolve: result.resolve,
    notices: result.unresolved.map((finding) => noticeFor(args.sheetId, finding)),
  }
}
