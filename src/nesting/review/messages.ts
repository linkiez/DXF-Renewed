import type { CutActionKind } from '../cutPath/types'
import type { DerivedResult, FreshnessState } from '../edit/types'
import { riskMessages } from '../risk/messages'
import type { RiskCategory, RiskSeverity } from '../risk/types'
import type { ReviewPartStatus, ReviewSummary } from './types'

const decimal = (value: number): string => value.toFixed(2).replace('.', ',')

const ACTION_LABELS: Record<CutActionKind, string> = {
  rapid: 'Deslocamento rápido',
  pierce: 'Perfuração',
  'lead-in': 'Entrada',
  cut: 'Corte',
  'lead-out': 'Saída',
  overcut: 'Sobrecorte',
  tab: 'Ponte',
  'common-line': 'Corte em linha comum',
  end: 'Fim do programa',
}

const DERIVED_LABELS: Record<DerivedResult, string> = {
  plan: 'Plano de corte',
  cost: 'Custo',
  validation: 'Validações',
  risk: 'Risco',
}

/** Every user-facing string the review produces, in Brazilian Portuguese. */
export const messages = {
  unsupportedVersion: (version: number, supported: number): string =>
    `Versão de contrato ${version} não suportada; a revisão aceita a versão ${supported}.`,
  invalidArtifact: (detail: string): string =>
    `O artefato não passou na validação do contrato (${detail}); não é exibido como válido.`,
  noLayout: (status: string): string =>
    `O artefato (${status}) não contém layout; revise os motivos de rejeição listados.`,
  noCutPlan: (): string =>
    'Não há plano de corte: a reprodução e a inspeção de ações não estão disponíveis.',
  emptySheet: (sheetId: string): string => `A chapa ${sheetId} não tem peças posicionadas.`,
  unlinkedAction: (reference: string, actionIndex: number): string =>
    `A ação ${actionIndex} refere ${reference}, que não foi vinculado a nenhuma peça posicionada.`,
  unplacedItem: (itemId: string, quantity: number, reason: string): string =>
    `Item ${itemId} (quantidade ${quantity}) não alocado: ${reason}`,
  unknownPart: (partId: string): string =>
    `A peça ${partId} citada pelo plano de corte não existe no artefato.`,
  planSheetMissing: (sheetId: string): string =>
    `O plano de corte refere a chapa ${sheetId}, que não existe no artefato.`,
  degenerateAction: (actionIndex: number): string =>
    `A ação ${actionIndex} tem comprimento zero; foi mantida na sequência.`,
  placementSheetUnresolved: (key: string): string =>
    `Não foi possível determinar a chapa da peça ${key}; ela não foi desenhada.`,
  placementGeometryApproximate: (key: string): string =>
    `A peça ${key} não traz contorno; é exibida pelo retângulo envolvente.`,
  graphicsUnavailable: (): string =>
    'Aceleração gráfica indisponível; a revisão estática foi mantida.',
  graphicsLost: (): string =>
    'O contexto gráfico foi perdido; a revisão estática foi mantida na mesma posição.',

  actionLabel: (kind: CutActionKind): string => ACTION_LABELS[kind],
  partTitle: (key: string): string => `Peça ${key}`,
  actionTitle: (actionNumber: number, label: string): string => `Ação ${actionNumber}: ${label}`,
  partStatusLabel: (status: ReviewPartStatus): string =>
    status === 'placed' ? 'Posicionada' : 'Com problema',

  controls: {
    play: 'Reproduzir',
    pause: 'Pausar',
    reset: 'Reiniciar',
    nextPierce: 'Próxima perfuração',
    slower: 'Mais lento',
    faster: 'Mais rápido',
    goToAction: 'Ir para a ação',
    position: 'Posição na sequência',
    speed: 'Velocidade',
    playback: 'Reprodução',
    sheet: 'Chapa',
    clearSelection: 'Limpar seleção',
  },
  panels: {
    identity: 'Identificação do artefato',
    notices: 'Avisos e motivos',
    inspector: 'Inspeção',
    summary: 'Resumo',
    legend: 'Legenda',
    shortcuts: 'Atalhos de teclado',
    viewKeyboard: 'Vista da chapa (use as setas e as teclas de atalho)',
    view: 'Vista da chapa',
    noNotices: 'Nenhum aviso.',
    nothingSelected: 'Nenhuma peça ou ação selecionada.',
  },
  identityLabels: {
    status: 'Situação',
    contractVersion: 'Versão do contrato',
    order: 'Pedido',
    revision: 'Revisão',
    request: 'Requisição',
    inputDigest: 'Resumo de entrada',
    outputDigest: 'Resumo de saída',
  },
  inspectLabels: {
    part: 'Peça',
    action: 'Ação',
    shape: 'Forma',
    instance: 'Instância',
    rotation: 'Rotação',
    position: 'Posição',
    bounds: 'Limites',
    layer: 'Camada',
    handle: 'Identificador de origem',
    area: 'Área',
    perimeter: 'Perímetro',
    status: 'Situação',
    kind: 'Tipo',
    owningPart: 'Peça',
    unlinked: 'sem vínculo',
    order: 'Pedido',
    revision: 'Revisão',
    request: 'Requisição',
  },

  shortcutLines: [
    'Espaço: reproduzir ou pausar',
    'R: reiniciar; N: próxima perfuração; < e >: velocidade',
    '[ e ]: chapa anterior ou seguinte',
    ', e .: ação anterior ou seguinte; PageUp e PageDown: dez ações; Home e End: início e fim',
    'Setas esquerda e direita: peça anterior ou seguinte; setas acima e abaixo: ação anterior ou seguinte',
    'Enter: ir para a ação selecionada; Esc: limpar seleção',
    'Shift e setas: mover a vista; + e -: ampliar e reduzir; 0: restaurar a vista',
  ],
  announceSeek: (actionNumber: number, total: number): string =>
    `Ação ${actionNumber} de ${total}`,
  announcePlaying: (): string => 'Reprodução iniciada',
  announcePaused: (): string => 'Reprodução pausada',
  announceSheet: (sheetId: string): string => `Chapa ${sheetId}`,
  announceSelection: (title: string): string => `Selecionado: ${title}`,
  announceSelectionCleared: (): string => 'Seleção removida',
  announceRendererFallback: (): string => 'Vista estática ativada',

  edit: {
    panel: 'Edição de posição',
    enter: 'Editar posições',
    leave: 'Sair da edição',
    kind: 'Tipo de edição',
    move: 'Mover',
    rotate: 'Girar',
    mirror: 'Espelhar',
    dx: 'Deslocamento em X',
    dy: 'Deslocamento em Y',
    degrees: 'Ângulo em graus',
    propose: 'Propor',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    undo: 'Desfazer',
    redo: 'Refazer',
    part: 'Peça em edição',
    noPart: 'Selecione uma peça para editar.',
    verdictValid: 'Posição válida.',
    verdictInvalid: 'Posição inválida:',
    derived: 'Resultados derivados',
    recompute: 'Recalcular',
    comparison: 'Comparação com o original',
    recomputeUnavailable: 'Recálculo indisponível: informe o perfil de processo da edição.',
    announceRecomputeDone: (): string => 'Recálculo concluído.',
    announceRecomputeDiscarded: (): string => 'Houve uma edição durante o recálculo; o resultado foi descartado.',
    figureLine: (label: string, before: number | null, after: number | null, delta: number | null): string =>
      `${label}: antes ${before === null ? 'indisponível' : decimal(before)}; depois ${after === null ? 'indisponível' : decimal(after)}${delta === null ? '' : `; diferença ${decimal(delta)}`}`,
    figureLabels: { invalidParts: 'Peças com violação', cutSeconds: 'Tempo de corte (s)', cost: 'Custo', heat: 'Calor', 'thin-web': 'Alma fina', 'loose-part': 'Peça solta', 'head-strike': 'Batida da cabeça' } as Record<string, string>,
    planOutdated:
      'O plano de corte está desatualizado; o caminho de corte antigo foi ocultado até o recálculo.',
    shortcuts: 'Setas: deslocar; Q e E: girar; M: espelhar; Enter: confirmar; Esc: cancelar; Ctrl+Z: desfazer; Ctrl+Y: refazer',
    freshnessLabel: (result: DerivedResult, state: FreshnessState): string =>
      `${DERIVED_LABELS[result]}: ${state === 'current' ? 'atual' : 'desatualizado'}`,
    announceEntered: (): string => 'Modo de edição ativado',
    announceLeft: (): string => 'Modo de edição desativado',
    announceVerdictValid: (partKey: string): string => `Posição válida para a peça ${partKey}.`,
    announceVerdictInvalid: (partKey: string, reasons: readonly string[]): string =>
      `Posição inválida para a peça ${partKey}: ${reasons.join(' ')}`,
    announceConfirmed: (partKey: string): string => `Edição da peça ${partKey} confirmada.`,
    announceRefused: (): string => 'Edição recusada: a posição é inválida.',
    announceCancelled: (): string => 'Edição cancelada.',
    announceUndone: (): string => 'Edição desfeita.',
    announceRedone: (): string => 'Edição refeita.',
  },

  risk: {
    panel: 'Risco de corte',
    indicative: (): string => riskMessages.indicative(),
    summary: (assessed: number, total: number): string => `Regras avaliadas: ${assessed} de ${total}.`,
    noFindings: 'Nenhum achado nas regras avaliadas.',
    outdated: 'O risco está desatualizado; recalcule para avaliar o layout editado.',
    unavailable: 'A avaliação de risco não está disponível.',
    notAssessable: (category: RiskCategory, missing: readonly string[]): string =>
      `${riskMessages.category[category]}: não avaliada, falta ${missing.join(', ')}.`,
    severityLabel: (severity: RiskSeverity): string => (severity === 'critical' ? 'Crítico' : 'Aviso'),
    categoryLabel: (category: RiskCategory): string => riskMessages.category[category],
    labels: { part: 'Peça', otherPart: 'Outra peça', region: 'Região', moment: 'Momento', measured: 'Medido', limit: 'Limite', mitigation: 'Sugestão' },
    moment: (actionIndex: number | undefined, seconds: number | undefined): string =>
      [actionIndex === undefined ? '' : `ação ${actionIndex + 1}`, seconds === undefined ? '' : `${decimal(seconds)} s`].filter(Boolean).join(', '),
    showHeat: 'Mostrar calor acumulado',
    heatMax: (percent: number): string => `Calor máximo neste instante: ${percent}% do limite.`,
    heatUnavailable: (missing: readonly string[]): string => `Calor indisponível: falta ${missing.join(', ') || 'informação do perfil'}.`,
    timeline: 'Marcadores na linha do tempo',
    goTo: 'Ir para o achado',
    announceFindings: (count: number): string => (count === 0 ? 'Nenhum achado de risco.' : `${count} achados de risco.`),
  },

  svgTitle: (sheetId: string): string => `Chapa ${sheetId}`,
  svgDescription: (parts: number, actions: number): string =>
    `${parts} peças posicionadas e ${actions} ações de corte planejadas.`,

  summaryText: (summary: ReviewSummary): string =>
    `Chapas: ${summary.sheetCount}. Peças: ${summary.partCount}. ` +
    `Não alocadas: ${summary.unplacedCount}. Aproveitamento: ${decimal(summary.yield)}%. ` +
    `Comprimento de corte: ${decimal(summary.totalCutLength)}. ` +
    `Deslocamento rápido: ${decimal(summary.totalRapidLength)}. ` +
    `Furos de perfuração: ${summary.pierceCount}.`,
}
