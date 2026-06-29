// Nesting types for DXF-Renewed

/** A single part extracted from a DXF for nesting */
export interface NestPart {
  id: string
  layer: string
  /** Outer contour vertices */
  vertices: [number, number][]
  /** Inner holes (each is a closed contour) */
  holes: [number, number][][]
  /** RGB color from DXF layer */
  color?: [number, number, number]
  /** Bounding box */
  bbox: { x: number; y: number; w: number; h: number }
  /** Approximate area in DXF units² */
  area: number
}

/** Final placement of a part after nesting */
export interface NestPlacement {
  partId: string
  layer: string
  /** Translation applied to place the part */
  x: number
  y: number
  /** Rotation in degrees applied to the part */
  rotation: number
  /** Original vertices (before placement) */
  vertices: [number, number][]
  /** Final vertices (after placement) */
  placedVertices: [number, number][]
  color?: [number, number, number]
}

/** Configuration for the nesting algorithm */
export interface NestOptions {
  /** Bin (chapa) size in DXF units */
  binSize: { width: number; height: number }
  /** Minimum spacing between parts (kerf) */
  spacing: number
  /** Curve tolerance for linear approximation */
  curveTolerance: number
  /** Number of rotation angles to evaluate per part (0 = no rotation) */
  maxRotations: number
  /** Enable part-in-part (use holes of other parts) */
  partInPart: boolean
  /** GA population size */
  gaPopulation: number
  /** GA mutation rate (1-50) */
  gaMutationRate: number
  /** Max GA generations before stopping */
  maxIterations: number
  /** Explore concave areas for better packing */
  exploreConcave: boolean
  /** Progress callback: (iteration, bestFitness) => void */
  onProgress?: (iteration: number, bestFitness: number) => void
}

/** Default nesting options */
export const DEFAULT_NEST_OPTIONS: Omit<NestOptions, 'binSize'> = {
  spacing: 0.2,
  curveTolerance: 0.1,
  maxRotations: 4,
  partInPart: false,
  gaPopulation: 10,
  gaMutationRate: 10,
  maxIterations: 100,
  exploreConcave: false,
}

/** Nesting presets for different cutting processes */
export const NEST_PRESETS: Record<string, Partial<Omit<NestOptions, 'binSize'>>> = {
  laser: { spacing: 0.2, curveTolerance: 0.05, maxRotations: 4, gaPopulation: 15, gaMutationRate: 10 },
  plasma: { spacing: 2.0, curveTolerance: 0.5, maxRotations: 4, gaPopulation: 10, gaMutationRate: 8 },
  waterjet: { spacing: 1.0, curveTolerance: 0.1, maxRotations: 8, gaPopulation: 12, gaMutationRate: 10 },
  cnc: { spacing: 0.5, curveTolerance: 0.05, maxRotations: 4, gaPopulation: 10, gaMutationRate: 8 },
}

/** Detailed metrics about a nesting result */
export interface NestMetrics {
  totalParts: number
  placedParts: number
  unplacedParts: number
  totalPartArea: number
  binArea: number
  utilizationPercent: number
  wastePercent: number
  binsUsed: number
  avgPartArea: number
  maxPartArea: number
  minPartArea: number
  processingTimeMs: number
  gaIterations: number
  bestFitness: number
}

/** Full result from a nesting operation */
export interface NestResult {
  placements: NestPlacement[]
  unplaced: NestPart[]
  metrics: NestMetrics
}

/** Common bin sizes for metal sheets (mm) */
export const COMMON_BIN_SIZES = {
  // Steel plates
  steel_4x2: { width: 2000, height: 4000 },
  steel_3x1_5: { width: 1500, height: 3000 },
  steel_2x1: { width: 1000, height: 2000 },
  // Aluminum sheets
  alum_4x2: { width: 2000, height: 4000 },
  alum_1_25x2_5: { width: 1250, height: 2500 },
  // Custom
  custom: { width: 1000, height: 1000 },
}
