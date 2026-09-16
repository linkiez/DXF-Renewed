/**
 * Nesting Optimization (feature 003-nesting-optimization-gpu)
 *
 * Public surface for the caller-weighted objective and the optional WebGPU acceleration path.
 * Re-exports real behavior, not an organizational shell (Constitution I).
 *
 * @module nesting/optimization
 */

export {
  OBJECTIVE_KEYS,
  normalizeObjective,
  scoreLayout,
} from './objective'
export type {
  ObjectiveKey,
  ObjectiveResult,
  NormalizedObjective,
  InvalidObjective,
  LayoutMetrics,
} from './objective'

export {
  ACCELERATION_GAIN_FACTOR,
  selectBackend,
  selectBackendAsync,
  createBackendReport,
  meetsAccelerationGate,
} from './backend'
export type { BackendSelection } from './backend'

export { probeGpu, requestGpuDevice } from './webgpu/device'
export type {
  GpuAdapterLike,
  GpuDeviceLike,
  GpuLike,
  GpuCapableNavigator,
  GpuProbeResult,
  GpuDeviceResult,
} from './webgpu/device'

export {
  FIXED_POINT_SCALE,
  fixedPointScore,
  proposeOrder,
} from './webgpu/score'
export type { CandidateProposal } from './webgpu/score'
