import cloneDeep from 'lodash/cloneDeep'

import logger from './util/logger'

import type {
  ArcEntity,
  Block,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  ParsedDXF,
  PolylineEntity,
  SplineEntity,
  TextEntity,
  Transform,
} from './types'

type BlockBasePointAdjuster = (entity: Entity, block: Block) => void

function adjustLineForBlockBasePoint(entity: Entity, block: Block): void {
  const line = entity as LineEntity
  line.start.x -= block.x
  line.start.y -= block.y
  line.end.x -= block.x
  line.end.y -= block.y
}

function adjustPolylineForBlockBasePoint(entity: Entity, block: Block): void {
  const poly = entity as PolylineEntity
  for (const v of poly.vertices) {
    if (v.x !== undefined) v.x -= block.x
    if (v.y !== undefined) v.y -= block.y
  }
}

function adjustCircleForBlockBasePoint(entity: Entity, block: Block): void {
  const circle = entity as CircleEntity
  circle.x -= block.x
  circle.y -= block.y
}

function adjustEllipseForBlockBasePoint(entity: Entity, block: Block): void {
  const ellipse = entity as EllipseEntity
  ellipse.x -= block.x
  ellipse.y -= block.y
}

function adjustArcForBlockBasePoint(entity: Entity, block: Block): void {
  const arc = entity as ArcEntity
  arc.x -= block.x
  arc.y -= block.y
}

function adjustSplineForBlockBasePoint(entity: Entity, block: Block): void {
  const spline = entity as SplineEntity
  for (const cp of spline.controlPoints) {
    cp.x -= block.x
    cp.y -= block.y
  }
}

function adjustTextForBlockBasePoint(entity: Entity, block: Block): void {
  const text = entity as TextEntity
  if (text.x !== undefined) text.x -= block.x
  if (text.y !== undefined) text.y -= block.y
  if (text.x2 !== undefined) text.x2 -= block.x
  if (text.y2 !== undefined) text.y2 -= block.y
}

function adjustMTextForBlockBasePoint(entity: Entity, block: Block): void {
  const mtext = entity as MTextEntity
  if (mtext.x !== undefined) mtext.x -= block.x
  if (mtext.y !== undefined) mtext.y -= block.y
}

function adjustDimensionForBlockBasePoint(entity: Entity, block: Block): void {
  const dim = entity as DimensionEntity
  dim.start.x -= block.x
  dim.start.y -= block.y
  dim.textMidpoint.x -= block.x
  dim.textMidpoint.y -= block.y
  dim.measureStart.x -= block.x
  dim.measureStart.y -= block.y
  dim.measureEnd.x -= block.x
  dim.measureEnd.y -= block.y
}

const BLOCK_BASEPOINT_ADJUSTERS: Record<string, BlockBasePointAdjuster> = {
  LINE: adjustLineForBlockBasePoint,
  LWPOLYLINE: adjustPolylineForBlockBasePoint,
  POLYLINE: adjustPolylineForBlockBasePoint,
  CIRCLE: adjustCircleForBlockBasePoint,
  ELLIPSE: adjustEllipseForBlockBasePoint,
  ARC: adjustArcForBlockBasePoint,
  SPLINE: adjustSplineForBlockBasePoint,
  TEXT: adjustTextForBlockBasePoint,
  MTEXT: adjustMTextForBlockBasePoint,
  DIMENSION: adjustDimensionForBlockBasePoint,
}

function applyBlockBasePointAdjustment(entity: Entity, block: Block): void {
  // https://github.com/bjnortier/dxf/issues/52
  // See Issue 52. If we don't modify the entity coordinates here it creates an
  // issue with the transformation matrices (which are only applied AFTER block
  // insertion modifications has been applied).
  const adjust = BLOCK_BASEPOINT_ADJUSTERS[entity.type]
  if (adjust) adjust(entity, block)
}

function computeRectangularArrayVectors(insert: InsertEntity): {
  rowVec: { x: number; y: number }
  colVec: { x: number; y: number }
} {
  const rowCount = insert.rowCount ?? 1
  const columnCount = insert.columnCount ?? 1
  const rowSpacing = insert.rowSpacing ?? 0
  const columnSpacing = insert.columnSpacing ?? 0
  const rotation = insert.rotation ?? 0

  // It appears that the rectangular array is affected by rotation, but NOT by scale.
  if (rowCount <= 1 && columnCount <= 1) {
    return { rowVec: { x: 0, y: 0 }, colVec: { x: 0, y: 0 } }
  }

  const cos = Math.cos((rotation * Math.PI) / 180)
  const sin = Math.sin((rotation * Math.PI) / 180)
  return {
    rowVec: { x: -sin * rowSpacing, y: cos * rowSpacing },
    colVec: { x: cos * columnSpacing, y: sin * columnSpacing },
  }
}

function expandInsert(
  insert: InsertEntity,
  blocksByName: Record<string, Block>,
  transforms: Transform[],
  gatherEntities: (entities: Entity[], transforms: Transform[]) => Entity[],
): Entity[] {
  const block = blocksByName[insert.block]
  if (!block) {
    logger.error('no block found for insert. block:', insert.block)
    return []
  }

  const rowCount = insert.rowCount ?? 1
  const columnCount = insert.columnCount ?? 1
  const { rowVec, colVec } = computeRectangularArrayVectors(insert)

  const current: Entity[] = []
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columnCount; c++) {
      const t: Transform = {
        x: insert.x + rowVec.x * r + colVec.x * c,
        y: insert.y + rowVec.y * r + colVec.y * c,
        scaleX: insert.scaleX,
        scaleY: insert.scaleY,
        scaleZ: insert.scaleZ,
        extrusionX: insert.extrusionX,
        extrusionY: insert.extrusionY,
        extrusionZ: insert.extrusionZ,
        rotation: insert.rotation,
      }

      const transforms2 = transforms.slice(0)
      transforms2.push(t)

      // Use the insert layer
      const blockEntities = block.entities.map((be: Entity) => {
        const be2 = cloneDeep(be)
        be2.layer = insert.layer
        applyBlockBasePointAdjustment(be2, block)
        return be2
      })

      current.push(...gatherEntities(blockEntities, transforms2))
    }
  }

  return current
}

export default function denormalise(parseResult: ParsedDXF): Entity[] {
  const blocksByName = parseResult.blocks.reduce(
    (acc: { [name: string]: Block }, b: Block) => {
      acc[b.name] = b
      return acc
    },
    {},
  )

  const gatherEntities = (
    entities: Entity[],
    transforms: Transform[],
  ): Entity[] => {
    const current: Entity[] = []
    for (const e of entities) {
      if (e.type === 'INSERT') {
        current.push(
          ...expandInsert(e as InsertEntity, blocksByName, transforms, gatherEntities),
        )
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        const e2 = cloneDeep(e)
        e2.transforms = transforms.slice().reverse()
        current.push(e2)
      }
    }
    return current
  }

  return gatherEntities(parseResult.entities, [])
}
