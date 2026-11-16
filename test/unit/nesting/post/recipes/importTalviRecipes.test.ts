import { strict as assert } from 'node:assert'
import { importTalviRecipes } from '../../../../../src/nesting/post/recipes/importTalviRecipes'
import { recipeFiles, recipeXml } from '../../../../resources/post-references/talvi-recipes'

describe('importTalviRecipes', () => {
  it('turns every file into one recipe with its fields, keeping the input order', () => {
    const { recipes, issues } = importTalviRecipes(recipeFiles)
    assert.deepEqual(issues, [])
    assert.deepEqual(recipes.map((r) => r.id), recipeFiles.map((f) => f.name))
    const first = recipes[0]
    assert.equal(first.thicknessMm, 0.9)
    assert.equal(first.material, 'carbon-steel')
    assert.equal(first.nozzle, 's1.5')
    assert.equal(first.toolNumber, 1)
    assert.deepEqual(first.cut, {
      height: 0.5, speed: 300, power: 6000, frequency: 3000, duty: 100, gasType: 'N2', gasPressure: 10, focus: -1.5,
      preCutDelay: 0, coolDelay: 0, spotSize: 5.89,
    })
    assert.equal(first.speedUnitConfirmed, false)
    assert.equal(recipes[2].material, null)
    assert.equal(recipes[2].thicknessMm, 10)
  })

  it('lists only the open piercing stages and the lead parameters when they are enabled', () => {
    const { recipes } = importTalviRecipes(recipeFiles)
    assert.equal(recipes[0].pierceStages.length, 0)
    assert.deepEqual(recipes[1].pierceStages.map((s) => s.time), [10, 1000])
    assert.equal(recipes[1].pierceStages[0].type, 'FenDuan')
    assert.equal(recipes[1].pierceStages[0].power, 6000)
    assert.deepEqual(recipes[1].lead, { cuttingVelocity: 10, duty: 50, frequency: 5000, height: 5, stableDistance: 3, circleVelocity: 10, focus: 0, startLineLength: 3, inCircleRadius: 1 })
    assert.equal(recipes[0].lead, undefined)
  })

  it('reports an unreadable file once with its name and keeps the others', () => {
    const files = [...recipeFiles, { name: '3mm inox s2.5.HSTool', text: '<HTool><nTNumber>1</HTool>' }, { name: 'notes.txt', text: 'x' }]
    const { recipes, issues } = importTalviRecipes(files)
    assert.equal(recipes.length, 3)
    assert.deepEqual(issues.map((i) => [i.file, i.code]), [['3mm inox s2.5.HSTool', 'RECIPE_XML_INVALID'], ['notes.txt', 'RECIPE_NAME_UNRECOGNIZED']])
  })

  it('reports a missing required field', () => {
    const { recipes, issues } = importTalviRecipes([{ name: '2mm inox s2.0.HSTool', text: recipeXml({ omit: ['dSpeed'] }) }])
    assert.deepEqual(recipes, [])
    assert.equal(issues[0].code, 'RECIPE_FIELD_MISSING')
    assert.ok(issues[0].message.includes('dSpeed'))
  })

  it('does not mutate its input', () => {
    const copy = JSON.parse(JSON.stringify(recipeFiles))
    importTalviRecipes(recipeFiles)
    assert.deepEqual(recipeFiles, copy)
  })
})
