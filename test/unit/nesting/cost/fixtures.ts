import type { CostModel, CostRequest } from '../../../../src/nesting/cost/types'
import type { Fixture } from '../review/fixtures'
import {
  layoutOnlyFixture,
  partialFixture,
  referenceFixture,
  rejectedFixture,
  smallFixture,
} from '../review/fixtures'

export { deepFreeze } from '../review/fixtures'

/** A complete model: two minor-unit digits, millimetres, prices for sheet-1/sheet-2 and the reference sheet. */
export const completeModel = (): CostModel => ({
  contractVersion: 1,
  currency: { code: 'BRL', minorUnitDigits: 2 },
  geometryUnitsPerMeter: 1000,
  material: {
    fullSheet: { 'sheet-1': { value: 100 }, 'sheet-2': { value: 120 } },
    remnant: {},
  },
  speeds: { cutting: { value: 2 }, rapid: { value: 10 }, pierceDwellSeconds: { value: 0.5 } },
  rates: {
    cuttingPerHour: { value: 60 },
    travelPerHour: { value: 30 },
    piercePerUnit: { value: 0.1 },
    labourPerHour: { value: 40 },
  },
  handling: { secondsPerSheet: { value: 60 }, secondsPerJob: { value: 120 } },
  consumables: [
    { id: 'nozzle', cost: { value: 50 }, life: { value: { unit: 'pierces', amount: 1000 } } },
    { id: 'lens', cost: { value: 200 }, life: { value: { unit: 'cuttingSeconds', amount: 36000 } } },
  ],
})

const walk = (target: Record<string, unknown>, path: string): { holder: Record<string, unknown>; key: string } => {
  const keys = path.split('.')
  const key = keys[keys.length - 1]
  const holder = keys.slice(0, -1).reduce<Record<string, unknown>>((node, name) => node[name] as Record<string, unknown>, target)
  return { holder, key }
}

/** Copy of the model without the value at the dotted path (for example `rates.cuttingPerHour`). */
export const withoutField = (model: CostModel, path: string): CostModel => {
  const copy = structuredClone(model)
  const { holder, key } = walk(copy as unknown as Record<string, unknown>, path)
  delete holder[key]
  return copy
}

/** Copy of the model with the value at the dotted path replaced. */
export const withField = (model: CostModel, path: string, value: unknown): CostModel => {
  const copy = structuredClone(model)
  const { holder, key } = walk(copy as unknown as Record<string, unknown>, path)
  holder[key] = value
  return copy
}

/** Copy of the model with the value at the dotted path marked as an unverified estimate. */
export const withEstimated = (model: CostModel, path: string): CostModel => {
  const copy = structuredClone(model)
  const { holder, key } = walk(copy as unknown as Record<string, unknown>, path)
  holder[key] = { ...(holder[key] as Record<string, unknown>), estimated: true }
  return copy
}

export const requestFor = (fixture: Fixture, costModel: CostModel = completeModel()): CostRequest => ({
  artifact: fixture.artifact,
  layout: fixture.layout,
  cutPlan: fixture.cutPlan,
  costModel,
})

/** The reference job needs a price for its single sheet. */
export const referenceModel = (): CostModel => {
  const model = completeModel()
  model.material.fullSheet = { 'sheet-1': { value: 450 } }
  return model
}

/** The small artifact with sheet-2 turned into a remnant priced separately. */
export const remnantFixture = async (): Promise<{ request: CostRequest }> => {
  const base = await smallFixture()
  const layout = base.artifact.layout
  if (!layout) throw new Error('fixture without layout')
  const sheets = layout.sheets.map((sheet) => (sheet.id === 'sheet-2' ? { ...sheet, kind: 'remnant' as const } : sheet))
  const artifact = { ...base.artifact, layout: { ...layout, sheets } }
  const model = completeModel()
  model.material.remnant = { 'sheet-2': { value: 30 } }
  model.material.fullSheet = { 'sheet-1': { value: 100 } }
  return { request: { artifact, layout: base.layout, cutPlan: base.cutPlan, costModel: model } }
}

export const smallRequest = async (model?: CostModel): Promise<CostRequest> => requestFor(await smallFixture(), model)
export const partialRequest = async (model?: CostModel): Promise<CostRequest> => requestFor(await partialFixture(), model)
export const layoutOnlyRequest = async (model?: CostModel): Promise<CostRequest> => {
  const fixture = await layoutOnlyFixture()
  return { artifact: fixture.artifact, costModel: model ?? completeModel() }
}
export const rejectedRequest = async (model?: CostModel): Promise<CostRequest> => {
  const input = await rejectedFixture()
  return { artifact: input.artifact, costModel: model ?? completeModel() }
}
export const referenceRequest = async (model: CostModel = referenceModel()): Promise<CostRequest> =>
  requestFor(await referenceFixture(), model)
