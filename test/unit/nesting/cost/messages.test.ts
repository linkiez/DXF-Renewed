import { expect } from 'expect'
import { costMessages } from '../../../../src/nesting/cost/messages'

const all = (): string[] => [
  costMessages.unsupportedContractVersion(2, 1),
  costMessages.noLayout('rejected'),
  costMessages.noCutPlan(),
  costMessages.invalidCostModel('rates.cuttingPerHour'),
  costMessages.missingRate('rates.cuttingPerHour'),
  costMessages.missingSpeed('speeds.cutting'),
  costMessages.missingDwell(),
  costMessages.missingConsumableLife('nozzle'),
  costMessages.missingSheetPrice('sheet-1', 'sheet'),
  costMessages.mixedCurrency('BRL', 'USD'),
  costMessages.estimatedInput('speeds.cutting'),
  costMessages.unlinkedAction('c-9', 3),
  costMessages.unknownPart('ghost'),
  costMessages.partWithoutArea('part-1#0'),
  costMessages.partWithoutCutting('part-1#0'),
  costMessages.areaWithoutHoles('part-1#0'),
  costMessages.unallocatedDistributed('travel', 'sheet', 'sheet-1', 1250),
  costMessages.unplacedNotCharged('part-9', 2),
  costMessages.planSheetMissing('sheet-9'),
  costMessages.placementSheetUnresolved('part-1#0'),
  costMessages.partAreaApproximate('part-1#0'),
]

describe('cost/messages — pt_BR single source', () => {
  it('returns a non-empty Brazilian Portuguese message for every notice code', () => {
    for (const text of all()) {
      expect(text.length).toBeGreaterThan(15)
      expect(text).toMatch(/[ãõçáéíóúâêô]|chapa|peça|plano|custo|modelo|valor|taxa|ação/i)
      expect(text).not.toMatch(/\b(the|not|missing|rate is)\b/i)
    }
  })

  it('interpolates identifiers and values so a notice names what it is about', () => {
    expect(costMessages.missingRate('rates.cuttingPerHour')).toContain('rates.cuttingPerHour')
    expect(costMessages.missingSheetPrice('sheet-7', 'remnant')).toContain('sheet-7')
    expect(costMessages.unallocatedDistributed('travel', 'sheet', 'sheet-1', 1250)).toContain('1250')
    expect(costMessages.unallocatedDistributed('travel', 'sheet', 'sheet-1', 1250)).toContain('sheet-1')
    expect(costMessages.unplacedNotCharged('part-9', 2)).toContain('part-9')
    expect(costMessages.mixedCurrency('BRL', 'USD')).toContain('USD')
  })

  it('names the cost categories in Portuguese', () => {
    expect(costMessages.categoryLabel('material')).toBe('material')
    expect(costMessages.categoryLabel('cutting')).toBe('corte')
    expect(costMessages.categoryLabel('pierce')).toBe('perfuração')
    expect(costMessages.categoryLabel('travel')).toBe('deslocamento')
    expect(costMessages.categoryLabel('consumable')).toBe('consumível')
    expect(costMessages.categoryLabel('labour')).toBe('mão de obra')
  })

  it('distinguishes a sheet from a remnant in the missing price message', () => {
    expect(costMessages.missingSheetPrice('s', 'sheet')).toContain('chapa inteira')
    expect(costMessages.missingSheetPrice('s', 'remnant')).toContain('retalho')
  })
})
