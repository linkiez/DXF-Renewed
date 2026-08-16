/**
 * Nesting Types
 *
 * Core type definitions for the nesting module.
 * Nesting extracts closed shapes from DXF and arranges them on stock sheets
 * to minimize material waste.
 */

// ─────────────────────────────────────────────
// Point & Geometry Primitives
// ─────────────────────────────────────────────

/** 2D point */
export interface Point2D {
  x: number
  y: number
}

/** Axis-aligned bounding box */
export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

/** Rotation transform */
export interface RotationTransform {
  angle: number // degrees
  centerX: number
  centerY: number
}

// ─────────────────────────────────────────────
// Shape Types
// ─────────────────────────────────────────────

/** A simple closed polygon shape ready for nesting */
export interface NestableShape {
  /** Unique identifier */
  id: string

  /** Original DXF layer name */
  layer: string

  /** Original DXF entity handle (for traceability) */
  originalHandle?: string

  /** Closed contour vertices (first === last) */
  vertices: Point2D[]

  /** Axis-aligned bounding box */
  bbox: BoundingBox

  /** Convex hull (computed lazily) */
  convexHull?: Point2D[]

  /** Area of the shape (positive for outer, negative for holes) */
  area: number

  /** Perimeter */
  perimeter: number

  /** Centroid */
  centroid: Point2D

  /** Allowed rotation angles in degrees */
  allowedRotations: number[]

  /** Kerf (cut width compensation) */
  kerf: number

  /** User-defined tag */
  tag?: string

  /** Whether this shape is a hole (inner contour) */
  isHole: boolean
}

/** A compound shape with outer contour and optional holes */
export interface CompoundShape {
  id: string
  layer: string
  originalHandle?: string

  /** Outer contour */
  outer: NestableShape

  /** Inner contours (holes) */
  holes: NestableShape[]

  /** Combined bounding box */
  bbox: BoundingBox

  /** Net area (outer - holes) */
  netArea: number

  /** Centroid */
  centroid: Point2D

  /** Allowed rotation angles */
  allowedRotations: number[]

  /** Kerf */
  kerf: number

  /** User-defined tag */
  tag?: string
}

// ─────────────────────────────────────────────
// Placement Types
// ─────────────────────────────────────────────

/** Result of placing a shape on a stock sheet */
export interface Placement {
  /** Reference to the shape */
  shapeId: string

  /** Position on the sheet */
  x: number
  y: number

  /** Rotation applied (degrees) */
  rotation: number

  /** Bounding box after transformation */
  bbox: BoundingBox

  /** Transformed vertices */
  transformedVertices?: Point2D[]
}

/** Placement for a compound shape */
export interface CompoundPlacement {
  shapeId: string
  x: number
  y: number
  rotation: number
  bbox: BoundingBox
  outerPlacement: Placement
  holePlacements: Placement[]
}

// ─────────────────────────────────────────────
// Stock Sheet Types
// ─────────────────────────────────────────────

/** Definition of a stock sheet (material plate) */
export interface StockSheet {
  /** Sheet width */
  width: number

  /** Sheet height */
  height: number

  /** Material thickness (informational) */
  thickness?: number

  /** Material name/type */
  material?: string

  /** Grain direction angle (for wood/composites) */
  grainAngle?: number
}

// ─────────────────────────────────────────────
// Nesting Result Types
// ─────────────────────────────────────────────

/** Complete nesting result */
export interface NestingResult {
  /** Successful placements */
  placements: Placement[]

  /** Compound shape placements */
  compoundPlacements?: CompoundPlacement[]

  /** Sheets used */
  sheets: StockSheet[]

  /** Shapes that could not be placed */
  unplacedShapes: NestableShape[]

  /** Material utilization percentage (0-100) */
  utilization: number

  /** Waste area */
  wasteArea: number

  /** Total sheet area */
  totalArea: number

  /** Total shapes area */
  shapesTotalArea: number

  /** Number of sheets used */
  sheetCount: number

  /** Processing time in milliseconds */
  processingTimeMs: number
}

// ─────────────────────────────────────────────
// Configuration Types
// ─────────────────────────────────────────────

/** Supported nesting algorithms */
export type NestingAlgorithm = 'guillotine' | 'maxrects' | 'shelf' | 'bliss'

/** Sort strategy for shape ordering */
export type SortStrategy = 'area-desc' | 'area-asc' | 'perimeter-desc' | 'none'

/** Main nesting configuration */
export interface NestingOptions {
  /** Stock sheet(s) to use */
  stockSheet: StockSheet | StockSheet[]

  /** Bin packing algorithm */
  algorithm?: NestingAlgorithm

  /** Allowed rotation angles (degrees) */
  allowedRotations?: number[]

  /** Kerf (minimum distance between shapes) */
  kerf?: number

  /** Margin from sheet edge */
  margin?: number

  /** Sort strategy for shape ordering */
  sortBy?: SortStrategy

  /** Maximum number of sheets */
  maxSheets?: number

  /** Keep shapes from the same layer together */
  respectLayers?: boolean

  /** Respect material grain direction */
  respectGrain?: boolean

  /** Approximation quality for curves (segments per 360°) */
  curveSegments?: number

  /** Whether to include convex hull computation */
  computeConvexHull?: boolean
}

// ─────────────────────────────────────────────
// Bin Packing Internal Types
// ─────────────────────────────────────────────

/** A free rectangle in the bin packing space */
export interface FreeRect {
  x: number
  y: number
  width: number
  height: number
}

/** A node in the guillotine split tree */
export interface GuillotineNode {
  rect: FreeRect
  used: boolean
  splitAxis?: 'horizontal' | 'vertical'
  left?: GuillotineNode
  right?: GuillotineNode
}

/** Shelf in the shelf algorithm */
export interface Shelf {
  y: number
  height: number
  remainingWidth: number
  currentX: number
  items: Placement[]
}

// ─────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────

/** Shape extraction result */
export interface ExtractionResult {
  shapes: NestableShape[]
  compoundShapes: CompoundShape[]
  skippedEntities: Array<{ type: string; reason: string }>
}

/** Collision detection result */
export interface CollisionResult {
  collides: boolean
  overlapArea?: number
  separatingAxis?: Point2D
}

/** Metrics for a nesting run */
export interface NestingMetrics {
  totalShapes: number
  placedShapes: number
  unplacedShapes: number
  sheetsUsed: number
  utilization: number
  wasteArea: number
  processingTimeMs: number
  algorithm: NestingAlgorithm
}
