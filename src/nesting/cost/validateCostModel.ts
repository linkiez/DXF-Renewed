import { costMessages } from './messages'
import type { CostModel, CostNotice, Money } from './types'

type Rule = 'nonNegative' | 'positive'

interface Field {
  path: string
  value: number
  rule: Rule
}

const valid = (field: Field): boolean =>
  Number.isFinite(field.value) && (field.rule === 'positive' ? field.value > 0 : field.value >= 0)

const optional = (path: string, entry: { value: number } | undefined, rule: Rule): Field[] =>
  entry ? [{ path, value: entry.value, rule }] : []

const moneyEntries = (model: CostModel): { path: string; entry: Money }[] => [
  ...Object.entries(model.material.fullSheet).map(([id, entry]) => ({ path: `material.fullSheet.${id}`, entry })),
  ...Object.entries(model.material.remnant).map(([id, entry]) => ({ path: `material.remnant.${id}`, entry })),
  ...Object.entries(model.rates ?? {})
    .filter(([, entry]) => entry !== undefined)
    .map(([name, entry]) => ({ path: `rates.${name}`, entry: entry as Money })),
  ...model.consumables.map((consumable) => ({ path: `consumables.${consumable.id}.cost`, entry: consumable.cost })),
]

const numericFields = (model: CostModel): Field[] => [
  { path: 'geometryUnitsPerMeter', value: model.geometryUnitsPerMeter, rule: 'positive' },
  ...optional('speeds.cutting', model.speeds?.cutting, 'positive'),
  ...optional('speeds.rapid', model.speeds?.rapid, 'positive'),
  ...optional('speeds.pierceDwellSeconds', model.speeds?.pierceDwellSeconds, 'nonNegative'),
  ...optional('handling.secondsPerSheet', model.handling?.secondsPerSheet, 'nonNegative'),
  ...optional('handling.secondsPerJob', model.handling?.secondsPerJob, 'nonNegative'),
  ...moneyEntries(model).map(({ path, entry }) => ({ path, value: entry.value, rule: 'nonNegative' as const })),
  ...model.consumables.flatMap((consumable) =>
    consumable.life ? [{ path: `consumables.${consumable.id}.life`, value: consumable.life.value.amount, rule: 'positive' as const }] : [],
  ),
]

const currencyIssues = (model: CostModel): string[] => {
  const issues: string[] = []
  if (!/^[A-Z]{3}$/.test(model.currency.code)) issues.push('currency.code')
  const digits = model.currency.minorUnitDigits
  if (!Number.isInteger(digits) || digits < 0 || digits > 4) issues.push('currency.minorUnitDigits')
  return issues
}

const duplicateIds = (model: CostModel): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const { id } of model.consumables) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return [...duplicates].map((id) => `consumables.${id}`)
}

const error = (code: CostNotice['code'], message: string): CostNotice => ({ severity: 'error', code, message })

/**
 * Validates a cost model beyond its schema and returns every issue found.
 *
 * Rates, prices, handling times and consumable costs must be finite and at least zero; speeds,
 * consumable lives and the geometry unit must be greater than zero; the currency code is three
 * upper-case letters with zero to four minor-unit digits; consumable ids are unique; and a value
 * that declares another currency is a mixed currency. An absent optional field is not an issue.
 *
 * @param model - Cost model to validate.
 * @returns One error notice per issue; empty when the model is valid. Never throws.
 */
export function validateCostModel(model: CostModel): CostNotice[] {
  const invalid = [
    ...numericFields(model).filter((field) => !valid(field)).map((field) => field.path),
    ...currencyIssues(model),
    ...duplicateIds(model),
  ]
  const mixed = moneyEntries(model)
    .filter(({ entry }) => entry.currency !== undefined && entry.currency !== model.currency.code)
    .map(({ entry }) => entry.currency as string)
  return [
    ...invalid.map((path) => error('INVALID_COST_MODEL', costMessages.invalidCostModel(path))),
    ...mixed.map((found) => error('MIXED_CURRENCY', costMessages.mixedCurrency(model.currency.code, found))),
  ]
}
