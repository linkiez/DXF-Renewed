import { strict as assert } from 'node:assert'
import { MESSAGE_CODES, message } from '../../../../../src/nesting/post/machine/messages'

const PARAMS = {
  path: 'envelope.minX', contour: 'c-1', axis: 'X', value: 7, bound: 9, variable: 'V600', range: '10..300',
  detail: 'x', id: 'proc', revision: 'rev', kind: 'tab', classification: 'inferred', key: 'current', row: 4,
  field: 'gas', material: 'MS', thickness: 6, class: '130Amp', table: 'mm', requested: 'inch', file: 'a.HSTool',
} as const

const USES: Record<string, string[]> = {
  CONFIG_FIELD_MISSING: ['path'], CONFIG_FIELD_INVALID: ['path'], CONFIG_SOURCE_MISSING: ['path'],
  CONFIG_ENVELOPE_INVALID: ['path'], CONFIG_MAPPING_INVALID: ['path'], CONFIG_UNKNOWN_PROCESSOR: ['id', 'revision'],
  UNAPPROVED_VALUE: ['path', 'classification'], OUT_OF_ENVELOPE: ['contour', 'axis', 'value', 'bound'],
  ACTION_UNSUPPORTED: ['kind'], PROCESS_MAPPING_MISSING: ['contour'], PROCESS_SETTING_REQUIRED: ['key'],
  SHEET_DOES_NOT_FIT: ['axis'], HEIGHT_CONTROL_OUT_OF_RANGE: ['variable', 'value', 'range'],
  CUTCHART_ROW_INVALID: ['row'], CUTCHART_CODE_UNKNOWN: ['row', 'field'],
  CUTCHART_ABSENT: ['material', 'thickness', 'class'], CUTCHART_UNIT_MISMATCH: ['table', 'requested'],
  RECIPE_XML_INVALID: ['file'], RECIPE_NAME_UNRECOGNIZED: ['file'], RECIPE_FIELD_MISSING: ['file', 'field'],
}

describe('machine messages', () => {
  it('has the codes of the data model', () => {
    for (const code of [
      'CONFIG_FIELD_MISSING', 'CONFIG_FIELD_INVALID', 'CONFIG_SOURCE_MISSING', 'CONFIG_ENVELOPE_INVALID',
      'CONFIG_MAPPING_INVALID', 'CONFIG_UNKNOWN_PROCESSOR', 'UNAPPROVED_VALUE', 'OUT_OF_ENVELOPE',
      'ACTION_UNSUPPORTED', 'PROCESS_MAPPING_MISSING', 'PROCESS_SETTING_REQUIRED', 'EMPTY_PROGRAM',
      'SHEET_DOES_NOT_FIT', 'HEIGHT_CONTROL_OUT_OF_RANGE', 'CUTCHART_UNVERIFIED', 'CUTCHART_ROW_INVALID',
      'CUTCHART_CODE_UNKNOWN', 'CUTCHART_UNIT_MISSING', 'CUTCHART_ABSENT', 'CUTCHART_UNIT_MISMATCH',
      'RECIPE_XML_INVALID', 'RECIPE_NAME_UNRECOGNIZED', 'RECIPE_FIELD_MISSING',
    ]) assert.ok((MESSAGE_CODES as readonly string[]).includes(code), code)
  })

  it('builds a non-empty Portuguese message that interpolates its parameters', () => {
    for (const code of MESSAGE_CODES) {
      const text = message(code, PARAMS)
      assert.ok(text.length > 0, code)
      for (const key of USES[code] ?? []) {
        assert.ok(text.includes(String(PARAMS[key as keyof typeof PARAMS])), `${code} must interpolate ${key}`)
      }
    }
  })
})
