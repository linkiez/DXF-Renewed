import { EPSILON } from '../../config'
import type { RecipeQuery, TalviRecipe } from './types'

/**
 * Look up a recipe by material and thickness, and optionally by nozzle.
 *
 * Exact match only: a thickness, material or nozzle that is absent returns `undefined`, never the nearest one.
 *
 * @param recipes - Imported recipes.
 * @param query - Material, thickness and optional nozzle.
 * @returns The first matching recipe, or `undefined`.
 */
export function findTalviRecipe(recipes: readonly TalviRecipe[], query: RecipeQuery): TalviRecipe | undefined {
  return recipes.find((recipe) =>
    recipe.material === query.material &&
    Math.abs(recipe.thicknessMm - query.thicknessMm) <= EPSILON &&
    (query.nozzle === undefined || recipe.nozzle === query.nozzle))
}
