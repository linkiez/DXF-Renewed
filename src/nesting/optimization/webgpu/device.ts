/**
 * Nesting Optimization — WebGPU Device Probe
 *
 * Zero-dependency structural detection of a WebGPU entry point on `globalThis.navigator.gpu`.
 * No `@webgpu/types`, no polyfill, no `any`/`unknown` in the core domain (Constitution V).
 *
 * The probe is synchronous on purpose: `nestTrueShape` is pure and synchronous, so acceleration
 * may only engage on presence of `navigator.gpu`. On Node (no adapter) the probe reports a reason
 * and the search stays on the CPU baseline.
 *
 * @module nesting/optimization/webgpu/device
 */

/** Minimal structural view of a WebGPU adapter. */
export interface GpuAdapterLike {
  requestDevice(): Promise<GpuDeviceLike>
}

/** Minimal structural view of a WebGPU device. */
export interface GpuDeviceLike {
  destroy(): void
}

/** Minimal structural view of `navigator.gpu`. */
export interface GpuLike {
  requestAdapter(): Promise<GpuAdapterLike | null>
}

/** The slice of `navigator` the probe reads. */
export interface GpuCapableNavigator {
  readonly gpu?: GpuLike
}

/** Result of the synchronous capability probe. */
export interface GpuProbeResult {
  available: boolean
  /** Populated whenever `available` is false, so fallback is never silent (FR-006). */
  reason?: string
}

/** Reads `globalThis.navigator.gpu` without assuming a browser or a DOM type. */
export function probeGpu(): GpuProbeResult {
  const scope = globalThis as { navigator?: GpuCapableNavigator }
  const gpu = scope.navigator?.gpu
  if (!gpu) {
    return {
      available: false,
      reason: 'WebGPU unavailable: navigator.gpu is not present',
    }
  }
  return { available: true }
}

/** Result of async device acquisition: either a device or an explicit reason (never a throw). */
export interface GpuDeviceResult {
  device?: GpuDeviceLike
  reason?: string
}

/**
 * Asynchronously acquires a WebGPU device. Absence or failure returns an explicit reason instead
 * of throwing, so the caller can fall back to the CPU baseline (FR-004/FR-006).
 */
export async function requestGpuDevice(): Promise<GpuDeviceResult> {
  const scope = globalThis as { navigator?: GpuCapableNavigator }
  const gpu = scope.navigator?.gpu
  if (!gpu) {
    return { reason: 'WebGPU unavailable: navigator.gpu is not present' }
  }
  try {
    const adapter = await gpu.requestAdapter()
    if (!adapter) {
      return { reason: 'WebGPU unavailable: no adapter returned' }
    }
    return { device: await adapter.requestDevice() }
  } catch (error) {
    return {
      reason: `WebGPU device acquisition failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
