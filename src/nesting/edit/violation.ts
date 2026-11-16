import { editMessages } from './messages'
import type { MessageContext } from './messages'
import type { Violation, ViolationCode } from './types'

/**
 * Builds a violation with its pt-BR message.
 *
 * @param code - Violation code.
 * @param context - Values interpolated into the message; the part, other part and zone are kept on the violation.
 * @returns The violation.
 */
export function violation(code: ViolationCode, context: MessageContext): Violation {
  return {
    code,
    message: editMessages.violation[code](context),
    ...(context.partKey ? { partKey: context.partKey } : {}),
    ...(context.otherPartKey ? { otherPartKey: context.otherPartKey } : {}),
    ...(context.zoneId ? { zoneId: context.zoneId } : {}),
  }
}
