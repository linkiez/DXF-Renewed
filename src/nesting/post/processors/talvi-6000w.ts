import type { CutPlan } from '../../cutPath'
import { contourIssues } from '../dialects/contourIssues'
import { splitContours } from '../dialects/contourBlocks'
import { emitTalviContour } from '../dialects/talvi/talviContour'
import { talviEnding } from '../dialects/talvi/talviEnding'
import { talviExtents } from '../dialects/talvi/talviExtents'
import { talviHeader } from '../dialects/talvi/talviHeader'
import { talviPreparation } from '../dialects/talvi/talviPreparation'
import { talviSelector } from '../dialects/talvi/talviSelector'
import { GcodeWriter } from '../gcode/writer'
import { mapToMachineFrame } from '../machine/mapToMachineFrame'
import { numericDialect } from '../machine/numericDialect'
import { validateDialect } from '../machine/validateDialect'
import { usableConfiguration } from '../machine/usableConfiguration'
import type { PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const PROCESSOR_ID = 'talvi-6000w'
const PARAMS = ['lastDistance', 'distanceDecimals', 'sizeDecimals', 'arcMinimumSweep'] as const

function validate(plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] {
  return validateDialect(PROCESSOR_ID, plan, context.profile, (configuration) => {
    const split = splitContours(plan)
    const selectors = split.contours.flatMap((contour) => talviSelector(contour, configuration.processMapping?.value).issues)
    return [...contourIssues(split), ...selectors]
  })
}

function emit(plan: CutPlan, context: PostProcessingContext): string {
  const { profile } = context
  const configuration = usableConfiguration(profile)
  if (!configuration) return ''
  const params = numericDialect(configuration, PARAMS)
  if (!params) return ''
  const mapPoint = (point: { x: number; y: number }) => mapToMachineFrame(point, profile.sheet, configuration.frame.value)
  const { contours } = splitContours(plan)
  const writer = new GcodeWriter({ precision: configuration.decimals.value, trailingZeros: configuration.trailingZeros.value })
  for (const line of talviHeader(contours.length, talviExtents(contours, mapPoint), params.sizeDecimals)) writer.line(line)
  for (const line of talviPreparation()) writer.line(line)
  contours.forEach((contour, index) => {
    emitTalviContour(contour, index, {
      writer,
      mapPoint,
      mapping: configuration.processMapping?.value,
      dialect: params,
      isLast: index === contours.length - 1,
    })
  })
  for (const line of talviEnding()) writer.line(line)
  return writer.toString()
}

/** Talvi 6000 W laser (LaserAhead controller) processor, revision `laserahead-1`. */
export const talvi6000w: PostProcessor = {
  id: PROCESSOR_ID,
  name: 'Talvi 6000 W (LaserAhead)',
  revision: 'laserahead-1',
  machineKind: 'laser',
  validate,
  emit,
}
