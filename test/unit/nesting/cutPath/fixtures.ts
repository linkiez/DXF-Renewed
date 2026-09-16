import type {
  BoundingBox,
  CutContour,
  CutLayout,
  CutProcessProfile,
  NestableShape,
  Placement,
  Point2D,
  StockItem,
} from '../../../../src/nesting'

export const square = (id: string, x: number, y: number, size = 4): NestableShape => {
  const vertices: Point2D[] = [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
    { x, y },
  ]
  const bbox: BoundingBox = {
    minX: x,
    minY: y,
    maxX: x + size,
    maxY: y + size,
    width: size,
    height: size,
  }

  return {
    id,
    layer: 'CUT',
    vertices,
    bbox,
    area: size * size,
    perimeter: size * 4,
    centroid: { x: x + size / 2, y: y + size / 2 },
    allowedRotations: [0],
    kerf: 0,
    isHole: false,
  }
}

export const placementFor = (
  shape: NestableShape,
  sheetId: string,
  x = shape.bbox.minX,
  y = shape.bbox.minY,
): Placement => ({
  shapeId: shape.id,
  sheetId,
  x,
  y,
  rotation: 0,
  bbox: {
    minX: x,
    minY: y,
    maxX: x + shape.bbox.width,
    maxY: y + shape.bbox.height,
    width: shape.bbox.width,
    height: shape.bbox.height,
  },
  transformedVertices: shape.vertices.map((point) => ({
    x: point.x - shape.bbox.minX + x,
    y: point.y - shape.bbox.minY + y,
  })),
})

export const sheet: StockItem = {
  id: 'sheet-1',
  kind: 'sheet',
  width: 100,
  height: 100,
}

export const contour = (
  id: string,
  partId: string,
  shape: NestableShape,
  placement: Placement,
  isOuter: boolean,
  parentContourId?: string,
): CutContour => ({
  id,
  partId,
  sheetId: sheet.id,
  shape,
  placement,
  isOuter,
  parentContourId,
})

export const profile = (overrides: Partial<CutProcessProfile> = {}): CutProcessProfile => ({
  sequence: {
    strategy: 'nearest-neighbour',
    budgetFactor: 2,
  },
  lead: {
    type: 'straight',
    length: 1,
    angle: 0,
    placement: 'outside',
  },
  pierce: {
    clearance: 1,
    smallHoleThreshold: 4,
  },
  tabs: {
    enabled: false,
    width: 0.5,
    count: 0,
  },
  overcut: {
    enabled: false,
    length: 0.25,
  },
  clearance: {
    contour: 0.1,
    tab: 0.1,
    keptMaterial: 0.1,
  },
  commonLine: {
    enabled: false,
    tolerance: 0.001,
  },
  ...overrides,
})

export const basicLayout = (): CutLayout => {
  const outer = square('outer-shape', 10, 10, 20)
  const hole = square('hole-shape', 17, 17, 4)

  return {
    sheets: [sheet],
    contours: [
      contour('outer', 'part-1', outer, placementFor(outer, sheet.id), true),
      contour('hole', 'part-1', hole, placementFor(hole, sheet.id), false, 'outer'),
    ],
    startPoint: { x: 0, y: 0 },
  }
}

export const clone = <T>(value: T): T => structuredClone(value)
