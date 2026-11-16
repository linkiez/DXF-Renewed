/**
 * Brazilian Portuguese texts of the machine configuration, dialect, cut chart and recipe issues.
 *
 * Internal module: the single place where these texts are built. Codes and parameter names stay in English.
 *
 * @module nesting/post/machine/messages
 */

/** Values interpolated into a message. */
export type MessageParams = Readonly<Record<string, string | number | undefined>>

const BUILDERS = {
  CONFIG_FIELD_MISSING: (p: MessageParams) => `O campo obrigatório "${p.path}" não foi informado.`,
  CONFIG_FIELD_INVALID: (p: MessageParams) => `O valor de "${p.path}" é inválido${p.detail ? `: ${p.detail}` : ''}.`,
  CONFIG_SOURCE_MISSING: (p: MessageParams) => `O valor "${p.path}" não tem fonte ou referência de evidência.`,
  CONFIG_ENVELOPE_INVALID: (p: MessageParams) => `O envelope de trabalho "${p.path}" é inválido: o mínimo deve ser menor que o máximo em cada eixo.`,
  CONFIG_MAPPING_INVALID: (p: MessageParams) => `O mapeamento de processo "${p.path}" é inválido${p.detail ? `: ${p.detail}` : ''}.`,
  CONFIG_UNKNOWN_PROCESSOR: (p: MessageParams) => `O processador ${p.id}@${p.revision} não está registrado.`,
  UNAPPROVED_VALUE: (p: MessageParams) => `O valor crítico "${p.path}" está como "${p.classification}" e ainda não foi aprovado; o programa não pode ser liberado.`,
  OUT_OF_ENVELOPE: (p: MessageParams) => `O contorno ${p.contour} sai do envelope da máquina no eixo ${p.axis}: ${p.value} fora do limite ${p.bound}.`,
  ACTION_UNSUPPORTED: (p: MessageParams) => `A ação "${p.kind}" não é suportada por este dialeto.`,
  PROCESS_MAPPING_MISSING: (p: MessageParams) => `O contorno ${p.contour} não tem seletor de processo aprovado${p.value === undefined ? '' : ` para "${p.value}"`}; nenhum seletor foi inventado.`,
  PROCESS_SETTING_REQUIRED: (p: MessageParams) => `O parâmetro de processo "${p.key}" é obrigatório.`,
  EMPTY_PROGRAM: () => 'O plano não tem nenhum contorno com furo inicial; não há programa a liberar.',
  SHEET_DOES_NOT_FIT: (p: MessageParams) => `A chapa não cabe no envelope da máquina no eixo ${p.axis}.`,
  HEIGHT_CONTROL_OUT_OF_RANGE: (p: MessageParams) => `A variável ${p.variable} vale ${p.value}, fora da faixa do fabricante (${p.range}).`,
  CUTCHART_UNVERIFIED: () => 'Os parâmetros do cut chart foram informados manualmente e não foram verificados contra uma tabela; o CNC recusa valores que não existam no cut chart dele.',
  CUTCHART_ROW_INVALID: (p: MessageParams) => `A linha ${p.row} da tabela de corte não pôde ser lida${p.detail ? `: ${p.detail}` : ''}.`,
  CUTCHART_CODE_UNKNOWN: (p: MessageParams) => `A linha ${p.row} usa um código desconhecido em "${p.field}"${p.value === undefined ? '' : ` (${p.value})`}.`,
  CUTCHART_UNIT_MISSING: () => 'A unidade da tabela de corte está ausente ou é desconhecida (esperado "mm" ou "in").',
  CUTCHART_ABSENT: (p: MessageParams) => `Não há entrada de corte para ${p.material}, ${p.thickness} e a classe "${p.class}".`,
  CUTCHART_UNIT_MISMATCH: (p: MessageParams) => `A tabela de corte está em "${p.table}" e a máquina em "${p.requested}"; nenhum valor foi convertido.`,
  RECIPE_XML_INVALID: (p: MessageParams) => `O arquivo de receita ${p.file} não é um XML válido.`,
  RECIPE_NAME_UNRECOGNIZED: (p: MessageParams) => `O nome do arquivo de receita ${p.file} não segue nenhum padrão conhecido.`,
  RECIPE_FIELD_MISSING: (p: MessageParams) => `O arquivo de receita ${p.file} não tem o campo "${p.field}".`,
} as const

/** Codes that have a message builder. */
export type MessageCode = keyof typeof BUILDERS

/** Every code that has a message builder, in a stable order. */
export const MESSAGE_CODES = Object.keys(BUILDERS) as readonly MessageCode[]

/**
 * Build the pt_BR text of an issue code.
 *
 * @param code - Issue code.
 * @param params - Values interpolated into the text.
 * @returns The message.
 */
export function message(code: MessageCode, params: MessageParams = {}): string {
  return BUILDERS[code](params)
}
