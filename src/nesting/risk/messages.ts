import { formatQuantity } from '../linking/formatQuantity'
import type { RiskCategory, RiskNoticeCode } from './types'

/** Values a message can interpolate. */
export interface RiskMessageContext {
  partKey?: string
  otherPartKey?: string
  value?: number
  limit?: number
  unit?: string
  detail?: string
  rule?: string
}

const measured = (c: RiskMessageContext): string => `${formatQuantity(c.value ?? 0)} ${c.unit ?? ''}`.trim()
const limit = (c: RiskMessageContext): string => `${formatQuantity(c.limit ?? 0)} ${c.unit ?? ''}`.trim()

/** Every text the risk module produces, in Brazilian Portuguese. */
export const riskMessages: {
  finding: Record<RiskCategory, (context: RiskMessageContext) => string>
  mitigation: Record<RiskCategory, () => string>
  notice: Record<RiskNoticeCode, (context: RiskMessageContext) => string>
  indicative: () => string
  category: Record<RiskCategory, string>
} = {
  finding: {
    heat: (c) => `Acúmulo de calor: ${measured(c)} de corte na região dentro da janela, acima do limite de ${limit(c)}.`,
    'thin-web': (c) =>
      `Alma fina entre ${c.partKey} e ${c.otherPartKey}: ${measured(c)}, abaixo do mínimo de ${limit(c)}.`,
    'loose-part': (c) =>
      `A peça ${c.partKey} fica solta com ${measured(c)} de área, no limite de ${limit(c)} ou abaixo; pode se mover ou levantar.`,
    'head-strike': (c) =>
      `A cabeça passa a ${measured(c)} da peça solta ${c.partKey}, dentro da folga de ${limit(c)}; pode haver batida.`,
  },
  mitigation: {
    heat: () => 'Reordene o corte para alternar regiões, afaste as peças ou acrescente um intervalo de resfriamento.',
    'thin-web': () => 'Afaste as peças, aumente o espaçamento ou use corte de linha comum quando o processo permitir.',
    'loose-part': () => 'Acrescente uma ponte (micro-junção) à peça ou corte-a por último na chapa.',
    'head-strike': () => 'Reordene o corte para soltar a peça depois da passagem da cabeça ou acrescente uma ponte.',
  },
  notice: {
    PROFILE_INVALID: (c) => `O perfil de risco é inválido em ${c.detail}; corrija o valor e avalie novamente.`,
    ESTIMATED_LIMIT: (c) => `O limite ${c.detail} é uma estimativa não verificada; os achados que dependem dele são indicativos.`,
    RULE_NOT_ASSESSABLE: (c) => `A regra de ${c.rule} não pôde ser avaliada: falta a informação ${c.detail}.`,
    SEVERITY_NOT_GRADED: () => 'O fator crítico não foi informado; os achados não são graduados como críticos.',
    NO_ACTIONS: () => 'O plano de corte não tem ações; não há o que avaliar.',
    NO_CUT_PLAN: () => 'Não há plano de corte; a avaliação de risco depende dele.',
    INVALID_ARTIFACT: (c) => `O artefato é inválido (${c.detail}); a avaliação não pode ser feita.`,
    UNSUPPORTED_CONTRACT_VERSION: (c) => `Versão de contrato ${c.detail} não suportada pela avaliação de risco.`,
  },
  category: { heat: 'acúmulo de calor', 'thin-web': 'alma fina', 'loose-part': 'peça solta', 'head-strike': 'batida da cabeça' },
  indicative: () => 'Resultado indicativo, calculado por regras com os limites informados; não substitui um corte de teste.',
}
