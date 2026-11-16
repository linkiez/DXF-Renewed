const COMMON = ['units', 'envelope', 'frame', 'rapidFeed', 'arcCenter', 'decimals', 'output.extension', 'operations'] as const

const BY_PROCESSOR: Readonly<Record<string, readonly string[]>> = {
  'talvi-6000w': [
    'processMapping', 'dialect.lastDistance', 'dialect.distanceDecimals', 'dialect.sizeDecimals', 'dialect.arcMinimumSweep',
  ],
  'glorystar-gs3015': [
    'dialect.headDownMaxDistance', 'dialect.jumpMaxDistance', 'dialect.heightOffCode', 'dialect.heightOnCode',
    'dialect.smallContourClass', 'dialect.regulatorOffQuality', 'dialect.arcMinimumSweep',
    'dialect.thickMaterialGroups', 'dialect.thickMinThickness',
  ],
  'hypertherm-edge-pro-hpr400xda': [
    'dialect.station', 'dialect.plasmaProcess', 'dialect.axisPreset', 'dialect.highDefinitionKey', 'dialect.chartOrder',
  ],
}

/**
 * Paths of the configuration values that gate the release of a processor's programs.
 *
 * @param processorId - Processor identifier.
 * @returns Dotted paths; empty for a processor without a configuration.
 */
export function criticalPaths(processorId: string): readonly string[] {
  const specific = BY_PROCESSOR[processorId]
  return specific ? [...COMMON, ...specific] : []
}
