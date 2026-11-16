/** A cell of the cut chart workbook as the host reads it. */
export type CutChartCell = string | number | boolean | null | undefined

/** One row, keyed by the English column names of the workbook (`Material`, `Thickness`, `Cut Chart Type`, ...). */
export type CutChartRow = Readonly<Record<string, CutChartCell>>

/** Input of `importCutChartTable`: the rows the host read from the workbook. */
export interface CutChartInput {
  /** First cell of the `Cut` sheet: `mm` or `in`. */
  readonly unitMarker: string
  /** Software revision the table names, such as `Phoenix 9.761`. */
  readonly software?: string
  /** Power supply the table names, such as `HPR260XDa`. */
  readonly powerSupply?: string
  readonly rows: readonly CutChartRow[]
  /** Rows of the `Separations` sheet (`Material`, `Thickness`, `Part Sep`, `Plate Sep`, `Pierce Sep`). */
  readonly separations?: readonly CutChartRow[]
}

/** Table unit. */
export type CutChartUnit = 'mm' | 'in'

/** Process options of a row. */
export interface CutChartToggles {
  readonly trueHole: boolean
  readonly fineFeature: boolean
  readonly hdi: boolean
  readonly thickPierce: boolean
  readonly underwater: boolean
  readonly bevel: boolean
  readonly edgePierceOnly: boolean
}

/** Codes of the cut chart selection (`V502`..`V507`). */
export interface CutChartCodes {
  readonly type: number
  /** May carry the specific-material decimal (`1.99` true hole, `1.97` fine feature). */
  readonly material: number
  readonly current: number
  readonly gas: number
  readonly thickness: number
  readonly surface?: number
}

/** Height control values of a row (`V600`..`V606`) and their edge variants. */
export interface CutChartHeight {
  readonly arcVoltage?: number
  readonly pierceTime?: number
  readonly pierceHeightFactor?: number
  readonly cutHeight?: number
  readonly transferHeightFactor?: number
  readonly cutHeightDelay?: number
  readonly kerfRedetect?: number
  readonly edgePierceTime?: number
  readonly edgePierceHeightFactor?: number
  readonly edgeTransferHeightFactor?: number
}

/** One row of the table: a combination of material, thickness and consumable class. */
export interface CutChartEntry {
  readonly rowNumber: number
  readonly material: string
  readonly thickness: number
  readonly class: string
  readonly profile: { readonly type: string; readonly diameter: string; readonly area: string }
  readonly feed: { readonly base: number; readonly percent: number; readonly value: number; readonly leadIn: number }
  readonly kerf: { readonly base: number; readonly adjustment: number; readonly value: number }
  readonly chart: CutChartCodes
  readonly height: CutChartHeight
  readonly toggles: CutChartToggles
  readonly outputs: { readonly v500: boolean; readonly v600: boolean; readonly m50n: boolean; readonly rt: boolean; readonly hs: boolean }
}

/** Part, plate and pierce separation of a thickness. */
export interface SeparationRule {
  readonly material: string
  readonly thickness: number
  readonly part: number
  readonly plate: number
  readonly pierce: number
}

/** An imported cut chart table. */
export interface CutChartTable {
  readonly unit: CutChartUnit
  readonly software?: string
  readonly powerSupply?: string
  readonly entries: readonly CutChartEntry[]
  readonly separations: readonly SeparationRule[]
}

/** A row or table problem found while importing. */
export interface CutChartIssue {
  readonly code: 'CUTCHART_ROW_INVALID' | 'CUTCHART_CODE_UNKNOWN' | 'CUTCHART_UNIT_MISSING'
  readonly message: string
  readonly rowNumber?: number
}

/** Result of `importCutChartTable`; the table is absent when the unit is missing. */
export interface CutChartImport {
  readonly table?: CutChartTable
  readonly issues: readonly CutChartIssue[]
}

/** What to look up. */
export interface CutChartQuery {
  readonly material: string
  readonly thickness: number
  readonly class: string
  readonly toggles?: Partial<CutChartToggles>
}

/** A lookup that returned no entry. */
export interface CutChartAbsence {
  readonly code: 'CUTCHART_ABSENT' | 'CUTCHART_UNIT_MISMATCH'
  readonly message: string
}

/** A found entry with the separation rule of its thickness, when the table has one. */
export interface CutChartFound {
  readonly entry: CutChartEntry
  readonly separation?: SeparationRule
}
