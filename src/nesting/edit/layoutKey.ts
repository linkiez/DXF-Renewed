import type { PartEdit } from './types'

/**
 * Names the layout reached after the first `cursor` edits, so a derived result can be matched to the
 * layout it was computed for.
 *
 * @param edits - Edit log.
 * @param cursor - How many edits are applied.
 * @returns A string that is equal exactly for equal applied edits.
 */
export function layoutKey(edits: readonly PartEdit[], cursor: number): string {
  return edits
    .slice(0, cursor)
    .map((edit) => `${edit.partKey}|${edit.kind}|${JSON.stringify('delta' in edit ? edit.delta : null)}`)
    .join(';')
}
