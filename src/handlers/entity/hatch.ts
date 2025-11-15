import type { DXFTuple, HatchEntity, HatchLoop, HatchSeed } from '../../types'

import common from './common'

export const TYPE = 'HATCH'

let status: 'IDLE' | 'POLYLINE' | 'SEED' | 'ENT' | 'SPLINE' = 'IDLE'
let drawEntity: any = {}
let drawType = 0
let isPolyline = false
let seed: HatchSeed | null = null
let loop: HatchLoop = { references: [], entities: [] }
let polyPoint: any = null

export const process = (tuples: DXFTuple[]): HatchEntity => {
  status = 'IDLE'
  drawEntity = {}
  drawType = 0
  isPolyline = false
  seed = null
  loop = { references: [], entities: [] }
  polyPoint = null

  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      switch (type) {
        case 100:
          status = 'IDLE'
          break
        case 2:
          entity.patternName = value
          break
        case 10:
          if (status === 'IDLE') {
            entity.elevation ??= { x: 0, y: 0, z: 0 }
            entity.elevation.x = Number.parseFloat(String(value))
          }
          else if (status === 'POLYLINE') {
            polyPoint = {
              x: Number.parseFloat(String(value)),
              y: 0,
              bulge: 0,
            }
            loop.entities[0].points.push(polyPoint)
          } else if (status === 'SEED') {
            if (!seed) {
              seed = { x: 0, y: 0 }
              entity.seeds ??= { count: 0, seeds: [] }
              entity.seeds.seeds.push(seed)
            }
            seed.x = Number.parseFloat(String(value))
          } else fillDrawEntity(type, drawType, Number.parseFloat(String(value)))
          break
        case 20:
          if (status === 'IDLE') {
            entity.elevation ??= { x: 0, y: 0, z: 0 }
            entity.elevation.y = Number.parseFloat(String(value))
          }
          else if (status === 'POLYLINE') polyPoint.y = Number.parseFloat(String(value))
          else if (status === 'SEED') {
            if (seed) seed.y = Number.parseFloat(String(value))
            seed = null
          } else fillDrawEntity(type, drawType, Number.parseFloat(String(value)))
          break
        case 30:
          entity.elevation ??= { x: 0, y: 0, z: 0 }
          entity.elevation.z = Number.parseFloat(String(value))
          break
        case 63:
          entity.fillColor = value
          break
        case 70:
          entity.fillType = Number.parseFloat(String(value)) === 1 ? 'SOLID' : 'PATTERN'
          break
        case 210:
          entity.extrusionDir ??= { x: 0, y: 0, z: 1 }
          entity.extrusionDir.x = Number.parseFloat(String(value))
          break
        case 220:
          entity.extrusionDir ??= { x: 0, y: 0, z: 1 }
          entity.extrusionDir.y = Number.parseFloat(String(value))
          break
        case 230:
          entity.extrusionDir ??= { x: 0, y: 0, z: 1 }
          entity.extrusionDir.z = Number.parseFloat(String(value))
          break
        case 91:
          // LOOP COUNT
          entity.boundary ??= { count: 0, loops: [] }
          entity.boundary.count = Number.parseFloat(String(value))
          break
        case 92:
          // 0 = Default; 1 = External; 2 = Polyline; 4 = Derived; 8 = Textbox; 16 = Outermost
          loop = { references: [], entities: [] }
          entity.boundary ??= { count: 0, loops: [] }
          entity.boundary.loops.push(loop)
          loop.type = Number.parseFloat(String(value))
          isPolyline = (loop.type & 2) === 2
          if (isPolyline) {
            const ent = {
              type: 'POLYLINE',
              points: [],
            }
            loop.entities.push(ent)
            status = 'POLYLINE'
          }
          break
        case 93:
          if (status === 'IDLE') status = 'ENT'
          loop.count = Number.parseFloat(String(value))
          break
        case 11:
        case 21:
        case 40:
        case 50:
        case 51:
        case 74:
        case 94:
        case 95:
        case 96:
          if (drawType === 4) status = 'SPLINE'
          fillDrawEntity(type, drawType, Number.parseFloat(String(value)))
          break
        case 42:
          if (isPolyline) polyPoint.bulge = Number.parseFloat(String(value))
          else fillDrawEntity(type, drawType, Number.parseFloat(String(value)))
          break
        case 72:
          // !Polyline --> 1 = Line; 2 = Circular arc; 3 = Elliptic arc; 4 = Spline
          // Polyline -->  hasBulge
          drawType = Number.parseFloat(String(value))
          loop[isPolyline ? 'hasBulge' : 'edgeType'] = drawType
          if (!isPolyline) {
            drawEntity = createDrawEntity(drawType)
            loop.entities.push(drawEntity)
          }
          break
        case 73:
          if (status === 'IDLE' || isPolyline) loop.entities[0].closed = value
          else fillDrawEntity(type, drawType, Number.parseFloat(String(value)))
          break
        case 75:
          // END OF BOUNDARY PATH DATA
          status = 'IDLE'

          // 0 = Hatch "odd parity" area (Normal style)
          // 1 = Hatch outermost area only (Outer style)
          // 2 = Hatch through entire area (Ignore style)
          entity.style = Number.parseFloat(String(value))
          break
        case 76:
          // 0 = User-defined; 1 = Predefined; 2 = Custom
          entity.hatchType = Number.parseFloat(String(value))
          break
        case 97:
          status = 'IDLE'
          isPolyline = false
          loop.sourceObjects = Number.parseFloat(String(value))
          break
        case 98:
          status = 'SEED'
          entity.seeds ??= { count: 0, seeds: [] }
          entity.seeds.count = Number.parseFloat(String(value))
          break
        case 52:
          entity.shadowPatternAngle = Number.parseFloat(String(value))
          break
        case 41:
          entity.spacing = Number.parseFloat(String(value))
          break
        case 77:
          entity.double = Number.parseFloat(String(value)) === 1
          break
        case 78:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.lineCount = Number.parseFloat(String(value))
          break
        case 53:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.angle = Number.parseFloat(String(value))
          break
        case 43:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.x = Number.parseFloat(String(value))
          break
        case 44:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.y = Number.parseFloat(String(value))
          break
        case 45:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.offsetX = Number.parseFloat(String(value))
          break
        case 46:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.offsetY = Number.parseFloat(String(value))
          break
        case 79:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.dashCount = Number.parseFloat(String(value))
          break
        case 49:
          entity.pattern ??= { lineCount: 0, angle: 0, x: 0, y: 0, offsetX: 0, offsetY: 0, dashCount: 0, length: [] }
          entity.pattern.length.push(value)
          break
        case 330:
          loop.references.push(value)
          break
        case 450:
          entity.solidOrGradient =
            Number.parseFloat(String(value)) === 0 ? 'SOLID' : 'GRADIENT'
          break
        case 453:
          // 0 = Solid; 2 = Gradient
          entity.color ??= { count: 0, rotation: 0, gradient: 0, tint: 0 }
          entity.color.count = Number.parseFloat(String(value))
          break
        case 460:
          entity.color ??= { count: 0, rotation: 0, gradient: 0, tint: 0 }
          entity.color.rotation = value
          break
        case 461:
          entity.color ??= { count: 0, rotation: 0, gradient: 0, tint: 0 }
          entity.color.gradient = value
          break
        case 462:
          entity.color ??= { count: 0, rotation: 0, gradient: 0, tint: 0 }
          entity.color.tint = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      elevation: { x: 0, y: 0, z: 0 },
      extrusionDir: { x: 0, y: 0, z: 1 },
      pattern: {
        lineCount: 0,
        angle: 0,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        dashCount: 0,
        length: []
      },
      boundary: {
        count: 0,
        loops: []
      },
      seeds: {
        count: 0,
        seeds: []
      },
      color: {
        count: 0,
        rotation: 0,
        gradient: 0,
        tint: 0
      },
    } as HatchEntity,
  )
}

