import expectModule from 'expect'
import fs from 'fs'
import { getResourcePath } from './test-helpers.js'
const expect = expectModule.expect || expectModule.default

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  getResourcePath(import.meta.url, 'lines.dxf'),
  'utf-8',
)

describe('tables', () => {
  it('can parse the ltype', () => {
    const parsed = parseString(dxfContents)
    expect(parsed.tables.ltypes).toEqual({
      ByBlock: {
        type: 'LTYPE',
        pattern: [],
        name: 'ByBlock',
        flag: 0,
        description: '',
        alignment: 65,
        elementCount: 0,
        patternLength: 0,
      },
      ByLayer: {
        type: 'LTYPE',
        pattern: [],
        name: 'ByLayer',
        flag: 0,
        description: '',
        alignment: 65,
        elementCount: 0,
        patternLength: 0,
      },
      Continuous: {
        type: 'LTYPE',
        pattern: [],
        name: 'Continuous',
        flag: 0,
        description: 'Solid line',
        alignment: 65,
        elementCount: 0,
        patternLength: 0,
      },
      DOT: {
        type: 'LTYPE',
        pattern: [
          {
            length: 0,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'DOT',
        flag: 0,
        description: 'Dot . . . . . . . . . . . . . . . . . . . . . .',
        alignment: 65,
        elementCount: 2,
        patternLength: 6.35,
      },
      DOTTINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 0,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'DOTTINY',
        flag: 0,
        description: 'Dot (.15x) .....................................',
        alignment: 65,
        elementCount: 2,
        patternLength: 0.9525,
      },
      DOT2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 0,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'DOT2',
        flag: 0,
        description: 'Dot (.5x) .....................................',
        alignment: 65,
        elementCount: 2,
        patternLength: 3.175,
      },
      DOTX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 0,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'DOTX2',
        flag: 0,
        description: 'Dot (2x) .  .  .  .  .  .  .  .  .  .  .  .  .',
        alignment: 65,
        elementCount: 2,
        patternLength: 12.7,
      },
      DASHED: {
        type: 'LTYPE',
        pattern: [
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'DASHED',
        flag: 0,
        description: 'Dashed _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _',
        alignment: 65,
        elementCount: 2,
        patternLength: 19.05,
      },
      DASHEDTINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 1.905,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'DASHEDTINY',
        flag: 0,
        description: 'Dashed (.15x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _',
        alignment: 65,
        elementCount: 2,
        patternLength: 2.8575,
      },
      DASHED2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'DASHED2',
        flag: 0,
        description: 'Dashed (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _',
        alignment: 65,
        elementCount: 2,
        patternLength: 9.524999999999999,
      },
      DASHEDX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 25.4,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'DASHEDX2',
        flag: 0,
        description: 'Dashed (2x) ____  ____  ____  ____  ____  ___',
        alignment: 65,
        elementCount: 2,
        patternLength: 38.09999999999999,
      },
      DASHDOT: {
        type: 'LTYPE',
        pattern: [
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'DASHDOT',
        flag: 0,
        description: 'Dash dot __ . __ . __ . __ . __ . __ . __ . __',
        alignment: 65,
        elementCount: 4,
        patternLength: 25.4,
      },
      DASHDOTTINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 1.905,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'DASHDOTTINY',
        flag: 0,
        description: 'Dash dot (.15x) _._._._._._._._._._._._._._._.',
        alignment: 65,
        elementCount: 4,
        patternLength: 3.81,
      },
      DASHDOT2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'DASHDOT2',
        flag: 0,
        description: 'Dash dot (.5x) _._._._._._._._._._._._._._._.',
        alignment: 65,
        elementCount: 4,
        patternLength: 12.7,
      },
      DASHDOTX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 25.4,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'DASHDOTX2',
        flag: 0,
        description: 'Dash dot (2x) ____  .  ____  .  ____  .  ___',
        alignment: 65,
        elementCount: 4,
        patternLength: 50.8,
      },
      DIVIDE: {
        type: 'LTYPE',
        pattern: [
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'DIVIDE',
        flag: 0,
        description: 'Divide ____ . . ____ . . ____ . . ____ . . ____',
        alignment: 65,
        elementCount: 6,
        patternLength: 31.75,
      },
      DIVIDETINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 1.905,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'DIVIDETINY',
        flag: 0,
        description: 'Divide (.15x) __..__..__..__..__..__..__..__.._',
        alignment: 65,
        elementCount: 6,
        patternLength: 4.7625,
      },
      DIVIDE2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'DIVIDE2',
        flag: 0,
        description: 'Divide (.5x) __..__..__..__..__..__..__..__.._',
        alignment: 65,
        elementCount: 6,
        patternLength: 15.875,
      },
      DIVIDEX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 25.4,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'DIVIDEX2',
        flag: 0,
        description: 'Divide (2x) ________  .  .  ________  .  .  _',
        alignment: 65,
        elementCount: 6,
        patternLength: 63.5,
      },
      BORDER: {
        type: 'LTYPE',
        pattern: [
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'BORDER',
        flag: 0,
        description: 'Border __ __ . __ __ . __ __ . __ __ . __ __ .',
        alignment: 65,
        elementCount: 6,
        patternLength: 44.45,
      },
      BORDERTINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 1.905,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 1.905,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'BORDERTINY',
        flag: 0,
        description: 'Border (.15x) __.__.__.__.__.__.__.__.__.__.__.',
        alignment: 65,
        elementCount: 6,
        patternLength: 6.6675,
      },
      BORDER2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'BORDER2',
        flag: 0,
        description: 'Border (.5x) __.__.__.__.__.__.__.__.__.__.__.',
        alignment: 65,
        elementCount: 6,
        patternLength: 22.225,
      },
      BORDERX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 25.4,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 25.4,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 0,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'BORDERX2',
        flag: 0,
        description: 'Border (2x) ____  ____  .  ____  ____  .  ___',
        alignment: 65,
        elementCount: 6,
        patternLength: 88.89999999999999,
      },
      CENTER: {
        type: 'LTYPE',
        pattern: [
          {
            length: 31.75,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
          {
            length: 6.35,
            shape: 0,
          },
          {
            length: -6.35,
            shape: 0,
          },
        ],
        name: 'CENTER',
        flag: 0,
        description: 'Center ____ _ ____ _ ____ _ ____ _ ____ _ ____',
        alignment: 65,
        elementCount: 4,
        patternLength: 50.8,
      },
      CENTERTINY: {
        type: 'LTYPE',
        pattern: [
          {
            length: 4.7625,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
          {
            length: 0.9525,
            shape: 0,
          },
          {
            length: -0.9525,
            shape: 0,
          },
        ],
        name: 'CENTERTINY',
        flag: 0,
        description: 'Center (.15x) ___ _ ___ _ ___ _ ___ _ ___ _ ___',
        alignment: 65,
        elementCount: 4,
        patternLength: 7.619999999999999,
      },
      CENTER2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 19.05,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
          {
            length: 3.175,
            shape: 0,
          },
          {
            length: -3.175,
            shape: 0,
          },
        ],
        name: 'CENTER2',
        flag: 0,
        description: 'Center (.5x) ___ _ ___ _ ___ _ ___ _ ___ _ ___',
        alignment: 65,
        elementCount: 4,
        patternLength: 28.575,
      },
      CENTERX2: {
        type: 'LTYPE',
        pattern: [
          {
            length: 63.5,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
          {
            length: 12.7,
            shape: 0,
          },
          {
            length: -12.7,
            shape: 0,
          },
        ],
        name: 'CENTERX2',
        flag: 0,
        description: 'Center (2x) ________  __  ________  __  _____',
        alignment: 65,
        elementCount: 4,
        patternLength: 101.6,
      },
    })
  })

  it('can parse additional table types (APPID, BLOCK_RECORD, UCS, VIEW)', () => {
    const dxf = `0
SECTION
2
TABLES
0
TABLE
2
APPID
70
1
0
APPID
2
ACAD
70
0
0
ENDTAB
0
TABLE
2
BLOCK_RECORD
70
1
0
BLOCK_RECORD
2
*Model_Space
70
0
0
ENDTAB
0
TABLE
2
UCS
70
1
0
UCS
2
UCS-1
70
0
0
ENDTAB
0
TABLE
2
VIEW
70
1
0
VIEW
2
VIEW-1
70
0
0
ENDTAB
0
ENDSEC
0
EOF
`

    const parsed = parseString(dxf)
    expect(Object.keys(parsed.tables.appids)).toEqual(['ACAD'])
    expect(parsed.tables.appids.ACAD).toEqual({
      type: 'APPID',
      name: 'ACAD',
      flags: 0,
    })

    expect(Object.keys(parsed.tables.blockRecords)).toEqual(['*Model_Space'])
    expect(parsed.tables.blockRecords['*Model_Space']).toEqual({
      type: 'BLOCK_RECORD',
      name: '*Model_Space',
      flags: 0,
    })

    expect(Object.keys(parsed.tables.ucs)).toEqual(['UCS-1'])
    expect(parsed.tables.ucs['UCS-1']).toEqual({
      type: 'UCS',
      name: 'UCS-1',
      flags: 0,
    })

    expect(Object.keys(parsed.tables.views)).toEqual(['VIEW-1'])
    expect(parsed.tables.views['VIEW-1']).toEqual({
      type: 'VIEW',
      name: 'VIEW-1',
      flags: 0,
    })
  })
})
