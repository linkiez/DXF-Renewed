import { strict as assert } from 'node:assert'
import { parseTalviRecipeName } from '../../../../../src/nesting/post/recipes/parseTalviRecipeName'

describe('parseTalviRecipeName', () => {
  it('reads the thickness, material and nozzle of the first pattern', () => {
    assert.deepEqual(parseTalviRecipeName('0.9mm aco carbono s1.5.HSTool'), { thicknessMm: 0.9, material: 'carbon-steel', nozzle: 's1.5' })
    assert.deepEqual(parseTalviRecipeName('12mm inox s3.5.HSTool'), { thicknessMm: 12, material: 'stainless-steel', nozzle: 's3.5' })
    assert.deepEqual(parseTalviRecipeName('1.2mm aluminio(com pelicula) s1.5.HSTool'), { thicknessMm: 1.2, material: 'aluminium', nozzle: 's1.5' })
    assert.deepEqual(parseTalviRecipeName('4.75mm aco carbono d 1.5mm.HSTool'), { thicknessMm: 4.75, material: 'carbon-steel', nozzle: 'd1.5' })
    assert.deepEqual(parseTalviRecipeName('6.3mm aco carbono d 2 HSTool'), { thicknessMm: 6.3, material: 'carbon-steel', nozzle: 'd2' })
    assert.deepEqual(parseTalviRecipeName('8mm aluminio s3.5 ar.HSTool'), { thicknessMm: 8, material: 'aluminium', nozzle: 's3.5' })
  })

  it('reads the second pattern without a material', () => {
    assert.deepEqual(parseTalviRecipeName('1.2双10mm.htoolsall.HSTool'), { thicknessMm: 10, material: null, nozzle: 'd1.2' })
    assert.deepEqual(parseTalviRecipeName('3.0双14mm。htoolsall.HSTool'), { thicknessMm: 14, material: null, nozzle: 'd3' })
  })

  it('never guesses a name that fits neither pattern', () => {
    for (const name of ['CORTE_TAVI.lnk', 'readme.txt', 'mm aco carbono s1.5.HSTool', '5mm vidro s1.5.HSTool', '0888.nsp']) {
      assert.equal(parseTalviRecipeName(name), undefined, name)
    }
  })
})