export default { TYPE, process }

/**
 * Creates a draw entity based on edge type
 *
 * @param type - Edge type (1=Line, 2=Arc, 3=Ellipse, 4=Spline)
 * @returns Draw entity object
 */
function createDrawEntity(type: number): any {
  if (isPolyline) return {}

  // 1 = Line; 2 = Circular arc; 3 = Elliptic arc; 4 = Spline
  switch (type) {
    case 1:
      return {
        type: 'LINE',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
      }
    case 2:
      return {
        type: 'ARC',
        center: { x: 0, y: 0 },
        radius: 0,
        startAngle: 0,
        endAngle: 0,
        counterClockWise: false,
      }
    case 3:
      return {
        type: 'ELLIPSE',
        center: { x: 0, y: 0 },
        startAngle: 0,
        endAngle: 0,
        counterClockWise: false,
        major: { x: 0, y: 0 },
        minor: 0,
      }
    case 4:
      return {
        type: 'SPLINE',
        degree: 0,
        rational: 0,
        periodic: 0,
        knots: { count: 0, knots: [] },
        controlPoints: { count: 0, points: [] },
        weights: 1,
      }
  }

  return {}
}

/**
 * Fills properties of a draw entity based on DXF code, draw type, and value
 *
 * @param type - DXF group code
 * @param drawType - Entity draw type (1=Line, 2=Arc, 3=Ellipse, 4=Spline)
 * @param value - Value to set
 */
