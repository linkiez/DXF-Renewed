import type { MachineConfiguration } from './types'
import { valueSource } from './valueSource'

const source = valueSource

const PROGRAMS = 'pos-processor: Nest para parametros/teste2/1967v4.nc (real controller program)'
const DESIGN = 'pos-processor: sigma-nest/README.md and specs/001-talvi-laser-config/data-model.md'
const POST = 'pos-processor: sigma-nest/SNDATA-23.2/Post/Talvi_6000W.pas and .pst'

/** Built-in configuration of the Talvi 6000 W laser (LaserAhead controller). Nothing in it is `approved`. */
export const talvi6000wConfiguration: MachineConfiguration = {
  configurationId: 'talvi-6000w',
  revision: 'talvi-6000w-1',
  name: 'Talvi 6000 W',
  machineKind: 'laser',
  processorId: 'talvi-6000w',
  processorRevision: 'laserahead-1',
  units: { value: 'mm', source: source('user-confirmed', DESIGN) },
  envelope: {
    value: { minX: -1500, maxX: 0, minY: 0, maxY: 3000 },
    source: source(
      'user-confirmed',
      DESIGN,
      'Table 1500 x 3000 mm, zero at the bottom right. The controller soft limits X -1525..0 and Y 0..3070 were observed and are not the work envelope.',
    ),
  },
  frame: {
    value: { rotationDegrees: 0, origin: 'bottom-right' },
    source: source(
      'inferred',
      POST,
      'The zero at the bottom right is user-confirmed; the rotation of the sheet and the Y shift of the SigmaNEST post are inferred.',
    ),
  },
  table: { value: { width: 1500, height: 3000 }, source: source('user-confirmed', DESIGN) },
  rapidFeed: { value: 26000, source: source('observed', POST, 'Rapid feedrate of the SigmaNEST post, used for time estimates only (mm/min).') },
  arcCenter: { value: 'incremental', source: source('observed', PROGRAMS) },
  decimals: { value: 4, source: source('observed', PROGRAMS) },
  trailingZeros: { value: true, source: source('observed', PROGRAMS) },
  output: {
    extension: { value: '.nc', source: source('observed', PROGRAMS) },
    lineEnding: { value: 'lf', source: source('observed', PROGRAMS) },
  },
  operations: {
    value: ['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'end'],
    source: source('observed', PROGRAMS),
  },
  dialect: {
    lastDistance: {
      value: -999,
      source: source('inferred', PROGRAMS, 'Observed at the last contour; its meaning is inferred.'),
    },
    distanceDecimals: { value: 3, source: source('observed', PROGRAMS) },
    sizeDecimals: { value: 3, source: source('observed', PROGRAMS) },
    arcMinimumSweep: { value: 2, source: source('observed', POST, 'Arcs of 2 degrees or less are written as lines.') },
  },
  externalDependencies: ['process_start', 'layer_start', 'layer_end', 'runframework', 'endpos', 'process_end'].map((name) => ({
    name,
    source: source('observed', PROGRAMS, 'Controller subprogram called by name; not defined in the program.'),
  })),
  controllerPreconditions: [],
}
