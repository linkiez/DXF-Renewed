import { strict as assert } from 'node:assert'
import { readFlatXml } from '../../../../../src/nesting/post/recipes/readFlatXml'

describe('readFlatXml', () => {
  it('turns nested tags into nested maps and trims scalar text', () => {
    const tree = readFlatXml('<?xml version="1.0"?>\n<A>\n <b> 1 </b>\n <c><d>x</d><e /></c>\n</A>')
    assert.deepEqual(tree, { b: '1', c: { d: 'x', e: '' } })
  })

  it('turns repeated sibling tags into a list in order', () => {
    const tree = readFlatXml('<A><L><i><n>1</n></i><i><n>2</n></i></L></A>') as { L: { i: Array<{ n: string }> } }
    assert.deepEqual(tree.L.i.map((x) => x.n), ['1', '2'])
  })

  it('decodes the basic entities', () => {
    assert.deepEqual(readFlatXml('<A><t>a &amp; b &lt;c&gt;</t></A>'), { t: 'a & b <c>' })
  })

  it('throws RecipeXmlError for an unbalanced or empty document', () => {
    for (const bad of ['', '   ', '<A><b></A>', '<A>', 'plain text', '<A></B>']) {
      assert.throws(() => readFlatXml(bad), (error: Error) => error.name === 'RecipeXmlError', bad)
    }
  })
})
