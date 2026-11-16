import type { TalviMaterial } from './types'

/** Thickness, material and nozzle read from a tool file name. */
export interface ParsedRecipeName {
  readonly thicknessMm: number
  readonly material: TalviMaterial | null
  readonly nozzle: string
}

const LEADING = /^(\d+(?:\.\d+)?)mm\s/
const NOZZLE = /^([sd])(\d+(?:\.\d+)?)(?!\d|\.\d)/i
const NUMBER = /^(\d+(?:\.\d+)?)(?!\d|\.\d)/
const SECOND = /^(\d+(?:\.\d+)?)双(\d+(?:\.\d+)?)mm/

function materialOf(words: string): TalviMaterial | undefined {
  const text = words.toLowerCase()
  if (text.includes('inox')) return 'stainless-steel'
  if (text.includes('alumin')) return 'aluminium'
  if (text.includes('aco') || text.includes('carbono')) return 'carbon-steel'
  return undefined
}

function nozzleAt(tokens: readonly string[], index: number): string | undefined {
  const joined = NOZZLE.exec(tokens[index])
  if (joined) return `${joined[1].toLowerCase()}${Number(joined[2])}`
  const letter = /^[sd]$/i.test(tokens[index]) ? NUMBER.exec(tokens[index + 1] ?? '') : null
  return letter ? `${tokens[index].toLowerCase()}${Number(letter[1])}` : undefined
}

function parseFirst(thicknessMm: number, tokens: readonly string[]): ParsedRecipeName | undefined {
  for (let index = 1; index < tokens.length; index++) {
    const nozzle = nozzleAt(tokens, index)
    if (nozzle === undefined) continue
    const material = materialOf(tokens.slice(0, index).join(' '))
    return material ? { thicknessMm, material, nozzle } : undefined
  }
  return undefined
}

/**
 * Read the thickness, material and nozzle of a tool file name.
 *
 * Two patterns exist: `<thickness>mm <material> <s|d><nozzle>` and `<nozzle>双<thickness>mm` (no material). A name that
 * fits neither is never guessed.
 *
 * @param name - File name.
 * @returns The parsed values, or `undefined` when the name is not recognized.
 */
export function parseTalviRecipeName(name: string): ParsedRecipeName | undefined {
  const leading = LEADING.exec(name)
  if (leading) return parseFirst(Number(leading[1]), name.slice(leading[0].length).split(/\s+/))
  const second = SECOND.exec(name)
  return second ? { thicknessMm: Number(second[2]), material: null, nozzle: `d${Number(second[1])}` } : undefined
}
