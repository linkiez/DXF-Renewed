import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { getMachineConfiguration } from '../../../../../src/nesting/post/machine/getMachineConfiguration'
import { listMachineConfigurations } from '../../../../../src/nesting/post/machine/listMachineConfigurations'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'
import { referencePlan } from '../reference-plan'

describe('built-in machine configurations', () => {
  it('lists exactly the three machines', () => {
    assert.deepEqual(listMachineConfigurations().map((s) => s.configurationId), ['glorystar-gs3015', 'hypertherm-edge-pro-hpr400xda', 'talvi-6000w'])
  })

  it('validates each one, with a classification and a reference on every value, and approves none', () => {
    const classes = new Set(['observed', 'user-confirmed', 'vendor-confirmed', 'inferred'])
    for (const { configurationId } of listMachineConfigurations()) {
      const config = getMachineConfiguration(configurationId)!
      assert.deepEqual(validateMachineConfiguration(config), [], configurationId)
      const walk = (node: unknown, path: string): void => {
        if (Array.isArray(node)) node.forEach((item, i) => walk(item, `${path}[${i}]`))
        else if (node && typeof node === 'object') {
          const record = node as Record<string, unknown>
          if (record.source && typeof record.source === 'object') {
            const source = record.source as { classification: string; reference: string }
            assert.ok(classes.has(source.classification), `${configurationId} ${path}`)
            assert.ok(source.reference.length > 0, `${configurationId} ${path}`)
          }
          for (const [key, value] of Object.entries(record)) walk(value, `${path}.${key}`)
        }
      }
      walk(config, configurationId)
    }
  })

  it('never releases a program from a configuration as shipped (SC-004)', () => {
    for (const { configurationId } of listMachineConfigurations()) {
      const config = getMachineConfiguration(configurationId)!
      const program = generateMachineProgram(referencePlan({ metadata: { kerfSide: 'left' } }), toMachineProfile(config, {
        sheet: { width: 1500, height: 3000, margin: 0 },
        processSettings: { feed: 3000, piercingType: 1, thickness: 6 },
      }))
      assert.equal(program.releasable, false, configurationId)
      assert.ok(program.validationIssues.some((i) => i.code === 'UNAPPROVED_VALUE' || i.code === 'CONFIG_FIELD_MISSING'), configurationId)
    }
  })
})
