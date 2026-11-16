import type { CutPlan } from '../../cutPath'
import { splitContours } from '../dialects/contourBlocks'
import { contourIssues } from '../dialects/contourIssues'
import { emitHyperthermContour } from '../dialects/hypertherm/hyperthermContour'
import { hyperthermEnding } from '../dialects/hypertherm/hyperthermEnding'
import { hyperthermHeightControl } from '../dialects/hypertherm/hyperthermHeightControl'
import { hyperthermPreparation } from '../dialects/hypertherm/hyperthermPreparation'
import { hyperthermProcessSelect } from '../dialects/hypertherm/hyperthermProcessSelect'
import { hyperthermSelection } from '../dialects/hypertherm/hyperthermSelection'
import { GcodeWriter } from '../gcode/writer'
import { dialectValue } from '../machine/dialectValue'
import { mapToMachineFrame } from '../machine/mapToMachineFrame'
import { message } from '../machine/messages'
import { numericDialect } from '../machine/numericDialect'
import { validateDialect } from '../machine/validateDialect'
import { usableConfiguration } from '../machine/usableConfiguration'
import type { MachineConfiguration } from '../machine/types'
import type { MachineProfile, PostProcessingContext, PostProcessor, ValidationIssue } from '../types'

const PROCESSOR_ID = 'hypertherm-edge-pro-hpr400xda'
const NUMBERS = ['station', 'plasmaProcess', 'axisPreset'] as const
const REQUIRED_SETTING = 'kerf'

interface Params {
  station: number
  plasmaProcess: number
  axisPreset: number
  highDefinitionKey: string
  chartOrder: readonly string[]
}

function paramsOf(configuration: MachineConfiguration): Params | undefined {
  const numbers = numericDialect(configuration, NUMBERS)
  const key = dialectValue(configuration, 'highDefinitionKey')
  const order = dialectValue(configuration, 'chartOrder')
  if (!numbers || typeof key !== 'string' || !Array.isArray(order)) return undefined
  return { ...numbers, highDefinitionKey: key, chartOrder: order }
}

const settingsOf = (profile: MachineProfile) => profile.processSettings ?? {}

function settingIssues(profile: MachineProfile, params: Params | undefined): ValidationIssue[] {
  const settings = settingsOf(profile)
  const issues: ValidationIssue[] = []
  if (typeof settings[REQUIRED_SETTING] !== 'number') {
    issues.push({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: message('PROCESS_SETTING_REQUIRED', { key: REQUIRED_SETTING }) })
  }
  if (typeof settings.feed === 'number' && !(settings.feed > 0)) {
    issues.push({ severity: 'error', code: 'PROCESS_SETTING_REQUIRED', message: message('PROCESS_SETTING_REQUIRED', { key: 'feed' }) })
  }
  issues.push(...hyperthermSelection(settings, params?.chartOrder ?? []).issues)
  issues.push(...hyperthermHeightControl(settings, profile.units).issues)
  return issues
}

function validate(plan: CutPlan, context: PostProcessingContext): readonly ValidationIssue[] {
  const { profile } = context
  return validateDialect(PROCESSOR_ID, plan, profile, (configuration) => {
    const params = paramsOf(configuration)
    const split = splitContours(plan)
    const kerf = split.contours.flatMap((contour) => emitHyperthermContour(contour, {
      writer: new GcodeWriter(),
      mapPoint: (p) => p,
      settings: settingsOf(profile),
      dialect: { highDefinitionKey: params?.highDefinitionKey ?? '' },
    }))
    return [...contourIssues(split), ...kerf, ...settingIssues(profile, params)]
  })
}

function headerLines(profile: MachineProfile, configuration: MachineConfiguration, params: Params): string[] {
  const settings = settingsOf(profile)
  const comment = typeof settings.materialComment === 'string' ? settings.materialComment : undefined
  const preparation = hyperthermPreparation({
    units: profile.units,
    preconditions: configuration.controllerPreconditions.map((p) => p.text),
    trueHole: settings.trueHole === true,
    axisPreset: params.axisPreset === 1,
    ...(comment ? { materialComment: comment } : {}),
  })
  return [
    ...preparation,
    ...hyperthermSelection(settings, params.chartOrder).lines,
    ...hyperthermHeightControl(settings, profile.units).lines,
    ...hyperthermProcessSelect(params.station, params.plasmaProcess),
  ]
}

function emit(plan: CutPlan, context: PostProcessingContext): string {
  const { profile } = context
  const configuration = usableConfiguration(profile)
  const params = configuration && paramsOf(configuration)
  if (!configuration || !params) return ''
  const mapPoint = (point: { x: number; y: number }) => mapToMachineFrame(point, profile.sheet, configuration.frame.value)
  const writer = new GcodeWriter({ precision: configuration.decimals.value, trailingZeros: configuration.trailingZeros.value })
  for (const line of headerLines(profile, configuration, params)) writer.line(line)
  const dialect = { highDefinitionKey: params.highDefinitionKey }
  for (const contour of splitContours(plan).contours) emitHyperthermContour(contour, { writer, mapPoint, settings: settingsOf(profile), dialect })
  for (const line of hyperthermEnding()) writer.line(line)
  return writer.toString()
}

/** Hypertherm EDGE Pro HPR400XDa plasma processor, revision `edge-connect-809550-6`. */
export const hyperthermEdgeProHpr400xda: PostProcessor = {
  id: PROCESSOR_ID,
  name: 'Hypertherm EDGE Pro HPR400XDa',
  revision: 'edge-connect-809550-6',
  machineKind: 'plasma',
  validate,
  emit,
}
