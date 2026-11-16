import { heatViewOf } from './heatViewOf'
import { buildRiskContext } from './riskContext'
import type { HeatRequest, HeatView } from './types'

/**
 * Computes the accumulated heat of one sheet at one plan time, on demand.
 *
 * The view sums the cut length inside the trailing heat window per cell and divides the length
 * around each cell by the heat limit, so a value above 1 is over the limit. Seeking back and forth
 * gives identical views.
 *
 * @param request - Risk request plus the sheet and the plan time in seconds.
 * @returns The view; unavailable, naming the missing profile paths, when the heat rule cannot be assessed.
 */
export function heatAt(request: HeatRequest): HeatView {
  return heatViewOf(buildRiskContext(request), request.sheetId, request.planSeconds)
}
