// HATCH entity type

import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

/**
 * Hatch pattern information
 */
export interface HatchPattern {
  /** Pattern line count */
  lineCount?: number
  /** Pattern angle */
  angle?: number
  /** Pattern X offset */
  x?: number
  /** Pattern Y offset */
  y?: number
  /** Pattern X spacing offset */
  offsetX?: number
  /** Pattern Y spacing offset */
  offsetY?: number
  /** Dash count */
  dashCount?: number
  /** Pattern line lengths */
  length: Array<string | number>
}

/**
 * Hatch boundary loop
 */
export interface HatchLoop {
  /** Loop type flags */
  type?: number
  /** Entity count in loop */
  count?: number
  /** Edge type (for non-polyline) */
  edgeType?: number
  /** Has bulge flag (for polyline) */
  hasBulge?: number
  /** Source object count */
  sourceObjects?: number
  /** Loop entities */
  entities: any[]
  /** Reference handles */
  references: Array<string | number>
}

/**
 * Hatch boundary definition
 */
export interface HatchBoundary {
  /** Total boundary loop count */
  count?: number
  /** Boundary loops */
  loops: HatchLoop[]
}

/**
 * Hatch seed point
 */
export interface HatchSeed {
  x: number
  y: number
}

/**
 * Hatch seeds collection
 */
export interface HatchSeeds {
  /** Seed point count */
  count: number
  /** Seed points */
  seeds: HatchSeed[]
}

/**
 * Hatch color/gradient information
 */
export interface HatchColor {
  /** Color count */
  count?: number
  /** Color rotation */
  rotation?: string | number
  /** Gradient definition */
  gradient?: string | number
  /** Color tint value */
  tint?: string | number
}

export interface HatchEntity extends BaseEntity {
  type: 'HATCH'
  /** Pattern name */
  patternName?: string | number
  /** Elevation point */
  elevation?: Partial<Point3D>
  /** Extrusion direction vector */
  extrusionDir?: Point3D
  /** Fill color index */
  fillColor?: string | number
  /** Fill type (SOLID or PATTERN) */
  fillType?: 'SOLID' | 'PATTERN'
  /** Hatch pattern information */
  pattern?: HatchPattern
  /** Hatch boundary definition */
  boundary?: HatchBoundary
  /** Hatch seed points */
  seeds?: HatchSeeds
  /** Hatch style (0=Normal, 1=Outer, 2=Ignore) */
  style?: number
  /** Hatch type (0=User-defined, 1=Predefined, 2=Custom) */
  hatchType?: number
  /** Shadow pattern angle */
  shadowPatternAngle?: number
  /** Pattern spacing */
  spacing?: number
  /** Double hatch flag */
  double?: boolean
  /** Solid or gradient fill type */
  solidOrGradient?: 'SOLID' | 'GRADIENT'
  /** Color/gradient information */
  color?: HatchColor
  
  /** Legacy: paths array (kept for compatibility) */
  paths?: any[]
  /** Legacy: fill color RGB (kept for compatibility) */
  // fillColor already defined above with different type
}
