import type { DXFTuple, DimStyleInternal, LTypeElement, LTypeInternal, LayerInternal, StyleInternal, VPortInternal } from '../types'

import logger from '../util/logger'

const ltypeHandler = (tuples: DXFTuple[]): LTypeInternal => {
  let element: LTypeElement | undefined
  let offset: { x: string | number; y: string | number } | undefined
  return tuples.reduce(
    (layer, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      // https://documentation.help/AutoCAD-DXF/WS1a9193826455f5ff18cb41610ec0a2e719-7a4f.htm
      switch (type) {
        case 2:
          layer.name = value
          break
        case 3:
          layer.description = value
          break
        case 70:
          // Standard flag values (bit-coded values):
          //  16 = If set, table entry is externally dependent on an xref
          //  32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully resolved
          //  64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)
          layer.flag = value
          break
        case 72:
          // Alignment code (value is always 65, the ASCII code for A):
          layer.alignment = value
          break
        case 73:
          layer.elementCount = Number.parseInt(String(value))
          break
        case 40:
          layer.patternLength = value
          break
        case 49:
          element = { length: value }
          layer.pattern.push(element)
          break
        case 74:
          // Complex linetype element type (one per element). Default is 0 (no embedded shape/text) (bit-coded values)
          //  1 = If set, code 50 specifies an absolute rotation; if not set, code 50 specifies a relative rotation
          //  2 = Embedded element is a text string
          //  4 = Embedded element is a shape
          if (element) {
            element.shape = value
          }
          break
        case 75:
          if (element) {
            element.shapeNumber = value
          }
          break
        case 340:
          if (element) {
            element.styleHandle = value
          }
          break
        case 46:
          if (element) {
            element.scales ??= []
            element.scales.push(value)
          }
          break
        case 50:
          if (element) {
            element.rotation = value
          }
          break
        case 44:
          offset = { x: value, y: 0 }
          if (element) {
            element.offset ??= []
            element.offset.push(offset)
          }
          break
        case 45:
          if (offset) {
            offset.y = value
          }
          break
        case 9:
          if (element) {
            element.text = value
          }
          break
        default:
      }
      return layer
    },
    { type: 'LTYPE', pattern: [] } as LTypeInternal,
  )
}

const layerHandler = (tuples: DXFTuple[]): LayerInternal => {
  return tuples.reduce(
    (layer, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/layer_dxf_04.htm
      switch (type) {
        case 2:
          layer.name = value
          break
        case 6:
          layer.lineTypeName = value
          break
        case 62:
          layer.colorNumber = value
          break
        case 70:
          layer.flags = value
          break
        case 290:
          layer.plot = Number.parseInt(String(value)) !== 0
          break
        case 370:
          layer.lineWeightEnum = value
          break
        default:
      }
      return layer
    },
    { type: 'LAYER' } as LayerInternal,
  )
}

const styleHandler = (tuples: DXFTuple[]): StyleInternal => {
  return tuples.reduce(
    (style, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          style.name = value
          break
        case 6:
          style.lineTypeName = value
          break
        case 40:
          style.fixedTextHeight = value
          break
        case 41:
          style.widthFactor = value
          break
        case 50:
          style.obliqueAngle = value
          break
        case 71:
          style.flags = value
          break
        case 42:
          style.lastHeightUsed = value
          break
        case 3:
          style.primaryFontFileName = value
          break
        case 4:
          style.bigFontFileName = value
          break
        default:
      }
      return style
    },
    { type: 'STYLE' } as StyleInternal,
  )
}

const vPortHandler = (tuples: DXFTuple[]): VPortInternal => {
  return tuples.reduce(
    (vport, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          vport.name = value
          break
        case 5:
          vport.handle = value
          break
        case 70:
          vport.flags = value
          break
        case 10:
          vport.lowerLeft.x = Number.parseFloat(String(value))
          break
        case 20:
          vport.lowerLeft.y = Number.parseFloat(String(value))
          break
        case 11:
          vport.upperRight.x = Number.parseFloat(String(value))
          break
        case 21:
          vport.upperRight.y = Number.parseFloat(String(value))
          break
        case 12:
          vport.center.x = Number.parseFloat(String(value))
          break
        case 22:
          vport.center.y = Number.parseFloat(String(value))
          break
        case 14:
          vport.snapSpacing.x = Number.parseFloat(String(value))
          break
        case 24:
          vport.snapSpacing.y = Number.parseFloat(String(value))
          break
        case 15:
          vport.gridSpacing.x = Number.parseFloat(String(value))
          break
        case 25:
          vport.gridSpacing.y = Number.parseFloat(String(value))
          break
        case 16:
          vport.direction.x = Number.parseFloat(String(value))
          break
        case 26:
          vport.direction.y = Number.parseFloat(String(value))
          break
        case 36:
          vport.direction.z = Number.parseFloat(String(value))
          break
        case 17:
          vport.target.x = Number.parseFloat(String(value))
          break
        case 27:
          vport.target.y = Number.parseFloat(String(value))
          break
        case 37:
          vport.target.z = Number.parseFloat(String(value))
          break
        case 45:
          vport.height = Number.parseFloat(String(value))
          break
        case 50:
          vport.snapAngle = Number.parseFloat(String(value))
          break
        case 51:
          vport.angle = Number.parseFloat(String(value))
          break
        case 110:
          vport.x = Number.parseFloat(String(value))
          break
        case 120:
          vport.y = Number.parseFloat(String(value))
          break
        case 130:
          vport.z = Number.parseFloat(String(value))
          break
        case 111:
          vport.xAxisX = Number.parseFloat(String(value))
          break
        case 121:
          vport.xAxisY = Number.parseFloat(String(value))
          break
        case 131:
          vport.xAxisZ = Number.parseFloat(String(value))
          break
        case 112:
          vport.xAxisX = Number.parseFloat(String(value))
          break
        case 122:
          vport.xAxisY = Number.parseFloat(String(value))
          break
        case 132:
          vport.xAxisZ = Number.parseFloat(String(value))
          break
        case 146:
          vport.elevation = Number.parseFloat(String(value))
          break
        default:
      }
      return vport
    },
    {
      type: 'VPORT',
      center: {},
      lowerLeft: {},
      upperRight: {},
      snap: {},
      snapSpacing: {},
      gridSpacing: {},
      direction: {},
      target: {},
    } as VPortInternal,
  )
}

