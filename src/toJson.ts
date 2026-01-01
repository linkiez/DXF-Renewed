import type { ParsedDXF, ToJsonOptions } from './types'

export default function toJson(parsed: ParsedDXF, options: ToJsonOptions = {}): string {
  const shouldPrettyPrint = options.pretty === true
  const indentation = shouldPrettyPrint ? (options.space ?? 2) : undefined

  return JSON.stringify(parsed, null, indentation)
}
