type WordValue = number | string

export interface GcodeWriterOptions {
  /** Line separator used by {@link GcodeWriter#toString}. */
  readonly lineEnding?: '\n' | '\r\n'
  /** Number of decimal places used for numeric words. */
  readonly precision?: number
}

function formatNumber(value: number, precision: number): string {
  if (Object.is(value, -0)) return '0'
  if (!Number.isFinite(value)) throw new Error(`G-code numeric value must be finite: ${value}`)
  return value.toFixed(precision).replace(/\.?0+$/, '') || '0'
}

/** Tokenized deterministic G-code builder. */
export class GcodeWriter {
  private readonly lines: string[] = []
  private current: string[] = []
  private readonly options: Required<GcodeWriterOptions>

  /**
   * Create a writer with deterministic formatting options.
   *
   * @param options - Optional line-ending and numeric-precision settings.
   */
  constructor(options: GcodeWriterOptions = {}) {
    this.options = {
      lineEnding: options.lineEnding ?? '\n',
      precision: options.precision ?? 4,
    }
  }

  /**
   * Start a new output line.
   *
   * @param lineNumber - Optional EIA line number.
   * @returns This writer for fluent calls.
   */
  beginLine(lineNumber?: number): this {
    this.current = lineNumber === undefined ? [] : [`N${lineNumber}`]
    return this
  }

  /**
   * Append one validated G-code word.
   *
   * @param letter - Single-letter word address.
   * @param value - Numeric or textual word value.
   * @returns This writer for fluent calls.
   */
  word(letter: string, value: WordValue): this {
    if (!/^[A-Za-z]$/.test(letter)) throw new Error(`Invalid G-code word letter: ${letter}`)
    this.current.push(`${letter.toUpperCase()}${typeof value === 'number' ? formatNumber(value, this.options.precision) : value}`)
    return this
  }

  /**
   * Append a parenthesized or semicolon comment.
   *
   * @param text - Comment text.
   * @param style - Comment delimiter style.
   * @returns This writer for fluent calls.
   */
  comment(text: string, style: '(' | ';' = '('): this {
    this.current.push(style === '(' ? `(${text})` : `;${text}`)
    return this
  }

  /**
   * Finish the current line.
   *
   * @returns This writer for fluent calls.
   */
  endLine(): this {
    this.lines.push(this.current.join(' '))
    this.current = []
    return this
  }

  /**
   * Render all completed lines with one final line ending.
   *
   * @returns Deterministic G-code text.
   */
  toString(): string {
    if (this.current.length > 0) this.endLine()
    return `${this.lines.join(this.options.lineEnding)}${this.lines.length > 0 ? this.options.lineEnding : ''}`
  }
}
