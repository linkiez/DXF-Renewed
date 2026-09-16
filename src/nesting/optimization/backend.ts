/**
 * Nesting Optimization — Backend Selection & Report
 *
 * FR-004/FR-006/FR-007: pick CPU or WebGPU, and always return a report with backend, timing and an
 * explicit fallback reason. Silent failure is forbidden.
 *
 * @module nesting/optimization/backend
 */

import type { ExecutionBackend, ExecutionBackendReport } from '../types'
import { probeGpu, requestGpuDevice } from './webgpu/device'
import type {
  GpuComputeDeviceLike,
  GpuDeviceResult,
  GpuProbeResult,
} from './webgpu/device'

/** SC-004 acceleration gate: the accelerator must beat the baseline by this factor. */
export const ACCELERATION_GAIN_FACTOR = 2

/** Chosen backend plus the metadata needed to build the public report. */
export interface BackendSelection {
  backend: ExecutionBackend
  requested: boolean
  accelerated: boolean
  fallbackReason?: string
  device?: GpuComputeDeviceLike
}

/**
 * Selects the backend candidate. `acceleration: false` pins the CPU baseline without probing.
 * When acceleration is requested, an available WebGPU capability is returned as a candidate;
 * `nestTrueShape` performs dispatch, parity validation and the SC-004 gate before publishing it.
 *
 * ponytail: ceiling = synchronous selection cannot execute or benchmark the device; upgrade =
 * use `selectBackendAsync` through `nestTrueShape` for the complete dispatch and gate.
 */
export function selectBackend(
  acceleration: boolean | undefined,
  probe: GpuProbeResult = probeGpu(),
): BackendSelection {
  const requested = acceleration !== false
  if (!requested) {
    return { backend: 'cpu', requested: false, accelerated: false }
  }
  return probe.available
    ? { backend: 'webgpu', requested: true, accelerated: true }
    : {
        backend: 'cpu',
        requested: true,
        accelerated: false,
        fallbackReason: probe.reason ?? 'WebGPU unavailable',
      }
}

/**
 * Async sibling of {@link selectBackend}: awaits real device acquisition instead of only probing
 * presence. It returns a compute-capable device candidate; the caller must still dispatch scoring,
 * validate CPU parity and pass the SC-004 gate before publishing an accelerated report
 * (FR-004/FR-006/FR-007).
 */
export async function selectBackendAsync(
  acceleration: boolean | undefined,
  requestDevice: () => Promise<GpuDeviceResult> = requestGpuDevice,
): Promise<BackendSelection> {
  const requested = acceleration !== false
  if (!requested) {
    return { backend: 'cpu', requested: false, accelerated: false }
  }
  const result = await requestDevice()
  return result.device
    ? {
        backend: 'webgpu',
        requested: true,
        accelerated: true,
        device: result.device,
      }
    : {
        backend: 'cpu',
        requested: true,
        accelerated: false,
        fallbackReason: result.reason ?? 'WebGPU unavailable',
      }
}

/** Builds the public report. Timings are measurement only — never a search budget (FR-007). */
export function createBackendReport(
  selection: BackendSelection,
  timings: { scoringMs: number; totalMs: number },
): ExecutionBackendReport {
  const report: ExecutionBackendReport = {
    backend: selection.backend,
    requested: selection.requested,
    accelerated: selection.accelerated,
    timings,
  }
  if (selection.fallbackReason !== undefined) {
    report.fallbackReason = selection.fallbackReason
  }
  return report
}

/**
 * SC-004 gate: `true` when the accelerated path reached at least `ACCELERATION_GAIN_FACTOR`× the
 * reference baseline. A zero or invalid accelerated timing never counts as a pass.
 */
export function meetsAccelerationGate(
  baselineMs: number,
  acceleratedMs: number,
): boolean {
  if (!(baselineMs > 0) || !(acceleratedMs > 0)) return false
  return baselineMs / acceleratedMs >= ACCELERATION_GAIN_FACTOR
}
