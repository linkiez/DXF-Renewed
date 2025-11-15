// DXF Tables parsing types

import type { Point2D, Point3D } from './common'

/**
 * Partial point for parsing (all coordinates optional)
 */
export type PartialPoint2D = Partial<Point2D>

/**
 * Partial 3D point for parsing (all coordinates optional)
 */
export type PartialPoint3D = Partial<Point3D>

/**
 * DXF Header section result
 */
export interface ParsedHeader {
  /** Minimum drawing extents */
  extMin?: PartialPoint3D
  /** Maximum drawing extents */
  extMax?: PartialPoint3D
  /** Drawing units for measurement (0=English, 1=Metric) */
  measurement?: string | number
  /** Default drawing units for AutoCAD DesignCenter blocks */
  insUnits?: string | number
  /** Dimension arrow size */
  dimArrowSize?: string | number | Record<string, unknown>
}

/**
 * Block table entry
 * Internal representation during DXF parsing
 */
export interface BlockInternal {
  /** Block name */
  name?: string | number
  /** Base point X coordinate */
  x?: string | number
  /** Base point Y coordinate */
  y?: string | number
  /** Base point Z coordinate */
  z?: string | number
  /** External reference path */
  xref?: string | number
  /** Paper space flag */
  paperSpace?: string | number
  /** Layout name reference */
  layout?: string | number
  /** Entities within this block */
  entities?: any[]
}

/**
 * Line type element definition
 * Represents a single element in a complex line type pattern
 */
export interface LTypeElement {
  /** Length of the element */
  length?: string | number
  /** Scale factors for the element */
  scales?: Array<string | number>
  /** Offset positions for the element */
  offset?: Array<{ x: string | number; y: string | number }>
  /** Shape definition code */
  shape?: string | number
  /** Shape number reference */
  shapeNumber?: string | number
  /** Style handle reference */
  styleHandle?: string | number
  /** Rotation angle */
  rotation?: string | number
  /** Text content for text elements */
  text?: string | number
}

/**
 * Line Type (LTYPE) table entry
 * Internal representation during DXF parsing
 */
export interface LTypeInternal {
  type: string
  /** Pattern elements that define the line type */
  pattern: LTypeElement[]
  /** Line type name */
  name?: string | number
  /** Line type description */
  description?: string | number
  /** Standard flag values (bit-coded) */
  flag?: string | number
  /** Alignment code (ASCII code for 'A' = 65) */
  alignment?: string | number
  /** Number of elements in the pattern */
  elementCount?: number
  /** Total pattern length */
  patternLength?: string | number
}

/**
 * Layer table entry
 * Internal representation during DXF parsing
 */
export interface LayerInternal {
  type: string
  /** Layer name */
  name?: string | number
  /** Line type name for this layer */
  lineTypeName?: string | number
  /** ACI color number */
  colorNumber?: string | number
  /** Standard flags (bit-coded) */
  flags?: string | number
  /** Plot flag */
  plot?: boolean
  /** Line weight enumeration */
  lineWeightEnum?: string | number
}

/**
 * Text Style (STYLE) table entry
 * Internal representation during DXF parsing
 */
export interface StyleInternal {
  type: string
  /** Style name */
  name?: string | number
  /** Line type name */
  lineTypeName?: string | number
  /** Fixed text height (0 if variable) */
  fixedTextHeight?: string | number
  /** Width factor */
  widthFactor?: string | number
  /** Oblique angle */
  obliqueAngle?: string | number
  /** Standard flags (bit-coded) */
  flags?: string | number
  /** Last height used */
  lastHeightUsed?: string | number
  /** Primary font file name */
  primaryFontFileName?: string | number
  /** Big font file name */
  bigFontFileName?: string | number
}

/**
 * Viewport (VPORT) table entry
 * Internal representation during DXF parsing
 */
export interface VPortInternal {
  type: string
  /** Viewport name */
  name?: string | number
  /** Handle reference */
  handle?: string | number
  /** Standard flags (bit-coded) */
  flags?: string | number
  /** Lower-left corner coordinates */
  lowerLeft: { x?: number; y?: number }
  /** Upper-right corner coordinates */
  upperRight: { x?: number; y?: number }
  /** Center point coordinates */
  center: { x?: number; y?: number }
  /** Snap settings */
  snap?: Record<string, unknown>
  /** Snap spacing */
  snapSpacing: { x?: number; y?: number }
  /** Grid spacing */
  gridSpacing: { x?: number; y?: number }
  /** View direction from target */
  direction: { x?: number; y?: number; z?: number }
  /** View target point */
  target: { x?: number; y?: number; z?: number }
  /** View height */
  height?: number
  /** Snap rotation angle */
  snapAngle?: number
  /** View twist angle */
  angle?: number
  /** UCS origin X coordinate */
  x?: number
  /** UCS origin Y coordinate */
  y?: number
  /** UCS origin Z coordinate */
  z?: number
  /** UCS X-axis X component */
  xAxisX?: number
  /** UCS X-axis Y component */
  xAxisY?: number
  /** UCS X-axis Z component */
  xAxisZ?: number
  /** View elevation */
  elevation?: number
}

/**
 * Layout object entry
 * Internal representation during DXF parsing
 */
export interface LayoutInternal {
  /** Layout name */
  name?: string | number
  /** Handle reference */
  handle?: string | number
  /** Minimum limits X coordinate */
  minLimitX?: number
  /** Minimum limits Y coordinate */
  minLimitY?: number
  /** Maximum limits X coordinate */
  maxLimitX?: number
  /** Maximum limits Y coordinate */
  maxLimitY?: number
  /** Base point X coordinate */
  x?: number
  /** Base point Y coordinate */
  y?: number
  /** Base point Z coordinate */
  z?: number
  /** Minimum extents X coordinate */
  minX?: number
  /** Minimum extents Y coordinate */
  minY?: number
  /** Minimum extents Z coordinate */
  minZ?: number
  /** Maximum extents X coordinate */
  maxX?: number
  /** Maximum extents Y coordinate */
  maxY?: number
  /** Maximum extents Z coordinate */
  maxZ?: number
  /** Layout flag (PSLTSCALE or LIMCHECK) */
  flag?: 'PSLTSCALE' | 'LIMCHECK'
  /** Tab order */
  tabOrder?: string | number
  /** Elevation */
  elevation?: number
  /** UCS origin X coordinate */
  ucsX?: number
  /** UCS origin Y coordinate */
  ucsY?: number
  /** UCS origin Z coordinate */
  ucsZ?: number
  /** UCS X-axis X component */
  ucsXaxisX?: number
  /** UCS X-axis Y component */
  ucsXaxisY?: number
  /** UCS X-axis Z component */
  ucsXaxisZ?: number
  /** UCS Y-axis X component */
  ucsYaxisX?: number
  /** UCS Y-axis Y component */
  ucsYaxisY?: number
  /** UCS Y-axis Z component */
  ucsYaxisZ?: number
  /** UCS orthographic type */
  ucsType?: 'NOT ORTHOGRAPHIC' | 'TOP' | 'BOTTOM' | 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT'
  /** Associated table record handle */
  tableRecord?: string | number
  /** Last active viewport handle */
  lastActiveViewport?: string | number
  /** Shade plot mode */
  shadePlot?: string | number
}

/**
 * DXF Objects section result
 */
export interface ParsedObjects {
  /** Layout objects */
  layouts: LayoutInternal[]
}
