import type {
  DictionaryObject,
  DimAssocObject,
  DXFTuple,
  FieldObject,
  ImageDefObject,
  ImageDefReactorObject,
  LayoutInternal,
  ParsedObjects,
  UnderlayDefinitionObject,
  XRecordObject,
} from '../types'

type ObjectGroup = DXFTuple[]

function groupObjectsByZero(tuples: DXFTuple[]): ObjectGroup[] {
  const groups: ObjectGroup[] = []
  let current: ObjectGroup | undefined

  for (const tuple of tuples) {
    const code = tuple[0]
    if (code === 0) {
      if (current && current.length > 0) groups.push(current)
      current = [tuple]
      continue
    }
    if (!current) continue
    current.push(tuple)
  }

  if (current && current.length > 0) groups.push(current)
  return groups
}

const LAYOUT_FLOAT_FIELDS: Record<number, keyof LayoutInternal> = {
  10: 'minLimitX',
  20: 'minLimitY',
  11: 'maxLimitX',
  21: 'maxLimitY',
  12: 'x',
  22: 'y',
  32: 'z',
  14: 'minX',
  24: 'minY',
  34: 'minZ',
  15: 'maxX',
  25: 'maxY',
  35: 'maxZ',
  146: 'elevation',
  13: 'ucsX',
  23: 'ucsY',
  33: 'ucsZ',
  16: 'ucsXaxisX',
  26: 'ucsXaxisY',
  36: 'ucsXaxisZ',
  17: 'ucsYaxisX',
  27: 'ucsYaxisY',
  37: 'ucsYaxisZ',
}

const LAYOUT_DIRECT_FIELDS: Record<number, keyof LayoutInternal> = {
  1: 'name',
  5: 'handle',
  71: 'tabOrder',
  330: 'tableRecord',
  331: 'lastActiveViewport',
  333: 'shadePlot',
}

const LAYOUT_UCS_TYPE: Record<number, LayoutInternal['ucsType']> = {
  0: 'NOT ORTHOGRAPHIC',
  1: 'TOP',
  2: 'BOTTOM',
  3: 'FRONT',
  4: 'BACK',
  5: 'LEFT',
  6: 'RIGHT',
}

type LayoutParseState = {
  state: 'IDLE' | 'layout' | 'AcDbLayout'
  layout?: LayoutInternal
}

function consumeLayoutStartTuple(current: LayoutParseState, tuple: DXFTuple): LayoutParseState {
  if (tuple[1] === 'LAYOUT') return { state: 'layout', layout: {} }
  return { state: 'IDLE', layout: current.layout }
}

function consumeLayoutSubclassTuple(current: LayoutParseState, tuple: DXFTuple): LayoutParseState {
  if (tuple[0] === 100 && tuple[1] === 'AcDbLayout') return { state: 'AcDbLayout', layout: current.layout }
  return current
}

function applyLayoutFieldTuple(layout: LayoutInternal, tuple: DXFTuple): void {
  const type = tuple[0]
  const value = tuple[1]

  const floatKey = LAYOUT_FLOAT_FIELDS[type]
  if (floatKey) {
    ;(layout as any)[floatKey] = Number.parseFloat(String(value))
    return
  }

  const directKey = LAYOUT_DIRECT_FIELDS[type]
  if (directKey) {
    ;(layout as any)[directKey] = value
    return
  }

  if (type === 70) {
    layout.flag = value === 1 ? 'PSLTSCALE' : 'LIMCHECK'
    return
  }

  if (type === 76) {
    const ucsType = LAYOUT_UCS_TYPE[Number(value)]
    if (ucsType) layout.ucsType = ucsType
  }
}

function consumeLayoutTuple(current: LayoutParseState, tuple: DXFTuple): LayoutParseState {
  if (tuple[0] === 0) return consumeLayoutStartTuple(current, tuple)

  if (current.state === 'layout') return consumeLayoutSubclassTuple(current, tuple)

  if (current.state === 'AcDbLayout' && current.layout) applyLayoutFieldTuple(current.layout, tuple)
  return current
}

function parseLayoutObject(group: ObjectGroup): LayoutInternal | undefined {
  let current: LayoutParseState = { state: 'IDLE' }
  for (const tuple of group) current = consumeLayoutTuple(current, tuple)
  return current.layout
}

function parseDictionaryObject(group: ObjectGroup): DictionaryObject | undefined {
  if (group[0]?.[1] !== 'DICTIONARY') return undefined

  const dict: DictionaryObject = {
    type: 'DICTIONARY',
    entries: {},
  }

  let pendingKey: string | undefined
  for (const tuple of group.slice(1)) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) {
      dict.handle = value
      continue
    }
    if (type === 330) {
      dict.ownerHandle = value
      continue
    }
    if (type === 3) {
      pendingKey = String(value)
      continue
    }
    if ((type === 350 || type === 360) && pendingKey) {
      dict.entries[pendingKey] = String(value)
      pendingKey = undefined
    }
  }

  return dict
}

function parseXRecordObject(group: ObjectGroup): XRecordObject | undefined {
  if (group[0]?.[1] !== 'XRECORD') return undefined

  const tuples = group.slice(1)

  const xRecord: XRecordObject = {
    type: 'XRECORD',
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) xRecord.handle = value
    if (type === 330) xRecord.ownerHandle = value
  }

  return xRecord
}

function parseImageDefObject(group: ObjectGroup): ImageDefObject | undefined {
  if (group[0]?.[1] !== 'IMAGEDEF') return undefined

  const tuples = group.slice(1)

  const imageDef: ImageDefObject = {
    type: 'IMAGEDEF',
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) imageDef.handle = value
    if (type === 330 && imageDef.ownerHandle === undefined) imageDef.ownerHandle = value
    if (type === 1) imageDef.fileName = String(value)
    if (type === 10) imageDef.pixelSizeX = Number(value)
    if (type === 20) imageDef.pixelSizeY = Number(value)
  }

  return imageDef
}

