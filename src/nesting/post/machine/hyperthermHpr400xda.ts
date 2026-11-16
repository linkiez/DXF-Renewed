import type { ControllerPrecondition, MachineConfiguration } from './types'
import { valueSource } from './valueSource'

const source = valueSource

const POST = 'pos-processor: sigma-nest/SNDATA-23.2/Post/Hypertherm_EDGEPro_HPR400XDa.pst'
const VENDOR = 'docs/Hypertherm EDGE PRO Programmer reference.md (EDGE Connect Programmer Reference 809550 revision 6)'
const HYPATH = 'The reference is for EDGE Connect; that it applies to the EDGE Pro HyPath running Phoenix 9.761 is for a person to confirm.'
const PRONEST = 'Resilio Sync/Maquina/Software/Pronest/PosPronest/Post ProNest/EDGE.cff (Hypertherm ProNest post, revision 1.64)'
const MANUAL = 'docs/nesting/IM_807620r5.pdf (EDGE Pro HyPath CNC Instruction Manual 807620 revision 5), X and Y axis configuration'

const precondition = (id: string, text: string): ControllerPrecondition => ({ id, text, source: source('vendor-confirmed', VENDOR, HYPATH) })

/** Built-in configuration of the Hypertherm EDGE Pro HPR400XDa plasma. Nothing in it is `approved`. */
export const hyperthermHpr400xdaConfiguration: MachineConfiguration = {
  configurationId: 'hypertherm-edge-pro-hpr400xda',
  revision: 'hypertherm-edge-pro-hpr400xda-1',
  name: 'Hypertherm EDGE Pro HPR400XDa',
  machineKind: 'plasma',
  processorId: 'hypertherm-edge-pro-hpr400xda',
  processorRevision: 'edge-connect-809550-6',
  units: { value: 'mm', source: source('observed', POST, 'UNITS [mm] = G21 and the metric cutting zone.') },
  envelope: {
    value: { minX: 0, maxX: 12192, minY: 0, maxY: 3657.6 },
    source: source('inferred', POST, 'Cutting zone 12192 x 3657.6 (line 351); the tool block table size is 6096 x 6096 (line 2060). The envelope is not confirmed.'),
  },
  frame: {
    value: { rotationDegrees: 0, origin: 'bottom-left' },
    source: source('inferred', MANUAL, 'The orientation of X and Y and the home position are defined in the CNC machine setups and must agree with the table; the SigmaNEST default zero is bottom left (line 311).'),
  },
  table: {
    value: { width: 12192, height: 3657.6 },
    source: source('observed', POST, 'Cutting zone 12192 x 3657.6 (line 351) against 6096 x 6096 in the tool block (line 2060): the two post values conflict.'),
  },
  rapidFeed: {
    value: 1200,
    source: source('observed', POST, 'Line 411 reads 1200,100 (mm/min, in/min): 1200 mm/min and 100 in/min are not the same speed, so the value is unreliable. Used for the feed limit only.'),
  },
  arcCenter: { value: 'incremental', source: source('vendor-confirmed', VENDOR, `G02 and G03 take the arc center as I and J. ${HYPATH}`) },
  decimals: { value: 3, source: source('observed', POST, 'DECIMALS = 3 (line 5).') },
  trailingZeros: { value: false, source: source('observed', POST, 'TRAILZEROS = 0 (line 4).') },
  output: {
    extension: { value: '.CNC', source: source('observed', POST, 'NCEXT = .CNC (line 201).') },
    lineEnding: { value: 'lf', source: source('inferred', POST) },
  },
  operations: {
    value: ['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'end'],
    source: source('observed', POST),
  },
  dialect: {
    station: { value: 1, source: source('vendor-confirmed', VENDOR, `M37 Tx selects the station. ${HYPATH}`) },
    plasmaProcess: { value: 1, source: source('vendor-confirmed', VENDOR, `M36 T1 selects plasma process 1. ${HYPATH}`) },
    markingProcess: { value: 3, source: source('vendor-confirmed', VENDOR, `M36 T3 selects marker process 1. ${HYPATH}`) },
    axisPreset: {
      value: 0,
      source: source(
        'inferred',
        PRONEST,
        'The ProNest post writes G92 X0 Y0 after G90 (program zero at the torch position of the init point); the SigmaNEST post does not. 1 writes the preset, 0 does not. Which one the shop uses is not known.',
      ),
    },
    highDefinitionKey: { value: 'highDefinition', source: source('inferred', POST, 'Name of the action metadata that marks a high-definition contour (the post uses HasHDX).') },
    chartOrder: {
      value: ['type', 'material', 'current', 'gas', 'thickness'],
      source: source(
        'vendor-confirmed',
        VENDOR,
        `V5xx codes must be written in the order of the cut chart and the cutting surface is not needed to select a chart. The ProNest post (${PRONEST}) writes V502, V503, V504, V505 and V507 and no V506; the SigmaNEST post writes the surface before the thickness. ${HYPATH}`,
      ),
    },
  },
  externalDependencies: [],
  controllerPreconditions: [
    precondition('eia-g59-override', 'EIA G59 code override must be enabled'),
    precondition('process-select-override', 'Process select override must be enabled'),
    precondition('station-select-override', 'Station select override must be enabled'),
    precondition('kerf-override', 'EIA kerf override must be enabled'),
    precondition('parallel-kerf-disabled-true-hole', 'Parallel kerf enable must be disabled for true hole programs'),
  ],
}
