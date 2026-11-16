import type { CostCategory } from './types'

const CATEGORY_LABELS: Record<CostCategory, string> = {
  material: 'material',
  cutting: 'corte',
  pierce: 'perfuração',
  travel: 'deslocamento',
  consumable: 'consumível',
  labour: 'mão de obra',
}

/** Every notice text the cost module produces, in Brazilian Portuguese. */
export const costMessages = {
  unsupportedContractVersion: (version: number, supported: number): string =>
    `Versão de contrato ${version} não suportada; o custo aceita a versão ${supported}.`,
  noLayout: (status: string): string =>
    `O artefato (${status}) não contém layout; não há como calcular o custo.`,
  noCutPlan: (): string =>
    'Não há plano de corte: os componentes que dependem do corte não podem ser calculados.',
  invalidCostModel: (field: string): string =>
    `O modelo de custo é inválido em ${field}; corrija o valor e solicite o relatório novamente.`,
  missingRate: (field: string): string =>
    `A taxa ${field} não foi informada; os componentes que dependem dela ficam incompletos.`,
  missingSpeed: (field: string): string =>
    `A velocidade ${field} não foi informada; os tempos e custos que dependem dela ficam incompletos.`,
  missingDwell: (): string =>
    'O tempo de perfuração não foi informado; o tempo e o custo de perfuração ficam incompletos.',
  missingConsumableLife: (id: string): string =>
    `A vida útil do consumível ${id} não foi informada; o custo de consumíveis fica incompleto.`,
  missingSheetPrice: (stockId: string, kind: 'sheet' | 'remnant'): string =>
    `O preço de ${kind === 'sheet' ? 'chapa inteira' : 'retalho'} ${stockId} não foi informado; o material fica incompleto.`,
  mixedCurrency: (expected: string, found: string): string =>
    `O relatório usa a moeda ${expected}, mas o modelo traz valores em ${found}.`,
  estimatedInput: (field: string): string =>
    `O valor ${field} foi marcado como estimativa; os componentes que o usam ficam estimados.`,
  unlinkedAction: (reference: string, actionIndex: number): string =>
    `A ação ${actionIndex} refere ${reference}, que não foi vinculado a nenhuma peça posicionada.`,
  unknownPart: (partId: string): string =>
    `A peça ${partId} citada pelo plano de corte não existe no artefato.`,
  partWithoutArea: (key: string): string =>
    `A peça ${key} não tem área líquida positiva e não recebe parte do material.`,
  partAreaApproximate: (key: string): string =>
    `A peça ${key} não traz contorno; a área usada vem do retângulo envolvente e é aproximada.`,
  partWithoutCutting: (key: string): string =>
    `A peça ${key} não tem ações de corte vinculadas; os valores dependentes do corte são zero.`,
  areaWithoutHoles: (key: string): string =>
    `A peça ${key} não tem contornos de furo no layout; a área usada é a do contorno externo.`,
  unallocatedDistributed: (category: CostCategory, scope: 'sheet' | 'job', scopeId: string, amount: number): string =>
    `Valor de ${CATEGORY_LABELS[category]} sem peça dona (${amount}, em unidades menores da moeda) foi distribuído às peças ${scope === 'sheet' ? `da chapa ${scopeId}` : 'do job'}.`,
  unplacedNotCharged: (itemId: string, quantity: number): string =>
    `O item ${itemId} (quantidade ${quantity}) não foi alocado e não é cobrado.`,
  placementSheetUnresolved: (key: string): string =>
    `Não foi possível determinar a chapa da peça ${key}; ela não foi considerada no custo.`,
  planSheetMissing: (sheetId: string): string =>
    `O plano de corte refere a chapa ${sheetId}, que não existe no artefato.`,
  categoryLabel: (category: CostCategory): string => CATEGORY_LABELS[category],
}