const dimStyleHandler = (tuples: DXFTuple[]): DimStyleInternal => {
  return tuples.reduce(
    (dimStyle, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          dimStyle.name = value
          break
        case 70:
          dimStyle.flags = value
          break
        case 3:
          dimStyle.dimPost = value
          break
        case 4:
          dimStyle.dimAPost = value
          break
        case 40:
          dimStyle.dimScale = Number.parseFloat(String(value))
          break
        case 41:
          dimStyle.dimAsz = Number.parseFloat(String(value))
          break
        case 42:
          dimStyle.dimExo = Number.parseFloat(String(value))
          break
        case 43:
          dimStyle.dimDli = Number.parseFloat(String(value))
          break
        case 44:
          dimStyle.dimExe = Number.parseFloat(String(value))
          break
        case 45:
          dimStyle.dimRnd = Number.parseFloat(String(value))
          break
        case 46:
          dimStyle.dimDle = Number.parseFloat(String(value))
          break
        case 47:
          dimStyle.dimTp = Number.parseFloat(String(value))
          break
        case 48:
          dimStyle.dimTm = Number.parseFloat(String(value))
          break
        case 140:
          dimStyle.dimTxt = Number.parseFloat(String(value))
          break
        case 141:
          dimStyle.dimCen = Number.parseFloat(String(value))
          break
        case 142:
          dimStyle.dimTsz = Number.parseFloat(String(value))
          break
        case 143:
          dimStyle.dimAltf = Number.parseFloat(String(value))
          break
        case 144:
          dimStyle.dimLfac = Number.parseFloat(String(value))
          break
        case 145:
          dimStyle.dimTvp = Number.parseFloat(String(value))
          break
        case 146:
          dimStyle.dimTfac = Number.parseFloat(String(value))
          break
        case 147:
          dimStyle.dimGap = Number.parseFloat(String(value))
          break
        case 148:
          dimStyle.dimAltRnd = Number.parseFloat(String(value))
          break
        case 71:
          dimStyle.dimTol = Number.parseInt(String(value))
          break
        case 72:
          dimStyle.dimLim = Number.parseInt(String(value))
          break
        case 73:
          dimStyle.dimTih = Number.parseInt(String(value))
          break
        case 74:
          dimStyle.dimToh = Number.parseInt(String(value))
          break
        case 75:
          dimStyle.dimSe1 = Number.parseInt(String(value))
          break
        case 76:
          dimStyle.dimSe2 = Number.parseInt(String(value))
          break
        case 77:
          dimStyle.dimTad = Number.parseInt(String(value))
          break
        case 78:
          dimStyle.dimZin = Number.parseInt(String(value))
          break
        case 79:
          dimStyle.dimAzin = Number.parseInt(String(value))
          break
        case 170:
          dimStyle.dimAlt = Number.parseInt(String(value))
          break
        case 171:
          dimStyle.dimAltd = Number.parseInt(String(value))
          break
        case 172:
          dimStyle.dimTofl = Number.parseInt(String(value))
          break
        case 173:
          dimStyle.dimSah = Number.parseInt(String(value))
          break
        case 174:
          dimStyle.dimTix = Number.parseInt(String(value))
          break
        case 175:
          dimStyle.dimSoxd = Number.parseInt(String(value))
          break
        case 176:
          dimStyle.dimClrd = Number.parseInt(String(value))
          break
        case 177:
          dimStyle.dimClre = Number.parseInt(String(value))
          break
        case 178:
          dimStyle.dimClrt = Number.parseInt(String(value))
          break
        case 179:
          dimStyle.dimAdec = Number.parseInt(String(value))
          break
        case 270:
          dimStyle.dimUnit = Number.parseInt(String(value))
          break
        case 271:
          dimStyle.dimDec = Number.parseInt(String(value))
          break
        case 272:
          dimStyle.dimTdec = Number.parseInt(String(value))
          break
        case 273:
          dimStyle.dimAltu = Number.parseInt(String(value))
          break
        case 274:
          dimStyle.dimAlttd = Number.parseInt(String(value))
          break
        case 275:
          dimStyle.dimAunit = Number.parseInt(String(value))
          break
        case 276:
          dimStyle.dimFrac = Number.parseInt(String(value))
          break
        case 277:
          dimStyle.dimLunit = Number.parseInt(String(value))
          break
        case 278:
          dimStyle.dimDsep = Number.parseInt(String(value))
          break
        case 279:
          dimStyle.dimTmove = Number.parseInt(String(value))
          break
        case 280:
          dimStyle.dimJust = Number.parseInt(String(value))
          break
        case 281:
          dimStyle.dimSd1 = Number.parseInt(String(value))
          break
        case 282:
          dimStyle.dimSd2 = Number.parseInt(String(value))
          break
        case 283:
          dimStyle.dimTolj = Number.parseInt(String(value))
          break
        case 284:
          dimStyle.dimTzin = Number.parseInt(String(value))
          break
        case 285:
          dimStyle.dimAltz = Number.parseInt(String(value))
          break
        case 286:
          dimStyle.dimAlttz = Number.parseInt(String(value))
          break
        case 287:
          dimStyle.dimFit = Number.parseInt(String(value))
          break
        case 288:
          dimStyle.dimUpt = Number.parseInt(String(value))
          break
        case 289:
          dimStyle.dimAtfit = Number.parseInt(String(value))
          break
        case 340:
          dimStyle.dimTxsty = value
          break
        case 341:
          dimStyle.dimLdrblk = value
          break
        case 342:
          dimStyle.dimBlk = value
          break
        case 343:
          dimStyle.dimBlk1 = value
          break
        case 344:
          dimStyle.dimBlk2 = value
          break
        case 371:
          dimStyle.dimLwd = Number.parseInt(String(value))
          break
        case 372:
          dimStyle.dimLwe = Number.parseInt(String(value))
          break
        default:
      }
      return dimStyle
    },
    { type: 'DIMSTYLE' } as DimStyleInternal,
  )
}

