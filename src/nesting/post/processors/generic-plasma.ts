import type { CutPlan } from '../../cutPath'
import { GcodeWriter } from '../gcode/writer'
import type { MachineProfile, PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const pointWords = (writer: GcodeWriter, point: { x: number; y: number }, units: string): void => {
  writer.word('X', units === 'inch' ? point.x / 25.4 : point.x)
  writer.word('Y', units === 'inch' ? point.y / 25.4 : point.y)
}

const setting = (profile: MachineProfile, name: string): number | undefined => {
  if (name === 'feed' && profile.feed !== undefined) return profile.feed
  if (name === 'amperage' && profile.amperage !== undefined) return profile.amperage
  if (name === 'pierceDwellMs' && profile.pierceDwellMs !== undefined) return profile.pierceDwellMs
  const value = profile.processSettings?.[name]
  return typeof value === 'number' ? value : undefined
}

/** Generic plasma processor revision 1, including approved amperage output. */
export const genericPlasma: PostProcessor = {
  id: 'generic-plasma',
  name: 'Generic Plasma',
  revision: '1',
  machineKind: 'plasma',
  validate: (plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] => {
    const issues: ValidationIssue[] = []
    for (const [name, value] of [
      ['feed', setting(context.profile, 'feed')],
      ['amperage', setting(context.profile, 'amperage')],
      ['pierceDwellMs', setting(context.profile, 'pierceDwellMs')],
    ] as const) {
      if (value === undefined) {
        issues.push({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: `Plasma process setting "${name}" is required.` })
      }
    }
    if (context.profile.capabilities.thc === true && context.profile.capabilities['torch-height-control'] === false) {
      issues.push({ severity: 'error', code: 'CAPABILITY_UNSUPPORTED', message: 'THC is requested but unsupported.' })
    }
    plan.actions.forEach((action, actionIndex) => {
      if (action.kind === 'cut' && action.metadata?.thc === true && context.profile.capabilities.thc !== true) {
        issues.push({ severity: 'error', code: 'CAPABILITY_UNSUPPORTED', message: 'Cut action requests unsupported THC.', actionIndex })
      }
    })
    return issues
  },
  emit: (plan: CutPlan, context: PostProcessingContext): string => {
    const { profile } = context
    const writer = new GcodeWriter()
    const amperage = setting(profile, 'amperage')
    writer.beginLine().comment('GENERIC PLASMA').endLine()
    writer.beginLine().word('G', profile.units === 'inch' ? '20' : '21').endLine()
    writer.beginLine().word('G', '90').endLine()
    const feed = setting(profile, 'feed')
    const dwell = setting(profile, 'pierceDwellMs')
    for (const action of plan.actions) {
      const point = action.points[action.points.length - 1]
      if (action.kind === 'rapid' && point) {
        writer.beginLine().word('G', '00')
        pointWords(writer, point, profile.units)
        writer.endLine()
      } else if (action.kind === 'pierce') {
        writer.beginLine().word('M', '03')
        if (amperage !== undefined) writer.word('S', amperage)
        writer.endLine()
        writer.beginLine().word('G', '04')
        if (dwell !== undefined) writer.word('P', dwell / 1000)
        writer.endLine()
      } else if ((action.kind === 'cut' || action.kind === 'lead-in' || action.kind === 'lead-out' || action.kind === 'overcut') && point) {
        writer.beginLine().word('G', '01')
        pointWords(writer, point, profile.units)
        if (feed !== undefined) writer.word('F', feed)
        writer.endLine()
      } else if (action.kind === 'tab') {
        writer.beginLine().word('M', '05').endLine()
      } else if (action.kind === 'end') {
        writer.beginLine().word('M', '05').endLine()
        writer.beginLine().word('M', '30').endLine()
      }
    }
    return writer.toString()
  },
}