function fillDrawEntity(type: number, drawType: number, value: number): void {
  switch (type) {
    case 10:
      switch (drawType) {
        case 1:
          drawEntity.start.x = value
          break
        case 2:
          drawEntity.center.x = value
          break
        case 3:
          drawEntity.center.x = value
          break
        case 4:
          drawEntity.controlPoints.points.push({ x: value, y: 0 })
          break
      }
      break
    case 20:
      switch (drawType) {
        case 1:
          {
            drawEntity.start.y = value
          }
          break
        case 2:
          {
            drawEntity.center.y = value
          }
          break
        case 3:
          {
            drawEntity.center.y = value
          }
          break
        case 4:
          {
            drawEntity.controlPoints.points[
              drawEntity.controlPoints.points.length - 1
            ].y = value
          }
          break
      }
      break
    case 11:
      switch (drawType) {
        case 1:
          drawEntity.end.x = value
          break
        case 3:
          drawEntity.major.x = value
          break
      }
      break
    case 21:
      switch (drawType) {
        case 1:
          drawEntity.end.y = value
          break
        case 3:
          drawEntity.major.y = value
          break
      }
      break
    case 40:
      switch (drawType) {
        case 2:
          drawEntity.radius = value
          break
        case 3:
          drawEntity.minor = value
          break
        case 4:
          drawEntity.knots.knots.push(value)
          break
      }
      break
    case 42:
      if (drawType === 4) {
        drawEntity.weights = value
      }
      break
    case 50:
      switch (drawType) {
        case 2:
        case 3:
          drawEntity.startAngle = value
          break
      }
      break
    case 51:
      switch (drawType) {
        case 2:
        case 3:
          drawEntity.endAngle = value
          break
      }
      break
    case 73:
      {
        switch (drawType) {
          case 2:
            {
              drawEntity.counterClockWise = Number.parseFloat(String(value)) === 1
            }
            break
          case 3:
            {
              drawEntity.counterClockWise = Number.parseFloat(String(value)) === 1
            }
            break
          case 4:
            {
              drawEntity.rational = value
            }
            break
        }
      }
      break
    case 74:
      if (drawType === 4) {
        drawEntity.periodic = value
      }
      break
    case 94:
      if (drawType === 4) {
        drawEntity.degree = value
      }
      break
    case 95:
      if (drawType === 4) {
        drawEntity.knots.count = value
      }
      break
    case 96:
      if (drawType === 4) {
        drawEntity.controlPoints.count = value
      }
      break
  }
}
