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

  it('skips declarations and comments, and rejects unclosed ones, in linear time', () => {
    assert.deepEqual(readFlatXml('<?xml version="1.0"?><!-- note --><A><b>1</b></A>'), { b: '1' })
    for (const bad of ['<?xml', '<A><!-- open</A>']) {
      assert.throws(() => readFlatXml(bad), (error: Error) => error.name === 'RecipeXmlError', bad)
    }
    const start = Date.now()
    for (const hostile of ['<?'.repeat(50_000), '<!--'.repeat(50_000)]) {
      assert.throws(() => readFlatXml(hostile), (error: Error) => error.name === 'RecipeXmlError')
    }
    assert.ok(Date.now() - start < 1000)
  })

  it('throws RecipeXmlError for an unbalanced or empty document', () => {
    for (const bad of ['', '   ', '<A><b></A>', '<A>', 'plain text', '<A></B>']) {
      assert.throws(() => readFlatXml(bad), (error: Error) => error.name === 'RecipeXmlError', bad)
    }
  })
})
