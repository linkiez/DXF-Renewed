import { expect } from 'expect'
import { messages } from '../../../../src/nesting/review/messages'

const noticeTexts = (): string[] => [
  messages.unsupportedVersion(2, 1),
  messages.invalidArtifact('contractVersion'),
  messages.noLayout('rejected'),
  messages.noCutPlan(),
  messages.emptySheet('sheet-1'),
  messages.unlinkedAction('part-9', 3),
  messages.unknownPart('part-9'),
  messages.planSheetMissing('sheet-9'),
  messages.degenerateAction(4),
  messages.placementSheetUnresolved('a#0'),
  messages.placementGeometryApproximate('a#0'),
  messages.graphicsUnavailable(),
  messages.graphicsLost(),
]

describe('review/messages — pt_BR single source', () => {
  it('returns a non-empty Brazilian Portuguese message for every review notice code', () => {
    for (const text of noticeTexts()) {
      expect(text.length).toBeGreaterThan(10)
      expect(text).toMatch(/[ãõçáéíóúâêô]|artefato|chapa|peça|ação|não|plano|revisão|gráfic/i)
      expect(text).not.toMatch(/\b(the|not|unavailable|missing)\b/i)
    }
  })

  it('interpolates identifiers so a notice names what it is about', () => {
    expect(messages.emptySheet('sheet-7')).toContain('sheet-7')
    expect(messages.unknownPart('part-9')).toContain('part-9')
    expect(messages.degenerateAction(4)).toContain('4')
    expect(messages.unsupportedVersion(2, 1)).toContain('2')
  })

  it('provides labels, legend, announcements and summary text', () => {
    for (const kind of ['cut', 'rapid', 'pierce', 'lead-in', 'lead-out', 'overcut', 'tab', 'common-line', 'end'] as const) {
      expect(messages.actionLabel(kind).length).toBeGreaterThan(0)
    }
    expect(messages.partStatusLabel('placed')).toBe('Posicionada')
    expect(messages.partStatusLabel('flagged')).toBe('Com problema')
    expect(messages.controls.play).toBe('Reproduzir')
    expect(messages.controls.pause).toBe('Pausar')
    expect(messages.controls.goToAction).toBe('Ir para a ação')
    expect(messages.announceSeek(3, 10)).toBe('Ação 3 de 10')
    expect(messages.announceSelectionCleared()).toBe('Seleção removida')
    expect(messages.summaryText({
      sheetCount: 2, partCount: 5, unplacedCount: 1, yield: 81.5,
      totalCutLength: 120.5, totalRapidLength: 30.25, pierceCount: 7,
    })).toBe(
      'Chapas: 2. Peças: 5. Não alocadas: 1. Aproveitamento: 81,50%. ' +
      'Comprimento de corte: 120,50. Deslocamento rápido: 30,25. Furos de perfuração: 7.',
    )
  })

  it('never returns an empty string from any label function', () => {
    const labels = Object.values(messages.controls)
    expect(labels.every((label) => label.length > 0)).toBe(true)
  })

  it('provides the edit labels and announcements in Brazilian Portuguese', () => {
    expect(messages.edit.panel).toBe('Edição de posição')
    expect(messages.edit.confirm).toBe('Confirmar')
    expect(messages.edit.announceVerdictValid('part-1#0')).toContain('part-1#0')
    expect(messages.edit.announceVerdictInvalid('part-1#0', ['A peça part-1#0 se sobrepõe à peça part-2#0.'])).toContain('sobrepõe')
    expect(messages.edit.announceConfirmed('part-1#0')).toContain('confirmada')
    expect(messages.edit.announceRefused()).toContain('recusada')
    expect(messages.edit.announceUndone()).toContain('desfeita')
    expect(messages.edit.announceRedone()).toContain('refeita')
    expect(messages.edit.planOutdated).toContain('desatualizado')
    expect(messages.edit.freshnessLabel('plan', 'outdated')).toBe('Plano de corte: desatualizado')
    expect(messages.edit.announceRecomputeDone()).toContain('concluído')
    expect(messages.edit.announceRecomputeDiscarded()).toContain('descartado')
    expect(messages.edit.figureLine('Tempo de corte (s)', 100, 90, -10)).toBe('Tempo de corte (s): antes 100,00; depois 90,00; diferença -10,00')
    expect(messages.edit.figureLine('Custo', null, 5, null)).toContain('indisponível')
  })

  it('provides the risk panel texts in Brazilian Portuguese', () => {
    expect(messages.risk.panel).toBe('Risco de corte')
    expect(messages.risk.indicative()).toContain('não substitui')
    expect(messages.risk.summary(3, 4)).toBe('Regras avaliadas: 3 de 4.')
    expect(messages.risk.notAssessable('thin-web', ['web.minimum'])).toContain('web.minimum')
    expect(messages.risk.severityLabel('critical')).toBe('Crítico')
    expect(messages.risk.moment(2, 1.5)).toBe('ação 3, 1,50 s')
    expect(messages.risk.announceFindings(0)).toContain('Nenhum')
  })

  it('provides the heat and timeline texts of the risk views', () => {
    expect(messages.risk.showHeat).toBe('Mostrar calor acumulado')
    expect(messages.risk.heatMax(130)).toBe('Calor máximo neste instante: 130% do limite.')
    expect(messages.risk.heatUnavailable(['speeds.cutting'])).toContain('speeds.cutting')
    expect(messages.risk.timeline).toContain('linha do tempo')
    expect(messages.risk.goTo).toBe('Ir para o achado')
  })
})
