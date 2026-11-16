import { message } from '../machine/messages'
import type { ParsedRecipeName } from './parseTalviRecipeName'
import type { XmlNode } from './readFlatXml'
import type { PierceStage, RecipeIssue, TalviCutParameters, TalviLeadParameters, TalviRecipe } from './types'

type Tree = { [tag: string]: XmlNode | XmlNode[] }

const isTree = (node: XmlNode | XmlNode[] | undefined): node is Tree => typeof node === 'object' && node !== null && !Array.isArray(node)
const listOf = (node: XmlNode | XmlNode[] | undefined): XmlNode[] => (node === undefined ? [] : Array.isArray(node) ? node : [node])

function num(tree: Tree, tag: string): number | undefined {
  const value = tree[tag]
  if (typeof value !== 'string' || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const text = (tree: Tree, tag: string): string | undefined => {
  const value = tree[tag]
  return typeof value === 'string' && value !== '' ? value : undefined
}

const REQUIRED_NUMBERS = ['dHeight', 'dSpeed', 'nPower', 'nFrequency', 'nDuty', 'dGasPressure', 'dFocus'] as const
const REQUIRED_TEXT = ['strGasType'] as const

function optional(tree: Tree, tag: string): { value: number } | Record<string, never> {
  const value = num(tree, tag)
  return value === undefined ? {} : { value }
}

function cutOf(cut: Tree): TalviCutParameters {
  const pre = optional(cut, 'nPreCutDelay')
  const cool = optional(cut, 'nCoolDelay')
  const spot = optional(cut, 'dSpotSize')
  return {
    height: num(cut, 'dHeight') as number,
    speed: num(cut, 'dSpeed') as number,
    power: num(cut, 'nPower') as number,
    frequency: num(cut, 'nFrequency') as number,
    duty: num(cut, 'nDuty') as number,
    gasType: text(cut, 'strGasType') as string,
    gasPressure: num(cut, 'dGasPressure') as number,
    focus: num(cut, 'dFocus') as number,
    ...('value' in pre ? { preCutDelay: pre.value } : {}),
    ...('value' in cool ? { coolDelay: cool.value } : {}),
    ...('value' in spot ? { spotSize: spot.value } : {}),
  }
}

function numbers<K extends string>(tree: Tree, table: Readonly<Record<K, string>>): Record<K, number> {
  const out = {} as Record<K, number>
  for (const key of Object.keys(table) as K[]) out[key] = num(tree, table[key]) ?? 0
  return out
}

const STAGE_NUMBERS = {
  time: 'nTime', height: 'dHeight', pressure: 'dGasPressure', power: 'nPower', duty: 'nDuty',
  frequency: 'nFrequency', focusStart: 'dStartFocus', focusEnd: 'dEndFocus',
} as const

const LEAD_NUMBERS = {
  cuttingVelocity: 'dLeadCuttingVel', duty: 'dLeadDuty', frequency: 'dLeadFrequency', height: 'dLeadHight',
  stableDistance: 'dLeadStableDis', circleVelocity: 'dLeadCircleVel', focus: 'dLeadFocus',
  startLineLength: 'dLeadStartLineLong', inCircleRadius: 'dLeadInCirRadius',
} as const

function stagesOf(root: Tree): PierceStage[] {
  const list = root.HPierceParamtersList
  const stages = isTree(list) ? listOf(list.HPiercing) : []
  return stages.filter(isTree).filter((s) => s.bOpen === 'true').map((s) => ({
    type: text(s, 'strType') ?? '',
    gas: text(s, 'strGasType') ?? '',
    ...numbers(s, STAGE_NUMBERS),
  }))
}

function leadOf(cut: Tree): TalviLeadParameters | undefined {
  return cut.bopenLeadPar === 'true' ? numbers(cut, LEAD_NUMBERS) : undefined
}

function missing(file: string, field: string): { issue: RecipeIssue } {
  return { issue: { file, code: 'RECIPE_FIELD_MISSING', message: message('RECIPE_FIELD_MISSING', { file, field }) } }
}

/**
 * Build a recipe from the parsed tool file.
 *
 * @param file - File name (the recipe identifier).
 * @param name - Values read from the file name.
 * @param tree - Parsed tool file.
 * @returns The recipe, or the issue naming the first missing required field.
 */
export function recipeFromTree(file: string, name: ParsedRecipeName, tree: XmlNode): { recipe: TalviRecipe } | { issue: RecipeIssue } {
  if (!isTree(tree)) return missing(file, 'HTool')
  const cut = tree.HCutParamtersSt
  if (!isTree(cut)) return missing(file, 'HCutParamtersSt')
  const tool = num(tree, 'nTNumber')
  if (tool === undefined) return missing(file, 'nTNumber')
  const absent = [...REQUIRED_NUMBERS.filter((tag) => num(cut, tag) === undefined), ...REQUIRED_TEXT.filter((tag) => text(cut, tag) === undefined)][0]
  if (absent) return missing(file, absent)
  const lead = leadOf(cut)
  return {
    recipe: {
      id: file,
      thicknessMm: name.thicknessMm,
      material: name.material,
      nozzle: name.nozzle,
      toolNumber: tool,
      cut: cutOf(cut),
      pierceStages: stagesOf(tree),
      ...(lead ? { lead } : {}),
      speedUnitConfirmed: false,
    },
  }
}
