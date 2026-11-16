import type { TalviMaterial } from './types'

/** Thickness, material and nozzle read from a tool file name. */
export interface ParsedRecipeName {
  readonly thicknessMm: number
  readonly material: TalviMaterial | null
  readonly nozzle: string
}

const FIRST = /^(\d+(?:\.\d+)?)mm\s+(.+?)\s+([sd])\s?(\d+(?:\.\d+)?)(?:mm)?(?!\d|\.\d)/i
const SECOND = /^(\d+(?:\.\d+)?)双(\d+(?:\.\d+)?)mm/

function materialOf(words: string): TalviMaterial | undefined {
  const text = words.toLowerCase()
  if (text.includes('inox')) return 'stainless-steel'
  if (text.includes('alumin')) return 'aluminium'
  if (text.includes('aco') || text.includes('carbono')) return 'carbon-steel'
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
  const first = FIRST.exec(name)
  if (first) {
    const material = materialOf(first[2])
    return material ? { thicknessMm: Number(first[1]), material, nozzle: `${first[3].toLowerCase()}${Number(first[4])}` } : undefined
  }
  const second = SECOND.exec(name)
  return second ? { thicknessMm: Number(second[2]), material: null, nozzle: `d${Number(second[1])}` } : undefined
}
