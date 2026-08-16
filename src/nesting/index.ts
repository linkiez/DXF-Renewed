/**
 * Nesting Module
 *
 * Extracts closed shapes from DXF files and arranges them on stock sheets
 * to minimize material waste. Used for CNC/laser/waterjet cutting optimization.
 *
 * @module nesting
 */

// ─────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────

export type {
  BoundingBox,
  RotationTransform,

  // Shape types
  NestableShape,
  CompoundShape,

  // Placement types
  Placement,
  CompoundPlacement,

  // Stock sheet types
  StockSheet,

  // Nesting result types
  NestingResult,

  // Configuration types
  NestingAlgorithm,
  SortStrategy,
  NestingOptions,

  // Bin packing internal types
  FreeRect,
  GuillotineNode,
  Shelf,

  // Utility types
  ExtractionResult,
  CollisionResult,
  NestingMetrics,
} from './types'

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

export {
  DEFAULT_SHEET_WIDTH,
  DEFAULT_SHEET_HEIGHT,
  DEFAULT_KERF,
  DEFAULT_MARGIN,
  DEFAULT_ALLOWED_ROTATIONS,
  DEFAULT_ALGORITHM,
  DEFAULT_SORT_BY,
  DEFAULT_MAX_SHEETS,
  DEFAULT_CURVE_SEGMENTS,
  EPSILON,
  DEFAULT_STOCK_SHEET,
  DEFAULT_NESTING_OPTIONS,
  validateNestingOptions,
  parseSheetSize,
  parseRotations,
} from './config'

// ─────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────

// Shape extraction
export { extractShapes, resetShapeIdCounter } from './shapeExtractor'

// Geometry analysis
export {
  analyzeShape,
  analyzeShapes,
  analyzeCompoundShape,
  sortShapes,
  computeBestRotatedBbox,
  enlargeBbox,
} from './geometryAnalysis'

// Bin packing algorithms
export { guillotinePack } from './binPacking/guillotine'
export { maxRectsPack } from './binPacking/maxrects'
export { shelfPack } from './binPacking/shelf'

// Nesting pipeline
export { nest, nestFromDxf, resetNestingState } from './applyNesting'

// Output generation
export { toNestedSvg } from './toNestedSvg'
export { toNestedDxf } from './toNestedDxf'

// Collision detection
export {
  checkCollision,
  checkTransformedCollision,
  validatePlacements,
  bboxesOverlap,
  bboxesOverlapWithMargin,
  satCollision,
} from './collision'

// Polygon utilities
export {
  // Distance & angle
  distance,
  distanceSquared,
  angle,
  degToRad,
  radToDeg,

  // Rotation
  rotatePoint,
  rotatePolygon,
  translatePolygon,

  // Area
  signedArea,
  computeArea,
  isCounterClockwise,
  normalizeWinding,

  // Perimeter
  computePerimeter,

  // Centroid
  computeCentroid,

  // Bounding box
  computeBoundingBox,
  computeRotatedBoundingBox,

  // Convex hull
  computeConvexHull,
  isConvex,

  // Point-in-polygon
  pointInPolygon,

  // Polygon closure
  ensureClosed,
  isClosed,

  // Curve approximation
  circleToPolygon,
  ellipseToPolygon,
  arcToPolygon,
} from './polygonUtils'

// ─────────────────────────────────────────────
// Nesting Helper Class
// ─────────────────────────────────────────────

export { NestingHelper } from './NestingHelper'
