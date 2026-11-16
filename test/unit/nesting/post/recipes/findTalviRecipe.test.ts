import { strict as assert } from 'node:assert'
import { findTalviRecipe } from '../../../../../src/nesting/post/recipes/findTalviRecipe'
import { importTalviRecipes } from '../../../../../src/nesting/post/recipes/importTalviRecipes'
import { recipeFiles } from '../../../../resources/post-references/talvi-recipes'

const { recipes } = importTalviRecipes(recipeFiles)

describe('findTalviRecipe', () => {
  it('returns the exact recipe by material and thickness, with the file values', () => {
    const found = findTalviRecipe(recipes, { material: 'carbon-steel', thicknessMm: 0.9 })
    assert.equal(found?.id, '0.9mm aco carbono s1.5.HSTool')
    assert.equal(found?.cut.speed, 300)
    assert.equal(findTalviRecipe(recipes, { material: 'stainless-steel', thicknessMm: 12 })?.cut.power, 5500)
    assert.equal(findTalviRecipe(recipes, { material: 'stainless-steel', thicknessMm: 12, nozzle: 's3.5' })?.toolNumber, 2)
  })

  it('returns nothing for an absent thickness, material or nozzle and never the nearest one', () => {
    assert.equal(findTalviRecipe(recipes, { material: 'carbon-steel', thicknessMm: 1 }), undefined)
    assert.equal(findTalviRecipe(recipes, { material: 'aluminium', thicknessMm: 0.9 }), undefined)
    assert.equal(findTalviRecipe(recipes, { material: 'stainless-steel', thicknessMm: 12, nozzle: 's1.5' }), undefined)
  })

  it('matches the thickness with EPSILON', () => {
    assert.ok(findTalviRecipe(recipes, { material: 'carbon-steel', thicknessMm: 0.9 + 1e-9 }))
  })
})
