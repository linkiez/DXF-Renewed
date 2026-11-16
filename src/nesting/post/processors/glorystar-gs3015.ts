import type { CutPlan } from '../../cutPath'
import { splitContours } from '../dialects/contourBlocks'
import { contourIssues } from '../dialects/contourIssues'
import { emitGlorystarContour } from '../dialects/glorystar/glorystarContour'
import type { GlorystarContourDialect } from '../dialects/glorystar/glorystarContour'
import { glorystarEnding } from '../dialects/glorystar/glorystarEnding'
import { glorystarFlameOff } from '../dialects/glorystar/glorystarFlameOff'
import { glorystarHeader } from '../dialects/glorystar/glorystarHeader'
import { contourQuality } from '../dialects/glorystar/glorystarQuality'
import { formatNumber } from '../gcode/formatNumber'
import { GcodeWriter } from '../gcode/writer'
import { dialectValue } from '../machine/dialectValue'
import { mapToMachineFrame } from '../machine/mapToMachineFrame'
import { message } from '../machine/messages'
import { numericDialect } from '../machine/numericDialect'
import type { MachineConfiguration } from '../machine/types'
import { usableConfiguration } from '../machine/usableConfiguration'
import { validateDialect } from '../machine/validateDialect'
import type { MachineProfile, PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const PROCESSOR_ID = 'glorystar-gs3015'
const NUMBERS = ['headDownMaxDistance', 'jumpMaxDistance', 'arcMinimumSweep', 'thickMinThickness', 'regulatorOffQuality'] as const
const STRINGS = ['heightOffCode', 'heightOnCode', 'smallContourClass'] as const
const SETTINGS = ['feed', 'piercingType', 'thickness'] as const

interface Params extends GlorystarContourDialect {
  readonly headDownMaxDistance: number
  readonly jumpMaxDistance: number
}

function paramsOf(configuration: MachineConfiguration): Params | undefined {
  const numbers = numericDialect(configuration, NUMBERS)
  const strings = STRINGS.map((key) => dialectValue(configuration, key))
  const groups = dialectValue(configuration, 'thickMaterialGroups')
  if (!numbers || strings.some((s) => typeof s !== 'string') || !Array.isArray(groups)) return undefined
  return { ...numbers, heightOffCode: strings[0] as string, heightOnCode: strings[1] as string, smallContourClass: strings[2] as string, thickMaterialGroups: groups }
}

function settingsOf(profile: MachineProfile): { feed: number; piercingType: number; thickness: number } | undefined {
  const values = SETTINGS.map((key) => profile.processSettings?.[key])
  if (values.some((v) => typeof v !== 'number')) return undefined
  return { feed: values[0] as number, piercingType: values[1] as number, thickness: values[2] as number }
}

function validate(plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] {
  const { profile } = context
  return validateDialect(PROCESSOR_ID, plan, profile, () => {
    const split = splitContours(plan)
    const required: ValidationIssue[] = SETTINGS
      .filter((key) => typeof profile.processSettings?.[key] !== 'number')
      .map((key) => ({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: message('PROCESS_SETTING_REQUIRED', { key }) }))
    const qualities: ValidationIssue[] = split.contours
      .filter((contour) => contourQuality(contour) === undefined)
      .map((contour) => ({
        severity: 'error',
        code: 'PROCESS_SETTING_REQUIRED',
        message: message('PROCESS_SETTING_REQUIRED', { key: 'quality' }),
        ...(contour.contourId ? { contourId: contour.contourId } : {}),
      }))
    return [...contourIssues(split), ...required, ...qualities]
  })
}

function machineSheet(profile: MachineProfile, configuration: MachineConfiguration): { length: number; width: number } {
  const swapped = configuration.frame.value.rotationDegrees === 90 || configuration.frame.value.rotationDegrees === 270
  return swapped ? { length: profile.sheet.height, width: profile.sheet.width } : { length: profile.sheet.width, width: profile.sheet.height }
}

function emit(plan: CutPlan, context: PostProcessingContext): string {
  const { profile } = context
  const configuration = usableConfiguration(profile)
  const params = configuration && paramsOf(configuration)
  const settings = settingsOf(profile)
  if (!configuration || !params || !settings) return ''
  const decimals = configuration.decimals.value
  const format = (value: number) => formatNumber(value, decimals, configuration.trailingZeros.value)
  const mapPoint = (point: { x: number; y: number }) => mapToMachineFrame(point, profile.sheet, configuration.frame.value)
  const writer = new GcodeWriter()
  for (const line of glorystarHeader(machineSheet(profile, configuration), settings.thickness)) writer.line(line)
  let headUp = true
  splitContours(plan).contours.forEach((contour, index) => {
    emitGlorystarContour(contour, index, { writer, mapPoint, format, settings, dialect: params, headUp })
    const off = glorystarFlameOff(contour.nextRapidLength, params)
    for (const line of off.lines) writer.line(line)
    headUp = off.headUp
  })
  for (const line of glorystarEnding()) writer.line(line)
  return writer.toString()
}

/** GloryStar GS3015 laser processor, revision `sigmanest-23.2-1`. */
export const gloryStarGs3015: PostProcessor = {
  id: PROCESSOR_ID,
  name: 'GloryStar GS3015',
  revision: 'sigmanest-23.2-1',
  machineKind: 'laser',
  validate,
  emit,
}
