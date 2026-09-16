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
  StockItem,

  // True-shape nesting request/result types
  PartRequest,
  NestRequest,
  NestResponse,
  UnplacedPart,

  // Optimization & acceleration types (feature 003)
  OptimizationObjective,
  ExecutionBackend,
  ExecutionBackendReport,

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
// Cut-path planning (feature 004)
// ─────────────────────────────────────────────

export type {
  CutAction,
  CutActionKind,
  CutActionMetadata,
  CutCurve,
  CutContour,
  CutLayout,
  CutPathProblem,
  CutPathProblemCode,
  CutPathProblemSeverity,
  CutPlan,
  CutPlanMetrics,
  CutPlanResult,
  CutPlanStats,
  CutProcessProfile,
  CutSequenceStrategy,
  ClearanceRules,
  CommonLineOptions,
  CommonLineCandidate,
  LeadSpec,
  OvercutSpec,
  PierceSpec,
  SequenceOptions,
  TabSpec,
} from './cutPath'

export {
  contourBounds,
  contourClearance,
  isContourWithinSheet,
  pointOnOrInsidePolygon,
  pointToSegmentDistance,
  rapidCrossesContour,
  rapidRouteDistance,
  routeDistance,
  transformedContour,
  validateCutGeometry,
  validateCutLayout,
  validateCutProcessProfile,
  validateRapidRoute,
  planCutPath,
  sequenceContours,
  leadCandidate,
  overcutCandidate,
  pierceCandidate,
  tabCandidates,
} from './cutPath'

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
  DEFAULT_EDGE_CLEARANCE,
  DEFAULT_PART_TO_PART_CLEARANCE,
  DEFAULT_SEARCH_BUDGET_FACTOR,
  DEFAULT_OBJECTIVE_WEIGHTS,
  DEFAULT_ACCELERATION,
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

// ─────────────────────────────────────────────
// Modular post-processing (feature 005)
// ─────────────────────────────────────────────

export {
  canonicalizeGcode,
  generateMachineProgram,
  GcodeWriter,
  linearizeCutPlan,
  listPostProcessors,
  registerPostProcessor,
  resolvePostProcessor,
  validateEmittedPlan,
  validateMachineProfile,
  validateProcessor,
} from './post'
export type {
  MachineKind,
  MachineProfile,
  MachineProgram,
  PostContext,
  PostProcessingContext,
  PostProcessor,
  PostProcessorContext,
  PostProcessorSummary,
  Units,
  ValidationIssue,
} from './post'

// ─────────────────────────────────────────────
// Part preparation (feature 001-part-preparation)
// ─────────────────────────────────────────────

export { prepareParts } from './pro/partPrep/index'
export type {
  BBox,
  Boundary,
  Classification,
  IssueCode,
  PrepareOptions,
  PrepareResult,
  PreparedPart,
  PreparationIssue,
  Repair,
  SourceRef,
  Unit,
  Warning,
} from './pro/types'

// ─────────────────────────────────────────────
// True-shape nesting (feature 002-true-shape-nesting)
// ─────────────────────────────────────────────

export { nestTrueShape } from './trueShape/index'
export {
  OBJECTIVE_KEYS,
  normalizeObjective,
  scoreLayout,
  ACCELERATION_GAIN_FACTOR,
  selectBackend,
  selectBackendAsync,
  createBackendReport,
  meetsAccelerationGate,
  probeGpu,
  requestGpuDevice,
  FIXED_POINT_SCALE,
  createGpuScorer,
  dispatchGpuScores,
  fixedPointScore,
  proposeOrder,
} from './optimization/index'
export type {
  ObjectiveKey,
  ObjectiveResult,
  NormalizedObjective,
  InvalidObjective,
  LayoutMetrics,
  BackendSelection,
  CandidateProposal,
  GpuDeviceResult,
} from './optimization/index'
export {
  isWithinBounds,
  polygonDistance,
  isSeparated,
  isSeparatedFromAll,
  candidateAnchors,
  candidatePositions,
  effectiveRotations,
  resolveAllowedRotations,
  materialUse,
  searchBestArrangement,
  searchBestArrangementAsync,
  SearchBudget,
} from './trueShape/index'
export type { AsyncScorer } from './trueShape/index'

// ─────────────────────────────────────────────
// Stateless ERP nesting contract (feature 006)
// ─────────────────────────────────────────────

export { calculateErpNesting } from './erp/flow'
export * from './erp'
