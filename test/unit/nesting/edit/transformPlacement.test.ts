import { expect } from 'expect'
import { transformPart } from '../../../../src/nesting/edit/transformPlacement'
import { computeBoundingBox, rotatePolygon, translatePolygon } from '../../../../src/nesting/polygonUtils'
import type { NestableShape, Placement, Point2D } from '../../../../src/nesting'
import { square } from '../cutPath/fixtures'
import { compoundFixture } from '../review/fixtures'
import { deepFreeze, workingPartOf } from './fixtures'

const closeTo = (a: Point2D[], b: Point2D[]): void => {
  expect(a).toHaveLength(b.length)
  a.forEach((point, index) => {
    expect(point.x).toBeCloseTo(b[index].x, 6)
    expect(point.y).toBeCloseTo(b[index].y, 6)
  })
}

/** An L shape: not symmetric, so rotation and mirroring are observable. */
const lShape = (): NestableShape => {
  const vertices: Point2D[] = [
    { x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 30 }, { x: 0, y: 30 }, { x: 0, y: 0 },
  ]
  return { ...square('l', 0, 0, 30), vertices, centroid: { x: 10, y: 10 } }
}

/** The way the true-shape search places an instance: bounding-box minimum lands on (x, y). */
const placeAs = (shape: NestableShape, rotation: number, x: number, y: number): Placement => {
  const rotated = rotatePolygon(shape.vertices, shape.centroid, rotation)
  const bbox = computeBoundingBox(rotated)
  const vertices = translatePolygon(rotated, x - bbox.minX, y - bbox.minY)
  return { shapeId: shape.id, sheetId: 'sheet-1', x, y, rotation, bbox: computeBoundingBox(vertices), transformedVertices: vertices }
}

describe('edit/transformPlacement', () => {
  it('moves the outline, the box and (x, y) by the same delta', () => {
    const part = workingPartOf(placeAs(lShape(), 0, 10, 20))

    const moved = transformPart(part, { partKey: part.key, kind: 'move', delta: { dx: 5, dy: -3 } })

    expect(moved.placement.x).toBe(15)
    expect(moved.placement.y).toBe(17)
    expect(moved.placement.bbox.minX).toBe(15)
    closeTo(moved.outlines[0], translatePolygon(part.outlines[0], 5, -3))
    expect((moved.placement as Placement).transformedVertices).toEqual(moved.outlines[0])
  })

  it('treats (x, y) as the bounding-box minimum, as the true-shape search does', () => {
    for (const degrees of [90, 180, 270, 30]) {
      const part = workingPartOf(placeAs(lShape(), 0, 10, 20))

      const turned = transformPart(part, { partKey: part.key, kind: 'rotate', delta: { degrees } })

      const expected = placeAs(lShape(), degrees, turned.placement.x, turned.placement.y)
      closeTo(turned.outlines[0], expected.transformedVertices as Point2D[])
      expect(turned.placement.rotation).toBe(degrees)
      expect(turned.placement.x).toBeCloseTo(computeBoundingBox(turned.outlines[0]).minX, 6)
      expect(turned.placement.y).toBeCloseTo(computeBoundingBox(turned.outlines[0]).minY, 6)
    }
  })

  it('adds to the rotation modulo 360', () => {
    const part = workingPartOf(placeAs(lShape(), 270, 10, 20))

    const turned = transformPart(part, { partKey: part.key, kind: 'rotate', delta: { degrees: 180 } })

    expect(turned.placement.rotation).toBe(90)
  })

  it('mirrors about the vertical axis through the box center and keeps the winding', () => {
    const part = workingPartOf(placeAs(lShape(), 0, 10, 20))
    const before = computeBoundingBox(part.outlines[0])

    const mirrored = transformPart(part, { partKey: part.key, kind: 'mirror' })

    const after = computeBoundingBox(mirrored.outlines[0])
    expect(after.minX).toBeCloseTo(before.minX, 6)
    expect(after.maxX).toBeCloseTo(before.maxX, 6)
    expect(mirrored.mirrored).toBe(true)
    const area = (ring: Point2D[]): number => ring.slice(0, -1).reduce((sum, p, i) => sum + (p.x * ring[i + 1].y - ring[i + 1].x * p.y), 0)
    expect(Math.sign(area(mirrored.outlines[0]))).toBe(Math.sign(area(part.outlines[0])))
    expect(transformPart(mirrored, { partKey: part.key, kind: 'mirror' }).mirrored).toBe(false)
  })

  it('transforms a compound placement as one unit', async () => {
    const input = await compoundFixture()
    const layout = input.artifact.layout as NonNullable<typeof input.artifact.layout>
    const compound = (layout.compoundPlacements ?? [])[0]
    const part = {
      ...workingPartOf(compound.outerPlacement, 'compound-1#0'),
      placement: compound,
      outlines: [compound.outerPlacement, ...compound.holePlacements].map((p) => (p.transformedVertices ?? []).map((v) => ({ ...v }))),
    }

    const moved = transformPart(part, { partKey: part.key, kind: 'move', delta: { dx: 4, dy: 6 } })

    const placement = moved.placement as typeof compound
    expect(placement.x).toBe(compound.x + 4)
    expect(placement.outerPlacement.x).toBe(compound.outerPlacement.x + 4)
    expect(placement.holePlacements[0].y).toBe(compound.holePlacements[0].y + 6)
    expect(moved.outlines).toHaveLength(2)
  })

  it('never mutates its input and is identical for identical input', () => {
    const part = deepFreeze(workingPartOf(placeAs(lShape(), 0, 10, 20)))
    const edit = { partKey: part.key, kind: 'rotate' as const, delta: { degrees: 90 } }

    expect(transformPart(part, edit)).toEqual(transformPart(part, edit))
  })
})
