import common from './common'

export const TYPE = 'DIMENSION'

type Tuple = [number, string | number]

interface Point3D {
  x: number
  y: number
  z: number
}

interface DimensionEntity {
  type: typeof TYPE
  block?: string
  start: Point3D
  textMidpoint: Point3D
  measureStart: Point3D
  measureEnd: Point3D
  rotation?: number
  horizonRotation?: number
  extensionRotation?: number
  textRotation?: number
  ordinateType?: boolean
  uniqueBlockReference?: boolean
  userDefinedLocation?: boolean
  dimensionType: number
  attachementPoint: number
  extrudeDirection?: Point3D
  [key: string]: unknown
}

interface BitCombinationsResult {
  dimensionType: number
  uniqueBlockReference: boolean
  ordinateType: boolean
  userDefinedLocation: boolean
}

export const process = (tuples: Tuple[]): DimensionEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          entity.block = value as string
          break
        case 10:
          entity.start.x = value as number
          break
        case 20:
          entity.start.y = value as number
          break
        case 30:
          entity.start.z = value as number
          break
        case 11:
          entity.textMidpoint.x = value as number
          break
        case 21:
          entity.textMidpoint.y = value as number
          break
        case 31:
          entity.textMidpoint.z = value as number
          break
        case 13:
          entity.measureStart.x = value as number
          break
        case 23:
          entity.measureStart.y = value as number
          break
        case 33:
          entity.measureStart.z = value as number
          break
        case 14:
          entity.measureEnd.x = value as number
          break
        case 24:
          entity.measureEnd.y = value as number
          break
        case 34:
          entity.measureEnd.z = value as number
          break
        case 50:
          entity.rotation = value as number
          break
        case 51:
          entity.horizonRotation = value as number
          break
        case 52:
          entity.extensionRotation = value as number
          break
        case 53:
          entity.textRotation = value as number
          break
        case 70: {
          const dimType = parseBitCombinationsFromValue(value as number)
          if (dimType.ordinateType) {
            entity.ordinateType = true
          }
          if (dimType.uniqueBlockReference) {
            entity.uniqueBlockReference = true
          }
          if (dimType.userDefinedLocation) {
            entity.userDefinedLocation = true
          }
          entity.dimensionType = dimType.dimensionType
          break
        }
        case 71:
          entity.attachementPoint = value as number
          break
        case 210:
          entity.extrudeDirection = entity.extrudeDirection || {
            x: 0,
            y: 0,
            z: 0,
          }
          entity.extrudeDirection.x = value as number
          break
        case 220:
          entity.extrudeDirection = entity.extrudeDirection || {
            x: 0,
            y: 0,
            z: 0,
          }
          entity.extrudeDirection.y = value as number
          break
        case 230:
          entity.extrudeDirection = entity.extrudeDirection || {
            x: 0,
            y: 0,
            z: 0,
          }
          entity.extrudeDirection.z = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      start: { x: 0, y: 0, z: 0 },
      measureStart: { x: 0, y: 0, z: 0 },
      measureEnd: { x: 0, y: 0, z: 0 },
      textMidpoint: { x: 0, y: 0, z: 0 },
      attachementPoint: 1,
      dimensionType: 0,
    } as DimensionEntity,
  )
}

/**
 * From DXF Reference for DIMENSION
 * Values 0-6 are integer values that represent the dimension type. Values 32, 64, and 128
 * are bit values, which are added to the integer values (value 32 is always set in R13 and
 * later releases)
 * 0 = Rotated, horizontal, or vertical; 1 = Aligned
 * 2 = Angular; 3 = Diameter; 4 = Radius
 * 5 = Angular 3 point; 6 = Ordinate
 * 32 = Indicates that the block reference (group code 2) is referenced by this dimension only
 * 64 = Ordinate type. This is a bit value (bit 7) used only with integer value 6. If set, ordinate is X-type; if not set, ordinate is Y-type
 * 128 = This is a bit value (bit 8) added to the other group 70 values if the dimension text has been positioned at a user-defined location rather than at the default location
 */
function parseBitCombinationsFromValue(value: number): BitCombinationsResult {
  let uniqueBlockReference = false
  let ordinateType = false
  let userDefinedLocation = false

  // ToDo: Solve in some more clever way??
  if (value > 6) {
    const alt1 = value - 32
    const alt2 = value - 64
    const alt3 = value - 32 - 64
    const alt4 = value - 32 - 128
    const alt5 = value - 32 - 64 - 128

    if (alt1 >= 0 && alt1 <= 6) {
      uniqueBlockReference = true
      value = alt1
    } else if (alt2 >= 0 && alt2 <= 6) {
      ordinateType = true
      value = alt2
    } else if (alt3 >= 0 && alt3 <= 6) {
      uniqueBlockReference = true
      ordinateType = true
      value = alt3
    } else if (alt4 >= 0 && alt4 <= 6) {
      uniqueBlockReference = true
      userDefinedLocation = true
      value = alt4
    } else if (alt5 >= 0 && alt5 <= 6) {
      uniqueBlockReference = true
      ordinateType = true
      userDefinedLocation = true
      value = alt5
    }
  }
  return {
    dimensionType: value,
    uniqueBlockReference,
    ordinateType,
    userDefinedLocation,
  }
}

export default { TYPE, process }
