/**
 * Nesting Optimization — WebGPU Device Probe
 *
 * Zero-dependency structural detection of a WebGPU entry point on `globalThis.navigator.gpu`.
 * No `@webgpu/types`, no polyfill, no `any`/`unknown` in the core domain (Constitution V).
 *
 * Capability probing is synchronous, while device acquisition and compute dispatch are async.
 * On Node (no adapter) acquisition reports a reason and the search stays on the CPU baseline.
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

/** Minimal GPU buffer surface used by the scoring dispatch. */
export interface GpuBufferLike {
  destroy(): void
  mapAsync(mode: number): Promise<void>
  getMappedRange(): ArrayBuffer
  unmap(): void
}

/** Minimal compute pass surface used by the scoring dispatch. */
export interface GpuComputePassLike {
  setPipeline(pipeline: GpuComputePipelineLike): void
  setBindGroup(index: number, bindGroup: GpuBindGroupLike): void
  dispatchWorkgroups(workgroupCount: number): void
  end(): void
}

/** Minimal compute pipeline surface used by the scoring dispatch. */
export interface GpuComputePipelineLike {
  getBindGroupLayout(index: number): GpuBindGroupLayoutLike
}

/** Minimal bind-group layout surface used by the scoring dispatch. */
export type GpuBindGroupLayoutLike = object

/** Minimal bind-group surface used by the scoring dispatch. */
export type GpuBindGroupLike = object

/** Minimal command encoder surface used by the scoring dispatch. */
export interface GpuCommandEncoderLike {
  beginComputePass(): GpuComputePassLike
  copyBufferToBuffer(
    source: GpuBufferLike,
    sourceOffset: number,
    destination: GpuBufferLike,
    destinationOffset: number,
    size: number,
  ): void
  finish(): object
}

/** Minimal queue surface used by the scoring dispatch. */
export interface GpuQueueLike {
  writeBuffer(buffer: GpuBufferLike, offset: number, data: ArrayBuffer): void
  submit(commands: object[]): void
}

/** Device surface required for the fixed-point compute scorer. */
export interface GpuComputeDeviceLike extends GpuDeviceLike {
  readonly queue: GpuQueueLike
  createShaderModule(descriptor: { code: string }): object
  createComputePipeline(descriptor: {
    layout: 'auto'
    compute: { module: object; entryPoint: string }
  }): GpuComputePipelineLike
  createBuffer(descriptor: { size: number; usage: number }): GpuBufferLike
  createBindGroup(descriptor: {
    layout: GpuBindGroupLayoutLike
    entries: Array<{ binding: number; resource: { buffer: GpuBufferLike } }>
  }): GpuBindGroupLike
  createCommandEncoder(): GpuCommandEncoderLike
}

/** WebGPU usage flags needed by the storage, copy and readback buffers. */
export const GPU_BUFFER_USAGE = {
  MAP_READ: 0x0001,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  STORAGE: 0x0080,
} as const

/** Map mode used to read the completed score buffer. */
export const GPU_MAP_MODE_READ = 0x0001

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
  device?: GpuComputeDeviceLike
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
    const device = await adapter.requestDevice()
    if (!isGpuComputeDevice(device)) {
      return {
        reason: 'WebGPU device does not support compute scoring',
      }
    }
    return { device }
  } catch (error) {
    return {
      reason: `WebGPU device acquisition failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Returns whether a device exposes the compute operations required by the scorer.
 *
 * @param device - Structurally typed WebGPU device candidate
 * @returns `true` when the device can run the fixed-point scoring pipeline
 */
export function isGpuComputeDevice(
  device: GpuDeviceLike,
): device is GpuComputeDeviceLike {
  const candidate = device as Partial<GpuComputeDeviceLike>
  return (
    candidate.queue !== undefined &&
    typeof candidate.createShaderModule === 'function' &&
    typeof candidate.createComputePipeline === 'function' &&
    typeof candidate.createBuffer === 'function' &&
    typeof candidate.createBindGroup === 'function' &&
    typeof candidate.createCommandEncoder === 'function'
  )
}
