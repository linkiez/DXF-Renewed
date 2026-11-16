/** Normalized material of a Talvi recipe. */
export type TalviMaterial = 'carbon-steel' | 'aluminium' | 'stainless-steel'

/** Cutting parameters of a recipe, as in the tool file (the speed unit is not confirmed). */
export interface TalviCutParameters {
  readonly height: number
  readonly speed: number
  readonly power: number
  readonly frequency: number
  readonly duty: number
  readonly gasType: string
  readonly gasPressure: number
  readonly focus: number
  readonly preCutDelay?: number
  readonly coolDelay?: number
  readonly spotSize?: number
}

/** One enabled piercing stage. */
export interface PierceStage {
  readonly type: string
  readonly time: number
  readonly height: number
  readonly gas: string
  readonly pressure: number
  readonly power: number
  readonly duty: number
  readonly frequency: number
  readonly focusStart: number
  readonly focusEnd: number
}

/** Lead parameters, present when the recipe enables them. */
export interface TalviLeadParameters {
  readonly cuttingVelocity: number
  readonly duty: number
  readonly frequency: number
  readonly height: number
  readonly stableDistance: number
  readonly circleVelocity: number
  readonly focus: number
  readonly startLineLength: number
  readonly inCircleRadius: number
}

/** A cutting recipe of the Talvi operator interface. The program never carries these values. */
export interface TalviRecipe {
  /** The file name. */
  readonly id: string
  readonly thicknessMm: number
  /** `null` when the file name does not carry the material. */
  readonly material: TalviMaterial | null
  readonly nozzle: string
  readonly toolNumber: number
  readonly cut: TalviCutParameters
  readonly pierceStages: readonly PierceStage[]
  readonly lead?: TalviLeadParameters
  /** The unit of the speed is not confirmed in this revision. */
  readonly speedUnitConfirmed: false
}

/** A recipe file that could not be imported. */
export interface RecipeIssue {
  readonly file: string
  readonly code: 'RECIPE_XML_INVALID' | 'RECIPE_NAME_UNRECOGNIZED' | 'RECIPE_FIELD_MISSING'
  readonly message: string
}

/** A recipe file as the host reads it. */
export interface RecipeFile {
  readonly name: string
  readonly text: string
}

/** Result of `importTalviRecipes`. */
export interface RecipeImport {
  readonly recipes: readonly TalviRecipe[]
  readonly issues: readonly RecipeIssue[]
}

/** What to look up. */
export interface RecipeQuery {
  readonly material: TalviMaterial
  readonly thicknessMm: number
  readonly nozzle?: string
}
