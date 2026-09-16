import type { CutPlan } from '../../cutPath'
import { GcodeWriter } from '../gcode/writer'
import type { PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const pointWords = (writer: GcodeWriter, point: { x: number; y: number }): void => {
  writer.word('X', point.x).word('Y', point.y)
}

/** Hypertherm EDGE Connect 809550 revision 6, limited to documented EIA G00/G01/M15/M16. */
export const edgeConnect809550Rev6: PostProcessor = {
  id: 'edge-connect',
  name: 'Hypertherm EDGE Connect',
  revision: '809550-rev6',
  machineKind: 'plasma',
  validate: (plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] => {
    const issues: ValidationIssue[] = []
    if (context.profile.units !== 'mm') {
      issues.push({ severity: 'error', code: 'UNSUPPORTED_UNITS', message: 'EDGE Connect processor supports metric output in this revision.' })
    }
    plan.actions.forEach((action, actionIndex) => {
      if (action.kind === 'common-line') {
        issues.push({ severity: 'error', code: 'UNSUPPORTED_COMMAND', message: `Action ${action.kind} is outside the approved EIA subset.`, actionIndex })
      }
    })
    return issues
  },
  emit: (plan: CutPlan, context: PostProcessingContext): string => {
    const writer = new GcodeWriter()
    let line = 10
    const numbered = context.profile.lineNumbers !== false
    const next = (): number | undefined => {
      const value = numbered ? line : undefined
      line += 10
      return value
    }
    writer.beginLine(next()).comment('EDGE Connect 809550 REV 6').endLine()
    writer.beginLine(next()).word('G', '21').endLine()
    for (const action of plan.actions) {
      const point = action.points[action.points.length - 1]
        if (action.metadata?.comment) {
          writer.beginLine(next()).word('M', '00').endLine()
          writer.beginLine(next()).comment(String(action.metadata.comment)).endLine()
        }
        if (action.kind === 'rapid' && point) {
        writer.beginLine(next()).word('G', '00')
        pointWords(writer, point)
        writer.endLine()
      } else if (action.kind === 'pierce') {
        writer.beginLine(next()).word('M', '15').endLine()
      } else if ((action.kind === 'cut' || action.kind === 'lead-in' || action.kind === 'lead-out' || action.kind === 'overcut') && point) {
        writer.beginLine(next()).word('G', '01')
        pointWords(writer, point)
        writer.endLine()
      } else if (action.kind === 'end') {
        writer.beginLine(next()).word('M', '16').endLine()
      }
    }
    return writer.toString()
  },
}
