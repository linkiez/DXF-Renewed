import { editMessages } from './messages'
import type { MessageContext } from './messages'
import type { EditNotice, EditNoticeCode } from './types'

/**
 * Builds a notice with its pt-BR message.
 *
 * @param severity - Severity of the notice.
 * @param code - Stable notice code.
 * @param context - Values interpolated into the message.
 * @returns The notice, carrying the part key of the context when present.
 */
export function notice(severity: EditNotice['severity'], code: EditNoticeCode, context: MessageContext = {}): EditNotice {
  return { severity, code, message: editMessages.notice[code](context), ...(context.partKey ? { partKey: context.partKey } : {}) }
}
