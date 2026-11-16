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
})
