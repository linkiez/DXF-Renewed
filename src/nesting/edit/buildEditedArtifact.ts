import type { Observable } from 'rxjs'
import { observeFlow } from '../async/observableFlow'
import type { CanonicalInput } from '../erp/canonical'
import { digestCanonical } from '../erp/digest'
import { outputProjection } from '../erp/outputProjection'
import type { ErpNestingArtifact } from '../erp/types'
import type { NestResponse } from '../types'
import { editedLayout } from './editedLayout'
import type { EditedArtifact, EditState } from './types'

const asCanonical = (value: unknown): CanonicalInput => JSON.parse(JSON.stringify(value ?? null)) as CanonicalInput

const build = async (state: EditState): Promise<EditedArtifact> => {
  const base = state.input.artifact
  const layout = editedLayout(state)
  const log = state.edits.slice(0, state.cursor)
  const outputDigest = log.length === 0 || layout === null
    ? base.outputDigest
    : await digestCanonical(outputProjection(base.contractVersion, layout as NestResponse, base.unplaced))
  const artifact: ErpNestingArtifact = { ...base, layout, outputDigest }
  const edit = {
    originalOutputDigest: base.outputDigest,
    originalInputDigest: base.inputDigest,
    log: [...log],
    notices: [],
  }
  const digest = await digestCanonical(asCanonical({ artifact, edit }))
  return { artifact, edit: { ...edit, digest } }
}

/**
 * Produces the edited layout as a new artifact that refers to the original.
 *
 * The inner artifact keeps the correlation, the snapshots and the input digest, carries the edited
 * layout and a new output digest from the same projection the ERP artifact uses. The `edit` part
 * holds the digests of the original, the applied edits in order and a digest of the whole result.
 * With no applied edits the output digest is the original one. The original artifact is never
 * mutated and the same edits give the same result.
 *
 * @param state - Session state.
 * @returns Cold Observable that emits one `EditedArtifact` and completes.
 * @example
 * ```typescript
 * const { artifact, edit } = await firstValueFrom(buildEditedArtifact(state))
 * ```
 */
export function buildEditedArtifact(state: EditState): Observable<EditedArtifact> {
  return observeFlow(() => build(state))
}
