import { expect } from 'expect'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findTalviRecipe, importTalviRecipes } from '../../../src/nesting'

const DIRECTORY = process.env.TALVI_RECIPES_DIR
const available = DIRECTORY !== undefined && existsSync(DIRECTORY)

describe('Talvi recipe files (local, outside the repository)', function () {
  before(function () {
    if (!available) {
      console.log('talviRecipesLocal skipped: set TALVI_RECIPES_DIR to the folder with the .HSTool files.')
      this.skip()
    }
  })

  const files = () =>
    readdirSync(DIRECTORY as string)
      .filter((name) => /\.hstool$/i.test(name) || /hstool$/i.test(name))
      .map((name) => ({ name, text: readFileSync(join(DIRECTORY as string, name), 'utf8') }))

  it('imports every recipe file with every field present and no issue', () => {
    const { recipes, issues } = importTalviRecipes(files())
    expect(issues).toEqual([])
    expect(recipes.length).toBe(files().length)
    expect(recipes.length).toBeGreaterThan(0)
    for (const recipe of recipes) {
      expect(recipe.cut.speed).toBeGreaterThan(0)
      expect(recipe.cut.power).toBeGreaterThan(0)
      expect(recipe.speedUnitConfirmed).toBe(false)
    }
  })

  it('returns the file values for lookups by material and thickness', () => {
    const { recipes } = importTalviRecipes(files())
    const mild = findTalviRecipe(recipes, { material: 'carbon-steel', thicknessMm: 3 })
    expect(mild?.id).toBe('3mm aco carbono s3.0.HSTool')
    expect(findTalviRecipe(recipes, { material: 'stainless-steel', thicknessMm: 12 })?.id).toBe('12mm inox s3.5.HSTool')
    expect(findTalviRecipe(recipes, { material: 'carbon-steel', thicknessMm: 7 })).toBeUndefined()
  })
})
