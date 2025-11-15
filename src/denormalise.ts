import cloneDeep from 'lodash/cloneDeep'

import logger from './util/logger'

import type {
  ArcEntity,
  Block,
  CircleEntity,
  EllipseEntity,
  Entity,
  InsertEntity,
  LineEntity,
  ParsedDXF,
  PolylineEntity,
  SplineEntity,
  Transform,
} from './types'

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
    let current: Entity[] = []
    for (const e of entities) {
      if (e.type === 'INSERT') {
        const insert = e as InsertEntity
        const block = blocksByName[insert.block]
        if (!block) {
          logger.error('no block found for insert. block:', insert.block)
          continue
        }

        const rowCount = insert.rowCount ?? 1
        const columnCount = insert.columnCount ?? 1
        const rowSpacing = insert.rowSpacing ?? 0
        const columnSpacing = insert.columnSpacing ?? 0
        const rotation = insert.rotation ?? 0

        // It appears that the rectangular array is affected by rotation, but NOT by scale.
        let rowVec: { x: number; y: number }
        let colVec: { x: number; y: number }
        if (rowCount > 1 || columnCount > 1) {
          const cos = Math.cos((rotation * Math.PI) / 180)
          const sin = Math.sin((rotation * Math.PI) / 180)
          rowVec = { x: -sin * rowSpacing, y: cos * rowSpacing }
          colVec = { x: cos * columnSpacing, y: sin * columnSpacing }
        } else {
          rowVec = { x: 0, y: 0 }
          colVec = { x: 0, y: 0 }
        }

        // For rectangular arrays, add the block entities for each location in the array
        for (let r = 0; r < rowCount; r++) {
          for (let c = 0; c < columnCount; c++) {
            // Adjust insert transform by row and column for rectangular arrays
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
            // Add the insert transform and recursively add entities
            const transforms2 = transforms.slice(0)
            transforms2.push(t)

            // Use the insert layer
            const blockEntities = block.entities.map((be: Entity) => {
              const be2 = cloneDeep(be)
              be2.layer = insert.layer
              // https://github.com/bjnortier/dxf/issues/52
              // See Issue 52. If we don't modify the
              // entity coordinates here it creates an issue with the
              // transformation matrices (which are only applied AFTER
              // block insertion modifications has been applied).
              switch (be2.type) {
                case 'LINE': {
                  const line = be2 as LineEntity
                  line.start.x -= block.x
                  line.start.y -= block.y
                  line.end.x -= block.x
                  line.end.y -= block.y
                  break
                }
                case 'LWPOLYLINE':
                case 'POLYLINE': {
                  const poly = be2 as PolylineEntity
                  for (const v of poly.vertices) {
                    if (v.x !== undefined) v.x -= block.x
                    if (v.y !== undefined) v.y -= block.y
                  }
                  break
                }
                case 'CIRCLE': {
                  const circle = be2 as CircleEntity
                  circle.x -= block.x
                  circle.y -= block.y
                  break
                }
                case 'ELLIPSE': {
                  const ellipse = be2 as EllipseEntity
                  ellipse.x -= block.x
                  ellipse.y -= block.y
                  break
                }
                case 'ARC': {
                  const arc = be2 as ArcEntity
                  arc.x -= block.x
                  arc.y -= block.y
                  break
                }
                case 'SPLINE': {
                  const spline = be2 as SplineEntity
                  for (const cp of spline.controlPoints) {
                    cp.x -= block.x
                    cp.y -= block.y
                  }
                  break
                }
              }
              return be2
            })
            current = current.concat(gatherEntities(blockEntities, transforms2))
          }
        }
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
