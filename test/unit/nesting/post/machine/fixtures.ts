import { gloryStarGs3015Configuration } from '../../../../../src/nesting/post/machine/gloryStarGs3015'
import { hyperthermHpr400xdaConfiguration } from '../../../../../src/nesting/post/machine/hyperthermHpr400xda'
import { talvi6000wConfiguration } from '../../../../../src/nesting/post/machine/talvi6000w'
import type { ConfigurationIssue, MachineConfiguration, ValueClassification, ValueSource } from '../../../../../src/nesting/post/machine/types'

const source = (classification: ValueClassification): ValueSource => ({ classification, reference: 'fixture' })

/** Valid configuration for the registered `generic-laser@1` processor, every value `approved`. */
export function baseConfiguration(overrides: Partial<MachineConfiguration> = {}): MachineConfiguration {
  const approved = source('approved')
  return {
    configurationId: 'fixture-machine',
    revision: 'rev-1',
    name: 'Fixture machine',
    machineKind: 'laser',
    processorId: 'generic-laser',
    processorRevision: '1',
    units: { value: 'mm', source: approved },
    envelope: { value: { minX: -1500, maxX: 0, minY: 0, maxY: 3000 }, source: approved },
    frame: { value: { rotationDegrees: 0, origin: 'bottom-right' }, source: approved },
    table: { value: { width: 1500, height: 3000 }, source: approved },
    rapidFeed: { value: 26000, source: approved },
    arcCenter: { value: 'incremental', source: approved },
    decimals: { value: 4, source: approved },
    trailingZeros: { value: true, source: approved },
    output: { extension: { value: '.nc', source: approved }, lineEnding: { value: 'lf', source: approved } },
    operations: { value: ['rapid', 'pierce', 'cut', 'end'], source: approved },
    dialect: {},
    externalDependencies: [],
    controllerPreconditions: [],
    ...overrides,
  }
}

type Node = Record<string, unknown>

/** Copy of the configuration with every classification set to `approved`. */
export function approveAll(configuration: MachineConfiguration): MachineConfiguration {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const record = node as Node
      const out: Node = {}
      for (const [key, value] of Object.entries(record)) {
        if (key === 'source' && value && typeof value === 'object' && 'classification' in (value as Node)) {
          out[key] = { ...(value as Node), classification: 'approved' }
        } else {
          out[key] = walk(value)
        }
      }
      return out
    }
    return node
  }
  return walk(configuration) as MachineConfiguration
}

/** Copy of the configuration with the classification of the value at `path` replaced. */
export function withClassification(
  configuration: MachineConfiguration,
  path: string,
  classification: ValueClassification,
): MachineConfiguration {
  const copy = structuredClone(configuration) as unknown as Node
  let node = copy
  for (const part of path.split('.')) node = node[part] as Node
  node.source = { ...(node.source as Node), classification }
  return copy as unknown as MachineConfiguration
}

/** Paths of the issues, for compact assertions. */
export const paths = (issues: readonly ConfigurationIssue[]): string[] => issues.map((issue) => issue.path)

/** Talvi configuration with every value approved and a mapping from `quality: standard` to `P1 Q1`. */
export function approvedTalvi(): MachineConfiguration {
  const approved = approveAll(structuredClone(talvi6000wConfiguration))
  return {
    ...approved,
    processMapping: {
      value: { key: 'quality', entries: [{ value: 'standard', p: 1, q: 1 }], omitQ: 'never' },
      source: { classification: 'approved', reference: 'fixture' },
    },
  }
}

/** Hypertherm configuration with every value approved. */
export function approvedHypertherm(): MachineConfiguration {
  return approveAll(structuredClone(hyperthermHpr400xdaConfiguration))
}

/** Process settings of mild steel 6 mm, 130 A, O2/Air, as looked up from the cut chart table. */
export const hyperthermSettings = {
  torchType: 34, materialType: 1, current: 130, shieldGas: 2, thickness: 29, cuttingSurface: 1,
  arcVoltage: 127, pierceTime: 0.3, pierceHeightFactor: 200, cutHeight: 2.8, transferHeightFactor: 200,
  kerf: 1.81, feed: 4035, leadInFeed: 4035, materialComment: 'MS 6mm 130A O2/Air', m50n: true, rt: true, chartSource: 'table',
} as const

/** GloryStar configuration with every value approved. */
export function approvedGloryStar(): MachineConfiguration {
  return approveAll(structuredClone(gloryStarGs3015Configuration))
}

/** Process settings of the GloryStar reference program. */
export const gloryStarSettings = { feed: 3000, piercingType: 1, thickness: 6 } as const