function parseImageDefReactorObject(group: ObjectGroup): ImageDefReactorObject | undefined {
  if (group[0]?.[1] !== 'IMAGEDEF_REACTOR') return undefined

  const tuples = group.slice(1)

  const reactor: ImageDefReactorObject = {
    type: 'IMAGEDEF_REACTOR',
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) reactor.handle = value
    if (type === 330) reactor.imageHandle = value
  }

  return reactor
}

function parseDimAssocObject(group: ObjectGroup): DimAssocObject | undefined {
  if (group[0]?.[1] !== 'DIMASSOC') return undefined

  const tuples = group.slice(1)

  const dimAssoc: DimAssocObject = {
    type: 'DIMASSOC',
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) dimAssoc.handle = value
    if (type === 330) dimAssoc.ownerHandle = value
  }

  return dimAssoc
}

function parseFieldObject(group: ObjectGroup): FieldObject | undefined {
  if (group[0]?.[1] !== 'FIELD') return undefined

  const tuples = group.slice(1)

  const field: FieldObject = {
    type: 'FIELD',
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) field.handle = value
    if (type === 330) field.ownerHandle = value
  }

  return field
}

const UNDERLAY_DEFINITION_OBJECT_TYPES = new Set([
  'UNDERLAYDEFINITION',
  'PDFDEFINITION',
  'DWFDEFINITION',
  'DGNDEFINITION',
])

function parseUnderlayDefinitionObject(group: ObjectGroup): UnderlayDefinitionObject | undefined {
  const objectType = group[0]?.[1]
  if (typeof objectType !== 'string') return undefined
  if (!UNDERLAY_DEFINITION_OBJECT_TYPES.has(objectType)) return undefined

  const tuples = group.slice(1)

  const def: UnderlayDefinitionObject = {
    type: objectType as UnderlayDefinitionObject['type'],
    tuples,
  }

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (type === 5) def.handle = value
    if (type === 330 && def.ownerHandle === undefined) def.ownerHandle = value
    if (type === 1) def.fileName = String(value)
    if (type === 2) def.underlayName = String(value)
  }

  return def
}

type ObjectGroupHandler = (objects: ParsedObjects, group: ObjectGroup) => void

const OBJECT_GROUP_HANDLERS: Record<string, ObjectGroupHandler> = {
  LAYOUT: (objects, group) => {
    const layout = parseLayoutObject(group)
    if (layout) objects.layouts.push(layout)
  },
  DICTIONARY: (objects, group) => {
    const dict = parseDictionaryObject(group)
    const handle = dict?.handle ? String(dict.handle) : undefined
    if (dict && handle) objects.dictionaries![handle] = dict
  },
  XRECORD: (objects, group) => {
    const xRecord = parseXRecordObject(group)
    const handle = xRecord?.handle ? String(xRecord.handle) : undefined
    if (xRecord && handle) objects.xRecords![handle] = xRecord
  },
  IMAGEDEF: (objects, group) => {
    const imageDef = parseImageDefObject(group)
    const handle = imageDef?.handle ? String(imageDef.handle) : undefined
    if (imageDef && handle) objects.imageDefs![handle] = imageDef
  },
  IMAGEDEF_REACTOR: (objects, group) => {
    const reactor = parseImageDefReactorObject(group)
    const handle = reactor?.handle ? String(reactor.handle) : undefined
    if (reactor && handle) objects.imageDefReactors![handle] = reactor
  },
  UNDERLAYDEFINITION: (objects, group) => {
    const def = parseUnderlayDefinitionObject(group)
    const handle = def?.handle ? String(def.handle) : undefined
    if (def && handle) objects.underlayDefinitions![handle] = def
  },
  PDFDEFINITION: (objects, group) => {
    const def = parseUnderlayDefinitionObject(group)
    const handle = def?.handle ? String(def.handle) : undefined
    if (def && handle) objects.underlayDefinitions![handle] = def
  },
  DWFDEFINITION: (objects, group) => {
    const def = parseUnderlayDefinitionObject(group)
    const handle = def?.handle ? String(def.handle) : undefined
    if (def && handle) objects.underlayDefinitions![handle] = def
  },
  DGNDEFINITION: (objects, group) => {
    const def = parseUnderlayDefinitionObject(group)
    const handle = def?.handle ? String(def.handle) : undefined
    if (def && handle) objects.underlayDefinitions![handle] = def
  },
  DIMASSOC: (objects, group) => {
    const dimAssoc = parseDimAssocObject(group)
    const handle = dimAssoc?.handle ? String(dimAssoc.handle) : undefined
    if (dimAssoc && handle) objects.dimAssocs![handle] = dimAssoc
  },
  FIELD: (objects, group) => {
    const field = parseFieldObject(group)
    const handle = field?.handle ? String(field.handle) : undefined
    if (field && handle) objects.fields![handle] = field
  },
}

export default function parseObjects(tuples: DXFTuple[]): ParsedObjects {
  const objects: ParsedObjects = {
    layouts: [],
    dictionaries: {},
    xRecords: {},
    imageDefs: {},
    imageDefReactors: {},
    underlayDefinitions: {},
    dimAssocs: {},
    fields: {},
  }

  const groups = groupObjectsByZero(tuples)
  for (const group of groups) {
    const objectType = group[0]?.[1]
    if (typeof objectType !== 'string') continue

    const handler = OBJECT_GROUP_HANDLERS[objectType]
    if (handler) handler(objects, group)
  }

  return objects
}