const tableHandler = (
  tuples: DXFTuple[],
  tableType: string,
  handler: (tuples: DXFTuple[]) => LTypeInternal | LayerInternal | StyleInternal | VPortInternal | DimStyleInternal,
): Record<string, any> => {
  const tableRowsTuples: DXFTuple[][] = []

  let tableRowTuples: DXFTuple[] | undefined
  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]
    if ((type === 0 || type === 2) && value === tableType) {
      tableRowTuples = []
      tableRowsTuples.push(tableRowTuples)
    } else if (tableRowTuples) {
      tableRowTuples.push(tuple)
    }
  }

  return tableRowsTuples.reduce((acc, rowTuples) => {
    const tableRow = handler(rowTuples)
    if (tableRow.name) {
      acc[String(tableRow.name)] = tableRow
    } else {
      logger.warn('table row without name:', tableRow)
    }
    return acc
  }, {} as Record<string, any>)
}

export default function parseTables(tuples: DXFTuple[]) {
  const tableGroups: DXFTuple[][] = []
  let tableTuples: DXFTuple[] | undefined
  for (const tuple of tuples) {
    const value = tuple[1]
    if (value === 'TABLE') {
      tableTuples = []
      tableGroups.push(tableTuples)
    } else if (value === 'ENDTAB') {
      if (tableTuples) {
        tableGroups.push(tableTuples)
      }
    } else if (tableTuples) {
      tableTuples.push(tuple)
    }
  }

  let stylesTuples: DXFTuple[] = []
  let layersTuples: DXFTuple[] = []
  let vPortTuples: DXFTuple[] = []
  let ltypeTuples: DXFTuple[] = []
  let dimStyleTuples: DXFTuple[] = []
  for (const group of tableGroups) {
    if (group[0]?.[1] === 'STYLE') {
      stylesTuples = group
    } else if (group[0]?.[1] === 'LTYPE') {
      ltypeTuples = group
    } else if (group[0]?.[1] === 'LAYER') {
      layersTuples = group
    } else if (group[0]?.[1] === 'VPORT') {
      vPortTuples = group
    } else if (group[0]?.[1] === 'DIMSTYLE') {
      dimStyleTuples = group
    }
  }

  return {
    layers: tableHandler(layersTuples, 'LAYER', layerHandler),
    styles: tableHandler(stylesTuples, 'STYLE', styleHandler),
    vports: tableHandler(vPortTuples, 'VPORT', vPortHandler),
    ltypes: tableHandler(ltypeTuples, 'LTYPE', ltypeHandler),
    dimStyles: tableHandler(dimStyleTuples, 'DIMSTYLE', dimStyleHandler),
  }
}
