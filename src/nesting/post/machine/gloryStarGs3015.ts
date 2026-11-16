import type { MachineConfiguration } from './types'
import { valueSource as source } from './valueSource'

const POST = 'pos-processor: sigma-nest/SNDATA-23.2/Post/GloryStar_GS3015.pst'
const SCRIPT = 'pos-processor: sigma-nest/SNDATA-23.2/Post/GloryStar_GS3015.pas'

const dependency = (name: string, note: string) => ({ name, source: source('observed', POST, note) })

/** Built-in configuration of the GloryStar GS3015 laser. Nothing in it is `approved`. */
export const gloryStarGs3015Configuration: MachineConfiguration = {
  configurationId: 'glorystar-gs3015',
  revision: 'glorystar-gs3015-1',
  name: 'GloryStar GS3015',
  machineKind: 'laser',
  processorId: 'glorystar-gs3015',
  processorRevision: 'sigmanest-23.2-1',
  units: { value: 'mm', source: source('observed', POST, 'Metric table sizes (line 2660).') },
  envelope: {
    value: { minX: 0, maxX: 3000, minY: 0, maxY: 1500 },
    source: source('inferred', POST, 'Table 3000 x 1500 (line 351); the tool block says 18000 x 3000 (line 2660). The envelope is not confirmed.'),
  },
  frame: {
    value: { rotationDegrees: 90, origin: 'bottom-left' },
    source: source('inferred', POST, 'ROTATION = 2 (90 degrees) in the post; the zero corner is not confirmed.'),
  },
  table: {
    value: { width: 3000, height: 1500 },
    source: source('observed', POST, 'Table 3000 x 1500 (line 351) against 18000 x 3000 (line 2660): the two post values conflict.'),
  },
  rapidFeed: { value: 26000, source: source('observed', POST, 'RAPID FEED&ACC = 26000 mm/min (line 411).') },
  arcCenter: { value: 'absolute', source: source('observed', POST, 'Arcs are written with the absolute center, [G],[X],[Y],[I],[J].') },
  decimals: { value: 3, source: source('observed', SCRIPT, "Number mask '0.###'.") },
  trailingZeros: { value: false, source: source('observed', POST, 'TRAILZEROS = 0.') },
  output: {
    extension: { value: '.PGM', source: source('observed', POST, 'NCEXT = .PGM (line 201).') },
    lineEnding: { value: 'lf', source: source('inferred', POST) },
  },
  operations: {
    value: ['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'end'],
    source: source('observed', POST),
  },
  dialect: {
    headDownMaxDistance: { value: 100, source: source('observed', SCRIPT, 'MaxDistanceForHeadDown (mm).') },
    jumpMaxDistance: { value: 1000, source: source('observed', SCRIPT, 'MaxDistanceForJump (mm).') },
    heightOffCode: { value: 'M82', source: source('observed', SCRIPT, 'HeightOffCode.') },
    heightOnCode: { value: 'M83', source: source('observed', SCRIPT, 'HeightOnCode.') },
    smallContourClass: { value: 'small', source: source('observed', SCRIPT, 'Name of the action metadata value that marks the smallest contour class, whose height sensor stays off.') },
    regulatorOffQuality: { value: 3, source: source('observed', SCRIPT, 'LaserOn: quality 3 selects regulator mode 0 and no height sensor words.') },
    arcMinimumSweep: { value: 2, source: source('observed', SCRIPT, 'WriteArc: arcs of 2 degrees or less are written as lines.') },
    thickMaterialGroups: { value: ['GRPALMG', 'GRPINOX'], source: source('observed', SCRIPT, 'WriteLine and OffsetSelection: aluminium and stainless steel groups.') },
    thickMinThickness: { value: 6, source: source('observed', SCRIPT, 'WriteLine and OffsetSelection: thickness of 6 mm or more.') },
  },
  externalDependencies: [
    dependency('inizio.cfs', 'Controller subprogram called by name.'),
    dependency('Apa.cfs', 'Controller subprogram called by name.'),
    dependency('fine.cfs', 'Controller subprogram called by name.'),
    dependency('Soitaab_Oxy_ECS_mm.pas', 'Script called by the post template that is missing from the analysed copy.'),
  ],
  controllerPreconditions: [],
}
