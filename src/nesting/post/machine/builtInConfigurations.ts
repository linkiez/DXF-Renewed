import { gloryStarGs3015Configuration } from './gloryStarGs3015'
import { hyperthermHpr400xdaConfiguration } from './hyperthermHpr400xda'
import { talvi6000wConfiguration } from './talvi6000w'
import type { MachineConfiguration } from './types'

/** Built-in machine configurations by identifier. Internal: read through `getMachineConfiguration`. */
export const BUILT_IN_CONFIGURATIONS: ReadonlyMap<string, MachineConfiguration> = new Map(
  [gloryStarGs3015Configuration, hyperthermHpr400xdaConfiguration, talvi6000wConfiguration].map((configuration) => [configuration.configurationId, configuration]),
)
