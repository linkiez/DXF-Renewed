import { formatQuantity } from '../linking/formatQuantity'
import type { EditNoticeCode, ViolationCode } from './types'

/** Values a message can interpolate. */
export interface MessageContext {
  partKey?: string
  otherPartKey?: string
  zoneId?: string
  value?: number | string
  limit?: number | string
  detail?: string
}

const text = (value: number | string | undefined): string =>
  typeof value === 'number' ? formatQuantity(value) : (value ?? '')

/** Every text the edit module produces, in Brazilian Portuguese. */
export const editMessages: {
  violation: Record<ViolationCode, (context: MessageContext) => string>
  notice: Record<EditNoticeCode, (context: MessageContext) => string>
} = {
  violation: {
    OVERLAP: (c) => `A peça ${c.partKey} se sobrepõe à peça ${c.otherPartKey}.`,
    OUTSIDE_USABLE_AREA: (c) => `A peça ${c.partKey} sai da área útil da chapa ou invade a margem de borda.`,
    FORBIDDEN_ZONE: (c) => `A peça ${c.partKey} invade a zona proibida ${c.zoneId}.`,
    SPACING_TOO_SMALL: (c) =>
      `A peça ${c.partKey} fica a ${text(c.value)} da peça ${c.otherPartKey}; o espaçamento mínimo é ${text(c.limit)}.`,
    ROTATION_NOT_ALLOWED: (c) => `A rotação de ${text(c.value)} graus não é permitida para a peça ${c.partKey}.`,
    GRAIN_LOCKED: (c) => `A peça ${c.partKey} tem fibra travada em ${text(c.limit)} graus e não pode girar para fora dela.`,
    MIRROR_NOT_ALLOWED: (c) => `A peça ${c.partKey} não pode ser espelhada.`,
    CONSTRAINTS_UNKNOWN: (c) =>
      `As restrições de ${c.detail ?? 'orientação'} da peça ${c.partKey} não foram informadas; a edição foi recusada em vez de adivinhada.`,
    OUTLINE_UNAVAILABLE: (c) =>
      `A peça ${c.partKey} só tem o retângulo envolvente, sem contorno; apenas o deslocamento é possível.`,
    GROUP_INVALID: (c) => `A peça ${c.otherPartKey}, interna a ${c.partKey}, ficaria numa posição inválida.`,
  },
  notice: {
    APPROXIMATE_OUTLINE: (c) => `A peça ${c.partKey} não traz contorno; o veredito usa o retângulo envolvente e é aproximado.`,
    RECOMPUTE_DISCARDED: (c) =>
      `Houve uma edição durante o recálculo de ${c.detail}; o resultado foi descartado e continua desatualizado.`,
    EDIT_LOG_FULL: (c) => `O registro de edições atingiu o limite de ${text(c.limit)}; a edição não foi aplicada.`,
    PLAN_RECOMPUTE_FAILED: (c) => `Não foi possível recalcular o plano de corte: ${c.detail}.`,
    COST_RECOMPUTE_FAILED: (c) => `Não foi possível recalcular o custo: ${c.detail}.`,
    RISK_UNAVAILABLE: (c) => `A avaliação de risco não está disponível: ${c.detail}.`,
    COMMON_LINE_BROKEN: (c) => `Mover a peça ${c.partKey} desfez uma linha de corte comum; a economia associada se perde.`,
    NO_LAYOUT: () => 'O artefato não contém layout; não há peças para editar.',
    INVALID_ARTIFACT: (c) => `O artefato é inválido (${c.detail}); a edição não pode começar.`,
    FIGURE_OUTDATED: (c) => `O valor de ${c.detail} está desatualizado ou indisponível e não entra na comparação.`,
    INVALID_INPUT: (c) => `A entrada da edição é inválida em ${c.detail}; corrija o valor e inicie a edição novamente.`,
    PLACEMENT_SHEET_UNRESOLVED: (c) => `A peça ${c.partKey} não tem chapa definida e não pode ser editada.`,
    UNSUPPORTED_CONTRACT_VERSION: (c) =>
      `Versão de contrato ${text(c.value)} não suportada; a edição aceita a versão ${text(c.limit)}.`,
  },
}
