import type { CutPlan } from '../../cutPath'
import { GcodeWriter } from '../gcode/writer'
import type { MachineProfile, PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const pointWords = (writer: GcodeWriter, point: { x: number; y: number }, units: string): void => {
  writer.word('X', units === 'inch' ? point.x / 25.4 : point.x)
  writer.word('Y', units === 'inch' ? point.y / 25.4 : point.y)
}

const setting = (profile: MachineProfile, name: string): number | undefined => {
  if (name === 'feed' && profile.feed !== undefined) return profile.feed
  if (name === 'power' && profile.power !== undefined) return profile.power
  if (name === 'pierceDwellMs' && profile.pierceDwellMs !== undefined) return profile.pierceDwellMs
  const value = profile.processSettings?.[name]
  return typeof value === 'number' ? value : undefined
}

/** Generic laser processor revision 1. */
export const genericLaser: PostProcessor = {
  id: 'generic-laser',
  name: 'Generic Laser',
  revision: '1',
  machineKind: 'laser',
  validate: (plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] => {
    const issues: ValidationIssue[] = []
    for (const [name, value] of [
      ['feed', setting(context.profile, 'feed')],
      ['power', setting(context.profile, 'power')],
      ['pierceDwellMs', setting(context.profile, 'pierceDwellMs')],
    ] as const) {
      if (value === undefined) {
        issues.push({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: `Laser process setting "${name}" is required.` })
      }
    }
    plan.actions.forEach((action, actionIndex) => {
      if (action.kind === 'cut' && action.points.length < 2) {
        issues.push({ severity: 'error', code: 'CUT_GEOMETRY_INVALID', message: 'Laser cut action requires at least two points.', actionIndex })
      }
      if (action.kind === 'cut' && context.profile.capabilities['cutting'] === false) {
        issues.push({ severity: 'error', code: 'CAPABILITY_UNSUPPORTED', message: 'Machine does not support cutting.', actionIndex })
      }
    })
    return issues
  },
  emit: (plan: CutPlan, context: PostProcessingContext): string => {
    const { profile } = context
    const writer = new GcodeWriter()
    writer.beginLine().comment('GENERIC LASER').endLine()
    writer.beginLine().word('G', profile.units === 'inch' ? '20' : '21').endLine()
    writer.beginLine().word('G', '90').endLine()
    const power = setting(profile, 'power')
    const feed = setting(profile, 'feed')
    for (const action of plan.actions) {
      const point = action.points[action.points.length - 1]
      if (!point && action.kind !== 'end') continue
      if (action.kind === 'rapid' && point) {
        writer.beginLine().word('G', '00')
        pointWords(writer, point, profile.units)
        writer.endLine()
      } else if (action.kind === 'pierce' && point) {
        writer.beginLine().word('M', '03')
        if (power !== undefined) writer.word('S', power)
        writer.endLine()
        writer.beginLine().word('G', '04')
        const dwell = setting(profile, 'pierceDwellMs')
        if (dwell !== undefined) writer.word('P', dwell / 1000)
        writer.endLine()
      } else if ((action.kind === 'cut' || action.kind === 'lead-in' || action.kind === 'lead-out' || action.kind === 'overcut') && point) {
        writer.beginLine().word('G', '01')
        pointWords(writer, point, profile.units)
        if (feed !== undefined) writer.word('F', feed)
        writer.endLine()
      } else if (action.kind === 'tab') {
        writer.beginLine().word('M', '05').endLine()
        if (point) {
          writer.beginLine().word('G', '00')
          pointWords(writer, point, profile.units)
          writer.endLine()
        }
        writer.beginLine().word('M', '03')
        if (power !== undefined) writer.word('S', power)
        writer.endLine()
      } else if (action.kind === 'end') {
        writer.beginLine().word('M', '05').endLine()
        writer.beginLine().word('M', '30').endLine()
      }
    }
    return writer.toString()
  },
}
