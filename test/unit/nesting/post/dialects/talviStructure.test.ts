import { strict as assert } from 'node:assert'
import { checkTalviStructure } from './talviStructure'

const HEAD = ['(TotalContour=2)', '(Size=10.000*20.000)', '(Tools=1)', 'G21', 'G90', 'G64 P0.03 Q0.001', '#5399=0.1',
  'o<process_start> call', 'M64 P3', 'o<runframework> call', 'o110 repeat[1]']
const TAIL = ['o<process_end> call', 'o110 endrepeat', 'o<endpos> call', 'M65 P3', 'M2']
const BODY = [
  'N0001', 'M101 P1 Q1', 'G00 X-10.0000 Y10.0000', '#<_openslag>=1', 'o<layer_start> call',
  'G01 X-5.0000 Y10.0000', 'G03 X-5.0000 Y10.0000 I-5.0000 J0.0000', '#<_NextOneDis>=5.000', 'o<layer_end> call',
  'N0002', 'M101 P1', 'G00 X0.0000 Y10.0000', '#<_openslag>=1', 'o<layer_start> call',
  'G01 X5.0000 Y10.0000', 'G02 X5.0000 Y10.0000 I-5.0000 J0.0000', '#<_NextOneDis>=-999', 'o<layer_end> call',
]
const build = (body = BODY, head = HEAD, tail = TAIL) => `${[...head, ...body, ...tail].join('\n')}\n`
const replace = (from: string, to: string) => build(BODY.map((l) => (l === from ? to : l)))

describe('Talvi structure checker', () => {
  it('accepts a conforming program with G02 and G03 full circles', () => {
    assert.deepEqual(checkTalviStructure(build()), [])
  })

  it('reports each broken rule', () => {
    const cases: Array<[string, string]> = [
      ['header', build(BODY, ['(TotalContour=3)', ...HEAD.slice(1)])],
      ['preparation', build(BODY, HEAD.map((l) => (l === 'G90' ? 'G91' : l)))],
      ['ending', build(BODY, HEAD, [...TAIL.slice(0, 4), 'M30'])],
      ['numbering', replace('N0002', 'N0005')],
      ['selector', replace('M101 P1 Q1', 'M101')],
      ['openslag', replace('#<_openslag>=1', '#<_openslag>=0')],
      ['distance', replace('#<_NextOneDis>=5.000', '#<_NextOneDis>=9.000')],
      ['sentinel', replace('#<_NextOneDis>=-999', '#<_NextOneDis>=5.000')],
      ['axis format', replace('G01 X-5.0000 Y10.0000', 'G01 X-5.00 Y10.0000')],
      ['arc radius', replace('G03 X-5.0000 Y10.0000 I-5.0000 J0.0000', 'G03 X-5.0000 Y12.0000 I-5.0000 J0.0000')],
      ['forbidden', replace('G01 X5.0000 Y10.0000', 'G01 X5.0000 Y10.0000 F1000')],
    ]
    for (const [name, text] of cases) assert.ok(checkTalviStructure(text).length > 0, name)
  })
})
