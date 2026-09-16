import { firstValueFrom } from 'rxjs'
import { observeFlow } from '../async/observableFlow'
import { nestTrueShape } from '../trueShape'
import { toNestRequest } from './adapter'
import {
  erpNestingArtifactSchema,
  getErpNestingRequestSchema,
} from './schemas'
import { createNestingArtifact } from './artifact'
import type { ErpNestingFlow } from './types'

/**
 * Calculates one stateless ERP nesting artifact as a cold Observable.
 *
 * @param request - Caller-owned versioned nesting request.
 * @returns Observable that emits one artifact and completes.
 */
export const calculateErpNesting: ErpNestingFlow = (request) =>
  observeFlow(async (signal) => {
    const requestSchema = getErpNestingRequestSchema(request?.contractVersion)
    if (!requestSchema) {
      throw new RangeError(
        `unsupported ERP contract version: ${request?.contractVersion ?? 'missing'}`,
      )
    }
    const validation = requestSchema.safeParse(request)
    if (!validation.success) {
      throw new TypeError(`invalid ERP nesting request: ${validation.error.message}`)
    }

    const plan = await firstValueFrom(nestTrueShape(toNestRequest(request, signal)))
    const artifact = await createNestingArtifact(request, plan)
    const artifactValidation = erpNestingArtifactSchema.safeParse(artifact)
    if (!artifactValidation.success) {
      throw new TypeError(
        `invalid ERP nesting artifact: ${artifactValidation.error.message}`,
      )
    }
    return artifact
  })
